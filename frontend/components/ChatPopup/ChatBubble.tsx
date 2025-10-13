export default function ChatBubble({ isSender = false, text = "" }: { isSender?: boolean, text: string }) {
    return (
        <div className={`flex items-start gap-2.5 mb-4 ${isSender ? 'flex-row-reverse justify-end' : ''}`}>
            <img className="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-3.jpg" alt="Jese image" />
            <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 dark:bg-gray-700 ${isSender ? 'rounded-s-xl rounded-ee-xl' : 'rounded-e-xl rounded-es-xl'
                }`}>
                {!isSender && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
                    </div>
                )}
                <p className={`text-sm font-normal text-gray-900 dark:text-white ${isSender ? 'text-right' : ''}`}>
                    {text}
                </p>
                <div className={`flex mt-1 ${isSender ? 'justify-end' : ''}`}>
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">11:46</span>
                </div>
            </div>
        </div>
    );
}