'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => {
    const pathname = usePathname();

    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <li>
            <Link
                href={href}
                className={`block py-1 px-2 rounded
          ${
              isActive
                  ? 'text-white-400 border-1 bg-blue-600 border-blue-600'
                  : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500'
          }
        `}
            >
                {children}
            </Link>
        </li>
    );
};

export default NavLink;
