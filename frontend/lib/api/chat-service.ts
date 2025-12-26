import WebSocketManager from "../util/web-socket-manager";

export const chatWS = new WebSocketManager('chat');

chatWS.onMessage(function (event) {
    const parsedData = JSON.parse(event.data);

    switch (parsedData.payLoadType) {
        case 'chatList':
            // console.log('users: ', parsedData.data.allUsers, parsedData.data.onlineUsers);
            // stateManager.loadRegisteredUsersList(parsedData.data.allUsers);
            // stateManager.loadOnlineUsersList(parsedData.data.onlineUsers);
            // stateManager.setSortedUserList();
            // chatService.renderChatSection('chat-section');
            break;
        case 'privateMessages':
            // stateManager.state.chat.chatMessages = parsedData.data;
            // stateManager.setSortedUserList();
            break;
        case 'messageSent':
            // chatService.renderMessageInput('private-message-input-container');
            // if (!stateManager.state.chat.chatMessages[parsedData.data.to])
            //     stateManager.state.chat.chatMessages[parsedData.data.to] = [];

            // stateManager.state.chat.chatMessages[parsedData.data.to].push(parsedData.data);

            // chatService.renderMessageCard('private-messages-feed', parsedData.data, 'append');
            // stateManager.setSortedUserList();
            // setTimeout(() => {
            //     chatService.renderChatSection('chat-section');
            // }, 50);
            break;
        case 'messageReceived':
            // if (!stateManager.state.chat.chatMessages[parsedData.data.from])
            //     stateManager.state.chat.chatMessages[parsedData.data.from] = [];

            // stateManager.state.chat.chatMessages[parsedData.data.from].push(parsedData.data);

            // if (stateManager.state.view.param === parsedData.data.from) {
            //     chatService.renderMessageCard('private-messages-feed', parsedData.data, 'append');
            // } else {
            //     chatService.showNotificationCard(parsedData.data.from, parsedData.data.messageText);
            // }

            // stateManager.setSortedUserList();
            // setTimeout(() => {
            //     chatService.renderChatSection('chat-section');
            // }, 50);
            break;
    }
});