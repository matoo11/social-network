import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../ChatMessage/ChatMessage';

interface Message {
    id: number;
    username: string;
    text: string;
    type: 'sent' | 'received';
}

interface ChatProps {
    chatter: string;
    chatWith: string;
}

const ChatArea: React.FC<ChatProps> = ({ chatWith , chatter}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            username: chatter,
            text: input,
            type: 'sent',
        };

        setMessages([...messages, newMessage]);
        setInput('');

        // Simulate a response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, text: 'Got it!', type: 'received' , username: chatWith},
            ]);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Header */}
            <div className="px-4 py-3 bg-blue-500 dark:bg-blue-600 text-white font-semibold rounded-t-lg">
                Chatting with {chatWith}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
                    <ChatMessage
                        username={msg.username || "Unknown"}
                        userImage=""
                        type={msg.type}
                        message={msg.text}
                        time={new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        key={msg.id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center border-t border-gray-300 dark:border-gray-600 p-2">
                <input
                    type="text"
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSend}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatArea;
