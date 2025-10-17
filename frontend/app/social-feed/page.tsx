import ChatList from '@/components/ChatList/ChatList';
import PostList from '@/components/PostList/PostList';

export default function SocialFeed() {
    return (
        <div className="flex w-full h-screen mt-[10vh]">
            {/* Left column - 17.5% */}
            <div className="w-[17.5%] bg-blue-400 flex flex-col gap-2 fixed h-[90%]">
                <ChatList
                    chats={[
                        { id: '1', name: 'Alice', lastMessage: 'Hello!' },
                        { id: '2', name: 'Bob', lastMessage: 'How are you?' },
                        { id: '3', name: 'Charlie', lastMessage: 'See you later.' },
                        { id: '4', name: 'Diana', lastMessage: 'Let’s meet tomorrow.' },
                        { id: '5', name: 'Ethan', lastMessage: 'Can you call me?' },
                        { id: '6', name: 'Fiona', lastMessage: 'Got the files, thanks!' },
                        { id: '7', name: 'George', lastMessage: 'Where are you?' },
                        { id: '8', name: 'Hannah', lastMessage: 'Lunch at 1?' },
                        { id: '9', name: 'Ivan', lastMessage: 'I’ll check and let you know.' },
                        { id: '10', name: 'Julia', lastMessage: 'Awesome work today!' },
                        { id: '11', name: 'Kevin', lastMessage: 'I’ll be there in 10.' },
                        { id: '12', name: 'Laura', lastMessage: 'Don’t forget the meeting.' },
                        { id: '13', name: 'Mike', lastMessage: 'That sounds great!' },
                        { id: '14', name: 'Nina', lastMessage: 'Thanks for the update.' },
                        { id: '15', name: 'Oscar', lastMessage: 'Can we reschedule?' },
                        { id: '16', name: 'Paula', lastMessage: 'See you at the event.' },
                    ]}
                />
            </div>

            {/* Middle column - 52.5% */}
            <div className="w-[52.5%] bg-red-400 p-4 ml-[17.5%]">
                Middle (52.5%)
                <PostList />
            </div>

            {/* Right column - 30% */}
            <div className="w-[30%] bg-green-400 p-4 fixed h-[90%] right-0">Right (30%)</div>
        </div>
    );
}
