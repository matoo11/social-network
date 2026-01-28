
let ws: WebSocket | null = null;

let forceDisconnect = false;

type WSMessage = {
    type: string;
    data: any;
};


export function InitWebSocket() {
    ws = new WebSocket('ws://localhost:8080/api/ws');

    ws.onopen = function () {
        console.log('Websocket Connected Successfully');
    };

    ws.onmessage = function (event) {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "userlist") {
            window.dispatchEvent(
                new CustomEvent("ws-userlist", { detail: msg.users })
            );
        } else if (msg.type === "chat") {
            window.dispatchEvent(
                new CustomEvent("ws-chat", { detail: msg.data })
            );
        } else if (msg.type === "notification") {
            window.dispatchEvent(
                new CustomEvent("ws-notification", { detail: msg.data })
            );
        }
    };

    ws.onclose = () => {
        if (forceDisconnect) {
            return;
        }
        console.log('Websocket disconnected')
    }

    ws.onerror = () => {
        console.log('fuck error')
    }


}

export function sendMessage(type: string, data: any) {
    ws?.send(JSON.stringify({ type: type, data: data }));
}