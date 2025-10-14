import ChatCard from "@/components/ChatCard/ChatCard"
import ChatList from "@/components/ChatList/ChatList"
import PostList from "@/components/PostList/PostList"

export default function SocialFeed() {
  return <div className="flex w-full h-screen">
  {/* Left column - 20% */}
  <div className="w-[20%] bg-blue-400 p-4 flex flex-col gap-2">
    Left (20%)
    {/* <ChatList chats={[]} /> */}
    <ChatCard username="John Doe" lastMessage="Hello there!"/>
    <ChatCard username="John Doe" lastMessage="Hello there!"/>
    <ChatCard username="John Doe" lastMessage="Hello there!"/>
  </div>

  {/* Middle column - 50% */}
  <div className="w-[50%] bg-red-400 p-4">
    Middle (50%)
    <PostList />
  </div>

  {/* Right column - 30% */}
  <div className="w-[30%] bg-green-400 p-4">
    Right (30%)
  </div>
</div>

}