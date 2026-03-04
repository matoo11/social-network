import Navbar from '@/components/General/Navbar';

export default function Home() {
    return (
        <section className="min-h-screen bg-gray-900 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-5 sm:px-8 text-center">
                <h1 className="mb-4 text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                    Social Network Platform
                </h1>
                <p className="mb-8 text-base sm:text-lg lg:text-xl font-normal text-gray-400 max-w-2xl">
                    Welcome to a place where connections come alive. Our social network makes it
                    easy to share moments, discover new ideas, and stay close to the people who
                    matter most—all in one simple, friendly space.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <a
                        href="/register"
                        className="inline-flex justify-center items-center w-40 py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Get started
                        <svg
                            className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                        </svg>
                    </a>
                    <a
                        href="/login"
                        className="inline-flex w-40 justify-center items-center py-3 px-5 text-sm font-medium text-gray-400 rounded-lg border border-gray-600 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        Login
                    </a>
                </div>
            </div>
        </section>
    );
}
