export default class WebSocketManager {
    private name: string;
    private ws: WebSocket | null;
    private subscribers: Map<string, Set<(data: any) => void>>;

    constructor(name: string = 'default') {
        this.name = name;
        this.ws = null;
        this.subscribers = new Map();
    }

    async connect(url: string): Promise<void> {
        if (
            this.ws &&
            (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
        ) {
            console.log(`[${this.name}] WebSocket already connected/connecting.`);
            return;
        }

        this.ws = new WebSocket(url);

        this.ws.onopen = (event: Event) => {
            console.log(`[${this.name}] WebSocket connected`);
            this.publish('__open__', event);
        };

        this.ws.onmessage = (event: MessageEvent) => {
            let parsed: any;
            try {
                parsed = JSON.parse(event.data);
            } catch {
                // if not JSON, forward raw payload
                this.publish('*', event.data);
                return;
            }

            const type = parsed.payLoadType || parsed.type || '*';
            const data = parsed.data ?? parsed;

            // publish to specific type and wildcard subscribers
            this.publish(type, data);
            if (type !== '*') this.publish('*', { type, data });
        };

        this.ws.onclose = (event: CloseEvent) => {
            console.log(`[${this.name}] WebSocket closed`);
            this.publish('__close__', event);
        };

        this.ws.onerror = (error: Event) => {
            console.error(`[${this.name}] WebSocket error`, error);
            this.publish('__error__', error);
        };
    }

    // Simple pub/sub
    subscribe(eventType: string, callback: (data: any) => void): () => void {
        const set = this.subscribers.get(eventType) ?? new Set();
        set.add(callback);
        this.subscribers.set(eventType, set);

        // return unsubscribe function
        return () => {
            const s = this.subscribers.get(eventType);
            if (!s) return;
            s.delete(callback);
            if (s.size === 0) this.subscribers.delete(eventType);
        };
    }

    // Publish to subscribers (internal)
    private publish(eventType: string, data: any): void {
        const set = this.subscribers.get(eventType);
        if (set) {
            for (const cb of Array.from(set)) {
                try {
                    cb(data);
                } catch (e) {
                    console.error('subscriber error', e);
                }
            }
        }
    }

    send(data: unknown): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn(`[${this.name}] WebSocket not open. Message not sent.`);
        }
    }

    disconnect(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
            console.log(`[${this.name}] WebSocket closed manually`);
        }
        this.ws = null;
    }

    getConnection(): WebSocket | null {
        return this.ws;
    }
}
