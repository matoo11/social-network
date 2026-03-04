export default function UserListButton() {
    return (
        <button
            id="dropdownUsersButton"
            type="button"
            onClick={() => {
                const menu = document.getElementById('dropdownUsers');
                const btn = document.getElementById('dropdownUsersButton');

                if (menu && btn) {
                    const rect = btn.getBoundingClientRect();
                    menu.style.position = 'absolute';
                    menu.style.top = `${rect.bottom + window.scrollY + 4}px`; // 4px gap
                    menu.style.left = `${rect.left + window.scrollX}px`;
                    menu.classList.toggle('hidden');
                }
            }}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
        >
            Project users
            <svg
                className="w-2.5 h-2.5 ms-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                />
            </svg>
        </button>
    );
}
