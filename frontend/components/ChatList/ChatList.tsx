// app/components/Chat/ChatList.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import styles from './ChatList.module.css';

type ChatItem = {
  id: string;
  name: string;
  lastMessage?: string;
  avatarUrl?: string;
};

type ChatListProps = {
  chats: ChatItem[];
  onSelectChat?: (chatId: string) => void;
};

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat }) => {
  return (
    <div className={styles.chatList}>
      <h3 className={styles.chatListTitle}>Chats</h3>
      <ul className={styles.chatListItems}>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={styles.chatListItem}
            onClick={() => onSelectChat?.(chat.id)}
          >
            {chat.avatarUrl && (
              <Image
                src={chat.avatarUrl}
                alt={chat.name}
                className={styles.avatar}
                width={36}
                height={36}
              />
            )}
            <div className={styles.chatInfo}>
              <span className={styles.chatName}>{chat.name}</span>
              {chat.lastMessage && (
                <span className={styles.lastMessage}>{chat.lastMessage}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
