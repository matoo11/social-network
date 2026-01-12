
let ws: WebSocket | null = null;

let forceDisconnect = false;
import { UpdateUserList } from "../../components/UserList/UserList";

type WSMessage = {
    type: string;
    data: any;
};


export function InitWebSocket() {
    console.log('fuck')
    ws = new WebSocket('ws://localhost:8080/api/ws');

    ws.onopen = function () {
        console.log('Websocket Connected Successfully');
    };

    ws.onmessage = function (event) {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "userlist") {
            UpdateUserList(msg.users);
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

    console.log('sent')
    console.log(data)
    ws?.send(JSON.stringify({ type: type, data: data }));
}