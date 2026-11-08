import { maxRelayTeams, relayMessageSchema } from '@pixoffice/protocol/relay';
/** Routes to existing runtime queues; the transport never owns an animation queue. */
export class SceneMessageClient {
    transport;
    receivers = new Map();
    disconnect;
    scheduled = false;
    status = '连接中';
    generation = 0;
    constructor(transport) { this.transport = transport; }
    get size() { return this.receivers.size; }
    register(runtime, onStatus = () => { }) {
        const existing = this.receivers.get(runtime.sceneId);
        if (existing && existing.runtime !== runtime)
            throw new Error(`Duplicate runtime for team ${runtime.sceneId}`);
        if (!existing && this.receivers.size >= maxRelayTeams)
            throw new Error(`最多支持 ${maxRelayTeams} 个办公室或团队`);
        const entry = existing ?? { runtime, listeners: new Set() };
        const listener = (status) => {
            try {
                onStatus(status);
            }
            catch (error) {
                console.warn('[SceneMessages] status observer failed', error);
            }
        };
        entry.listeners.add(listener);
        this.receivers.set(runtime.sceneId, entry);
        listener(this.status);
        if (!existing)
            this.scheduleConnection();
        let active = true;
        return () => {
            if (!active)
                return;
            active = false;
            entry.listeners.delete(listener);
            if (!entry.listeners.size) {
                this.receivers.delete(runtime.sceneId);
                this.scheduleConnection();
            }
        };
    }
    receive = (value) => {
        const parsed = relayMessageSchema.safeParse(value);
        if (!parsed.success) {
            console.warn('[SceneMessages] invalid message', parsed.error.message);
            return;
        }
        const message = parsed.data;
        const receiver = this.receivers.get(message.teamId);
        if (!receiver)
            return;
        try {
            const payload = message.command;
            const results = 'commands' in payload ? receiver.runtime.submitBatch(payload) : [receiver.runtime.submit(payload)];
            for (const result of results)
                if (result.error)
                    console.warn('[SceneMessages] command not executed', result);
        }
        catch (error) {
            console.warn('[SceneMessages] command rejected locally', error);
        }
    };
    scheduleConnection() {
        if (this.scheduled)
            return;
        this.scheduled = true;
        queueMicrotask(() => {
            this.scheduled = false;
            const generation = ++this.generation;
            const disconnect = this.disconnect;
            this.disconnect = undefined;
            try {
                disconnect?.();
            }
            catch (error) {
                console.warn('[SceneMessages] transport cleanup failed', error);
            }
            if (!this.receivers.size)
                return;
            this.updateStatus('连接中');
            try {
                this.disconnect = this.transport.connect({
                    teamIds: [...this.receivers.keys()].sort(),
                    onMessage: message => { if (generation === this.generation)
                        this.receive(message); },
                    onStatus: status => { if (generation === this.generation)
                        this.updateStatus(status); },
                });
            }
            catch (error) {
                this.updateStatus('未连接');
                console.warn('[SceneMessages] cannot open transport', error);
            }
        });
    }
    updateStatus(status) {
        this.status = status;
        for (const receiver of this.receivers.values())
            for (const listener of receiver.listeners)
                listener(status);
    }
}