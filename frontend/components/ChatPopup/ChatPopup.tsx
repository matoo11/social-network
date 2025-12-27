import ChatBubble from './ChatBubble';
import { createRoot } from 'react-dom/client';
// import { sendMessage } from '@/lib/api/chat-service';

let chatID: number;
let chatType: number;

chatID = 2;
chatType = 1;
export default function ChatPopup() {
    return (
        <>
            <div
                id="openchat"
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                className="z-10 hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm w-[400px] h-[550px] flex flex-col"
            >
                {/* header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span id="chatName">Chat name</span>
                    </h3>
                    <p className="text-xs text-blue-100 mt-1">Discover and connect</p>
                </div>

                {/* Messages area */}
                <div id="chatarea" className="flex-1 overflow-y-auto mt-4 ml-4"></div>

                {/* Message input bar */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                        <input
                            id="chatInput"
                            type="text"
                            placeholder="Type a message..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const input = e.target as HTMLInputElement;
                                    if (input.value.trim() !== '') {
                                        const data = {
                                            message: input.value.trim(),
                                            senderUsername: 'hello',
                                        };
                                        AddChatBubble(data, true);
                                        SendChatMessage(chatID, data.message, chatType);
                                        input.value = '';
                                    }
                                }
                            }}
                            className="flex-1 px-4 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500"
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById(
                                    'chatInput',
                                ) as HTMLInputElement | null;
                                if (input && input.value.trim() !== '') {
                                    const data = {
                                        message: input.value.trim(),
                                        senderUsername: 'hello',
                                    };
                                    AddChatBubble(data, true);
                                    SendChatMessage(chatID, data.message, chatType);
                                    input.value = '';
                                }
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export function AddChatBubble(
    data: { message: string; senderUsername: string },
    isSender: boolean,
) {
    const container = document.getElementById('chatarea');
    if (!container) return;

    const newDiv = document.createElement('div');

    const root = createRoot(newDiv);
    root.render(<ChatBubble data={data} isSender={isSender} />);

    container.appendChild(newDiv);
}

export function SendChatMessage(chatID: number, text: string, type: number) {
    const data = {
        type: type,
        chatID: chatID,
        message: text,
    };
    // sendMessage('chat', data);
}

export function ClearChat() {
    const container = document.getElementById('chatarea');
    if (!container) return;

    container.innerHTML = '';
}

//chat id if group and user id if private chat
//1 if private chat 2 if group chat
export function SetChatConf(id: number, type: number, chatName: string) {
    chatID = id;
    chatType = type;
    ClearChat();
    const name = document.getElementById('chatName');
    if (!name) {
        return;
    }
    name.innerText = chatName;
}
