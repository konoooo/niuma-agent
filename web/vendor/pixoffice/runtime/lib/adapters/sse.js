import { maxRelayEventBytes, relayPaths } from '@pixoffice/protocol/relay';
import { parseProtocolObject } from '@pixoffice/protocol/schema';
import { SceneMessageClient } from "./messages.js";
export class SseMessageTransport {
    baseUrl;
    createEventSource;
    constructor(baseUrl = '', createEventSource = url => new EventSource(url)) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.createEventSource = createEventSource;
    }
    connect({ teamIds, workspace, onMessage, onStatus }) {
        const query = new URLSearchParams({ teams: teamIds.join(',') });
        if (workspace)
            query.set('workspace', '1');
        const source = this.createEventSource(`${this.baseUrl}${relayPaths.events}?${query}`);
        let active = true;
        source.onopen = () => { if (active)
            onStatus('已连接'); };
        source.onerror = () => { if (active)
            onStatus('重连中'); };
        source.onmessage = event => {
            if (!active)
                return;
            try {
                if (new TextEncoder().encode(event.data).byteLength > maxRelayEventBytes)
                    throw new Error('Message too large');
                onMessage(parseProtocolObject(event.data));
            }
            catch (error) {
                console.warn('[SceneSSE] invalid message skipped', error);
            }
        };
        return () => { active = false; source.onopen = null; source.onerror = null; source.onmessage = null; source.close(); };
    }
}
// One subscription per relay URL in this browser application, shared by all teams.
const clients = new Map();
export function connectSceneRelay(runtime, baseUrl, onStatus = () => { }) {
    const key = baseUrl.replace(/\/$/, '');
    let client = clients.get(key);
    if (!client) {
        client = new SceneMessageClient(new SseMessageTransport(key));
        clients.set(key, client);
    }
    const detach = client.register(runtime, onStatus);
    return () => { detach(); if (!client.size && clients.get(key) === client)
        clients.delete(key); };
}