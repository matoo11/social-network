import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../ChatMessage/ChatMessage';
import { sendMessage } from '@/lib/api/websocket';
import { FaComments } from 'react-icons/fa';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

interface Message {
    id: number;
    username: string;
    text: string;
    type: 'sent' | 'received';
    time?: string;
}

interface ChatProps {
    chatter: string;
    chatWith: string;
    chatID: string;
}

function SendChatMessage(chatID: number, text: string, type: number) {
    const data = {
        type: type,
        chatID: chatID,
        message: text,
    };
    sendMessage('chat', data);
}

const ChatArea: React.FC<ChatProps> = ({ chatWith, chatter, chatID }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const loadMessages = async () => {

            if (!chatID || Number(chatID) === 0) {
                setMessages([]);
                return;
            }

            try {
                const res = await fetchWithAuth('http://localhost:8080/api/message/getPrivateMessages', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userID: Number(chatID) }),
                });

                const data = await res.json();

                // Ensure data is an array before mapping
                const list = Array.isArray(data) ? data : [];

                const mapped: Message[] = list.map((m: any) => ({
                    id: m.MessageID,
                    username: m.SenderID === Number(chatter) ? chatter : chatWith,
                    text: m.Content,
                    type: (m.IsSender ? 'sent' : 'received') as 'sent' | 'received',
                    time: m.CreationTime,
                }));

                setMessages(mapped);
            } catch (err) {
                console.error(err);
            }
        };

        loadMessages();
    }, [chatID, chatter, chatWith]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const listener = (e: any) => {
            const data = e.detail;

            // if (data.senderID !== chatWith && data.recieverID !== chatter) return;
            if (String(data.senderID) !== chatID) return;
            console.log(chatID);
            console.log(data);
            const incoming: Message = {
                id: Date.now(),
                username: data.senderUsername,
                text: data.message,
                type: 'received',
                time: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, incoming]);
        };

        window.addEventListener('ws-chat', listener);

        return () => window.removeEventListener('ws-chat', listener);
    }, [chatWith, chatter]);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            username: chatter,
            text: input,
            type: 'sent',
            time: new Date().toISOString(),
        };

        setMessages([...messages, newMessage]);
        SendChatMessage(Number(chatID), input, 1);
        // sendMessage("chat", {
        //     from: chatter,
        //     to: chatWith,
        //     message: input,
        // });

        // Trigger chat list refresh after sending message
        window.dispatchEvent(new CustomEvent('message-sent'));

        setInput('');

        // Simulate a response
        // setTimeout(() => {
        //     setMessages((prev) => [
        //         ...prev,
        //         { id: Date.now() + 1, text: 'Got it!', type: 'received' , username: chatWith},
        //     ]);
        // }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold border-b border-blue-800 shadow-md">
                <div className="flex items-center gap-2">
                    <FaComments className="text-lg" />
                    <span>Chatting with {chatWith}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-900">
                {messages.map((msg) => (
                    <ChatMessage
                        username={msg.username || 'Unknown'}
                        userImage=""
                        type={msg.type}
                        message={msg.text}
                        time={
                            msg.time
                                ? new Date(msg.time).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : ''
                        }
                        key={msg.id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-3 border-t border-gray-700 p-4 bg-gray-800">
                <input
                    type="text"
                    className="flex-1 rounded-lg border border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-400 bg-gray-700 text-white placeholder-gray-500 transition-all"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSend}
                    className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatArea;
