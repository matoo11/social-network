"use client";
import { createRoot } from "react-dom/client";
import FollowButton from "../FollowButton/FollowButton";
import { UNSTABLE_REVALIDATE_RENAME_ERROR } from "next/dist/lib/constants";

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
      className="z-10 hidden bg-white rounded-lg shadow-sm w-60 dark:bg-gray-700"
    >
      {/* The list will be rendered here dynamically */}
      <ul className="h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" id="user-list"></ul>

      <a
        href="#"
        className="flex items-center p-3 text-sm font-medium text-blue-600 border-t border-gray-200 rounded-b-lg bg-gray-50 dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-blue-500 hover:underline"
      >
        <svg
          className="w-4 h-4 me-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 18"
        >
          <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
        </svg>
        Add new user
      </a>
    </div>
  );
}

// 🔹 This function is called by the WebSocket
export function UpdateUserList(msg: any) {
  console.log("UpdateUserList", msg);

  const container = document.getElementById("user-list");
  if (!container) return;

  // If there's already a React root, use it; otherwise create one.
  let root = (container as any)._reactRoot;
  if (!root) {
    root = createRoot(container);
    (container as any)._reactRoot = root;
  }

  // Render React components dynamically
  root.render(
    <>
      {msg.map((user: any) => (
        <li key={user.ID}>
          <a
            href="#"
            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <div className="flex items-center">
              <img
                className="w-6 h-6 me-2 rounded-full"
                src={user.Avatar || "hello"}
                alt={user.User_Name}
              />
              {user.User_Name}
            </div>
            <FollowButton userID={user.User_ID} /> {/* ✅ Real React component */}
          </a>
        </li>
      ))}
    </>
  );
}
