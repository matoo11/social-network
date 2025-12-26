'use client';

import Link from 'next/link';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => {
    return (
        <li>
            <Link
                href={href}
                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500"
            >
                {children}
            </Link>
        </li>
    );
};

export default NavLink;
