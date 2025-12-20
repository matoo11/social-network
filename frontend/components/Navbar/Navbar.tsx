'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProfileImage from '../ProfileImage/ProfileImage';
import Image from 'next/image';
import NavLink from '../NavLink/NavLink';
import { fetchUserData, logoutUser } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';

export interface User {
    userId: number;
    userName: string;
    nickName: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    gender: string;
    imageId: number;
    aboutMe: string;
    profileTypeId: number;
    creationTime: string;
    isActive: boolean;
}

const Navbar = () => {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { user, setUser } = useUser();

    useEffect(() => {
        handleUserData();
    }, []);

    const handleUserData = async () => {
        try {
            const data: User = await fetchUserData();

            setUser({
                userId: data.userId,
                userName: data.userName,
                nickName: data.nickName,
                email: data.email,
                profileImageID: data.imageId,
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Current user is guest') {
                console.warn('Current user is guest');
            } else {
                console.error('Fetching user data failed:', error);
            }
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !(dropdownRef.current as HTMLElement).contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            setIsDropdownOpen(false);

            setUser({
                userId: 0,
                userName: 'Guest',
                nickName: 'Guest',
                email: 'Not Logged In',
                profileImageID: 0,
            });

            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900 items-center fixed top-0 left-0 w-full z-50 h-[10vh]">
            <div className="max-w-full h-full flex flex-wrap justify-between p-4">
                <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Image
                        src="http://localhost:3000/uploads/reboot01-logo.jpeg"
                        className="h-10 w-10 rounded-full"
                        alt="Flowbite Logo"
                        width={32}
                        height={32}
                    />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                        Social Network
                    </span>
                </a>

                <div
                    className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative"
                    ref={dropdownRef}
                >
                    <button
                        type="button"
                        className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <div className="w-8 h-8">
                            <ProfileImage imageUrl="" />
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-8 right-0 z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 w-44">
                            <div className="px-4 py-3">
                                <span className="block text-sm text-gray-900 dark:text-white">
                                    {user?.userName ?? 'Guest'}
                                </span>
                                <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                                    {user?.email ?? 'Not logged in'}
                                </span>
                            </div>
                            <ul className="py-2">
                                {user.userId === 0 && (
                                    <li
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            router.push('/login');
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                                    >
                                        Login
                                    </li>
                                )}
                                <li>
                                    <Link
                                        href="/dashboard"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Settings
                                    </Link>
                                </li>
                                {user.userId !== 0 && (
                                    <li
                                        onClick={handleLogout}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                                    >
                                        Sign out
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div
                    className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
                    id="navbar-user"
                >
                    <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <NavLink href="/">Home</NavLink>
                        <NavLink href="/login">Login </NavLink>
                        <NavLink href="/register">Register</NavLink>
                        <NavLink href="/dashboard">Dashboard</NavLink>
                        <NavLink href="/social-feed">Social Feed</NavLink>
                        <li
                            id="dropdownUsersButton"
                            onClick={() => {
                                const menu = document.getElementById('dropdownUsers');
                                if (menu) {
                                    menu.classList.toggle('hidden');
                                }
                            }}
                        >
                            User list
                        </li>
                        <li
                            onClick={() => {
                                const menu = document.getElementById('openchat');
                                if (menu) {
                                    menu.classList.toggle('hidden');
                                }
                            }}
                        >
                            open chat
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
