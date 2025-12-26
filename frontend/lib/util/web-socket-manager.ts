export default class WebSocketManager {
    private name: string;
    private ws: WebSocket | null;
    private onOpenHandler: ((event: Event) => void) | null;
    private onMessageHandler: ((event: MessageEvent) => void) | null;
    private onCloseHandler: ((event: CloseEvent) => void) | null;
    private onErrorHandler: ((error: Event) => void) | null;

    constructor(name: string = 'default') {
        this.name = name;
        this.ws = null;

        // Handlers (optional overrides)
        this.onOpenHandler = null;
        this.onMessageHandler = null;
        this.onCloseHandler = null;
        this.onErrorHandler = null;
    }

    async connect(url: string): Promise<void> {
        if (
            this.ws &&
            (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
        ) {
            console.log(`[${this.name}] WebSocket is already connected or connecting.`);
            return;
        }

        this.ws = new WebSocket(url);

        this.ws.onopen = (event: Event) => {
            console.log(`[${this.name}] WebSocket connected`);
            if (this.onOpenHandler) this.onOpenHandler(event);
        };

        this.ws.onmessage = (event: MessageEvent) => {
            console.groupCollapsed(`[${this.name}] Message received`);
            console.log(event.data);
            console.groupEnd();
            if (this.onMessageHandler) this.onMessageHandler(event);
        };

        this.ws.onclose = (event: CloseEvent) => {
            console.log(`[${this.name}] WebSocket closed`);
            if (this.onCloseHandler) this.onCloseHandler(event);
        };

        this.ws.onerror = (error: Event) => {
            console.error(`[${this.name}] WebSocket error:`, error);
            if (this.onErrorHandler) this.onErrorHandler(error);
        };
    }

    // Handler setters
    onOpen(callback: (event: Event) => void): void {
        this.onOpenHandler = callback;
    }

    onMessage(callback: (event: MessageEvent) => void): void {
        this.onMessageHandler = callback;
    }

    onClose(callback: (event: CloseEvent) => void): void {
        this.onCloseHandler = callback;
    }

    onError(callback: (error: Event) => void): void {
        this.onErrorHandler = callback;
    }

    disconnect(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
            console.log(`[${this.name}] WebSocket closed manually`);
        }
    }

    send(data: unknown): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn(`[${this.name}] WebSocket not open. Message not sent.`);
        }
    }

    getConnection(): WebSocket | null {
        return this.ws;
    }
}
