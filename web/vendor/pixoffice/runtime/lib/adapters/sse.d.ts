import type { MessageReceiver, MessageTransport, TransportOptions } from './messages.ts';
export type EventSourcePort = Pick<EventSource, 'onopen' | 'onerror' | 'onmessage' | 'close'>;
export type EventSourceFactory = (url: string) => EventSourcePort;
export declare class SseMessageTransport implements MessageTransport {
    private readonly baseUrl;
    private readonly createEventSource;
    constructor(baseUrl?: string, createEventSource?: EventSourceFactory);
    connect({ teamIds, workspace, onMessage, onStatus }: TransportOptions): () => void;
}
export declare function connectSceneRelay(runtime: MessageReceiver, baseUrl: string, onStatus?: (status: string) => void): () => void;
