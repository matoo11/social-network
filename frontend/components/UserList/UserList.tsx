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
      <ul className="h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200" />
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

export function UpdateUserList(msg: any) {
    const container = document.querySelector("#dropdownUsers ul");
            if (!container) return;

            container.innerHTML = msg.users.map((user: any) => `
        <li>
            <a href="#" class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                <img class="w-6 h-6 me-2 rounded-full" src="${user.avatar}" alt="${user.name}" />
                ${user.name}
            </a>
        </li>
    `).join("");
}