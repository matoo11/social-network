import ChatBubble from "./ChatBubble";




export default function ChatPopup() {


    return (
        <>
            <div id="openchat" style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            }}
                className="z-10 hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl w-96 border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm w-[400px] h-[500px]">
                {/* header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Users
                    </h3>
                    <p className="text-xs text-blue-100 mt-1">Discover and connect</p>
                </div>
                <div className="mt-4 ml-4">
                    <ChatBubble />
                </div>
            </div>
        </>
    )
}