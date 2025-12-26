// import React, { useState, useRef, useEffect } from 'react';
// import ChatMessage from '../ChatMessage/ChatMessage';
// import Title from '../Title/Title';
// import PopupBtn from '../PopupBtn/PopupBtn';

// interface Message {
//     id: number;
//     username: string;
//     text: string;
//     type: 'sent' | 'received';
//     time?: string;
// }

// interface ChatProps {
//     chatter: string;
//     chatWith: string;
//     chatID: string;
// }

// function SendChatMessage(chatID: number, text: string, type: number) {
//     const data = {
//         type: type,
//         chatID: chatID,
//         message: text,
//     };
//     sendMessage('chat', data);
// }

// const GroupChatArea: React.FC<ChatProps> = ({ chatWith, chatter, chatID }) => {
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [input, setInput] = useState('');
//     const messagesEndRef = useRef<HTMLDivElement | null>(null);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     };
//     console.log(chatWith);
//     useEffect(() => {
//         const loadMessages = async () => {
//             try {
//                 const res = await fetch('http://localhost:8080/api/message/getPrivateMessages', {
//                     method: 'POST',
//                     credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ userID: Number(chatID) }),
//                 });

//                 const data = await res.json();

//                 const mapped = data.map((m: any) => ({
//                     id: m.MessageID,
//                     username: m.SenderID === Number(chatter) ? chatter : chatWith,
//                     text: m.Content,
//                     type: m.IsSender ? 'sent' : 'received',
//                     time: m.CreationTime,
//                 }));

//                 setMessages(mapped);
//             } catch (err) {
//                 console.error(err);
//             }
//         };

//         loadMessages();
//     }, [chatID, chatter, chatWith]);

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     useEffect(() => {
//         const listener = (e: any) => {
//             const data = e.detail;

//             // if (data.senderID !== chatWith && data.recieverID !== chatter) return;
//             if (String(data.senderID) !== chatID) return;
//             console.log(chatID);
//             console.log(data);
//             const incoming: Message = {
//                 id: Date.now(),
//                 username: data.senderUsername,
//                 text: data.message,
//                 type: 'received',
//                 time: new Date().toISOString(),
//             };

//             setMessages((prev) => [...prev, incoming]);
//         };

//         window.addEventListener('ws-chat', listener);

//         return () => window.removeEventListener('ws-chat', listener);
//     }, [chatWith, chatter]);

//     const handleSend = () => {
//         if (!input.trim()) return;

//         const newMessage: Message = {
//             id: Date.now(),
//             username: chatter,
//             text: input,
//             type: 'sent',
//             time: new Date().toISOString(),
//         };

//         setMessages([...messages, newMessage]);
//         SendChatMessage(Number(chatID), input, 1);
//         // sendMessage("chat", {
//         //     from: chatter,
//         //     to: chatWith,
//         //     message: input,
//         // });

//         setInput('');

//         // Simulate a response
//         // setTimeout(() => {
//         //     setMessages((prev) => [
//         //         ...prev,
//         //         { id: Date.now() + 1, text: 'Got it!', type: 'received' , username: chatWith},
//         //     ]);
//         // }, 1000);
//     };

//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === 'Enter') handleSend();
//     };

//     return (
//         <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 rounded-lg">
//             {/* Header */}
//             {/* <div className="px-4 py-3 bg-blue-500 dark:bg-gray-900 text-white font-semibold rounded-t-lg">
//                 Chatting with {chatWith}
//             </div> */}

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-2">
//                 {messages.map((msg) => (
//                     <ChatMessage
//                         username={msg.username || 'Unknown'}
//                         userImage=""
//                         type={msg.type}
//                         message={msg.text}
//                         time={
//                             msg.time
//                                 ? new Date(msg.time).toLocaleTimeString([], {
//                                       hour: '2-digit',
//                                       minute: '2-digit',
//                                   })
//                                 : ''
//                         }
//                         key={msg.id}
//                     />
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>

//             {/* Input */}
//             <div className="flex items-center border-t border-gray-300 dark:border-gray-600 p-2">
//                 <input
//                     type="text"
//                     className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
//                     placeholder="Type a message..."
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                 />
//                 <button
//                     onClick={handleSend}
//                     className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-semibold"
//                 >
//                     Send
//                 </button>
//             </div>
//         </div>
//     );
// };

// // export default GroupChatArea;

// const Testing: React.FC<ChatProps> = ({ chatWith, chatter, chatID }) => {
//     return (
//         <>
//             <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
//                 <div className="flex justify-center gap-5 items-center h-[7.5%] pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
//                     <Title text="Chat" />
//                     {/* <PopupBtn className="mb-2" onClick={popupHandler} /> */}
//                 </div>
//                 <div className="h-[92.5%] overflow-y-auto hide-scrollbar">
//                     <div className="flex flex-col gap-2 p-4 h-full w-full">
//                         <GroupChatArea chatID={chatID} chatWith={chatWith} chatter={chatter} />
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Testing;
