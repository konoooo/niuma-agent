import type { SceneRuntime } from '../SceneRuntime.ts';
export type MessageReceiver = Pick<SceneRuntime, 'sceneId' | 'submit' | 'submitBatch'>;
export type TransportOptions = {
    teamIds: readonly string[];
    workspace?: boolean;
    onMessage: (message: unknown) => void;
    onStatus: (status: string) => void;
};
export interface MessageTransport {
    connect(options: TransportOptions): () => void;
}
/** Routes to existing runtime queues; the transport never owns an animation queue. */
export declare class SceneMessageClient {
    private readonly transport;
    private readonly receivers;
    private disconnect?;
    private scheduled;
    private status;
    private generation;
    constructor(transport: MessageTransport);
    get size(): number;
    register(runtime: MessageReceiver, onStatus?: (status: string) => void): () => void;
    receive: (value: unknown) => void;
    private scheduleConnection;
    private updateStatus;
}
