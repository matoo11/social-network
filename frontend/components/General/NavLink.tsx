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
                className={`block py-1.5 px-4 rounded-lg text-sm font-medium transition-colors
          ${
              isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }
        `}
            >
                {children}
            </Link>
        </li>
    );
};

export default NavLink;
