"use client";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import FollowButton from "../FollowButton/FollowButton";

export default function UserList() {
    return (
        <div
            id="dropdownUsers"
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            }}
            className="z-10 hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl w-96 border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
        >
            {/* Header with gradient */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Users
                </h3>
                <p className="text-xs text-blue-100 mt-1">Discover and connect</p>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="user-search"
                        className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 transition-all"
                        placeholder="Search users..."
                    />
                </div>
            </div>

            {/* The list will be rendered here dynamically */}
            <ul
                className="h-96 py-2 overflow-y-auto text-gray-700 dark:text-gray-200 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                id="user-list"
            ></ul>
        </div>
    );
}

// 🔹 This function is called by the WebSocket
export function UpdateUserList(msg: any) {
    console.log("UpdateUserList", msg);
    const container = document.getElementById("user-list");
    const searchInput = document.getElementById("user-search") as HTMLInputElement;

    if (!container) return;

    // If there's already a React root, use it; otherwise create one.
    let root = (container as any)._reactRoot;
    if (!root) {
        root = createRoot(container);
        (container as any)._reactRoot = root;
    }

    // Render function with search capability
    const renderUsers = (searchTerm: string = "") => {
        const filteredUsers = msg.filter((user: any) =>
            user.User_Name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        root.render(
            <>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user: any) => (
                        <li key={user.ID} className="px-3 py-1">
                            <div className="flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md group cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                                        <img
                                            className="relative w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                                            src={user.Avatar || "hello"}
                                            alt={user.User_Name}
                                        />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                            {user.User_Name}
                                        </span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            @{user.User_Name.toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <FollowButton userID={user.User_ID} />
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="px-6 py-12 text-center">
                        <svg className="mx-auto w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No users found</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
                    </li>
                )}
            </>
        );
    };

    // Initial render
    renderUsers();

    // Add search event listener
    if (searchInput) {
        searchInput.oninput = (e) => {
            const target = e.target as HTMLInputElement;
            renderUsers(target.value);
        };
    }
}