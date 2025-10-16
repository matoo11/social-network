
let ws: WebSocket;
let forceDisconnect = false;
import { UpdateUserList } from "../../components/UserList/UserList";

export function InitWebSocket() {
    console.log('fuck')
    ws = new WebSocket('ws://localhost:8080/api/ws');

    ws.onopen = function () {
        console.log('Websocket Connected Successfully');
    };

    ws.onmessage = function (event) {
        const msg = JSON.parse(event.data);
        console.log("here10")
        // console.log(msg)
        if (msg.Type === "userlist") {
            UpdateUserList(msg.Users);
            console.log("here")
        }
        console.log(msg)
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
    ws.send(JSON.stringify({ type: type, data: data }));
}