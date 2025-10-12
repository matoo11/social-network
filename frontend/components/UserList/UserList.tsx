"use client";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import FollowButton from "../FollowButton/FollowButton";

// Store user data at module level
let userData: any[] = [];

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

// Shared render function
function renderUsers(root: any, searchTerm: string = "") {
    const filteredUsers = userData.filter((user: any) =>
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
                                        src={user.Avatar || "data:image/jpeg;base64,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"}
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
}

// 🔹 This function is called by the WebSocket
export function UpdateUserList(msg: any) {
    console.log("UpdateUserList", msg);

    // Update the global user data
    userData = msg;

    const container = document.getElementById("user-list");
    const searchInput = document.getElementById("user-search") as HTMLInputElement;

    if (!container) return;

    // If there's already a React root, use it; otherwise create one.
    let root = (container as any)._reactRoot;
    if (!root) {
        root = createRoot(container);
        (container as any)._reactRoot = root;
    }

    // Get current search term (preserves user's search while updating)
    const currentSearchTerm = searchInput?.value || "";

    // Re-render with current search term
    renderUsers(root, currentSearchTerm);

    // Add search event listener only once
    if (searchInput && !(searchInput as any)._hasListener) {
        searchInput.oninput = (e) => {
            const target = e.target as HTMLInputElement;
            renderUsers(root, target.value);
        };
        (searchInput as any)._hasListener = true;
    }
}