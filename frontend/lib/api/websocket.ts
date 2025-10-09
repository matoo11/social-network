
let ws: WebSocket;
let forceDisconnect = false;
import { UpdateUserList } from "../../components/UserList/UserList";

export function initWebSocket() {
    console.log('fuck')
    ws = new WebSocket('/api/ws');

    ws.onopen = function () {
        console.log('Websocket Connected Successfully');
    };

    ws.onmessage = function (event) {
        const msg = JSON.parse(event.data);

        if (msg.type === "user list") {
            UpdateUserList(msg);
        }
    };

    ws.onclose = () => {
        if (forceDisconnect) {
            return;
        }
        console.log('Websocket disconnected')


    }

    ws.onerror = () => {

    }


}

export function sendMessage(type: string, data: any) {

    console.log('sent')

    ws.send(JSON.stringify({ type: type, data: data }));
}