'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProfileImage from '../ProfileImage/ProfileImage';
import Image from 'next/image';
import NavLink from '../NavLink/NavLink';
import { fetchUserData, logoutUser } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import { FaBell, FaUsers } from 'react-icons/fa';
import UserListPopup from '../UserList/UserListPopup';
import ProfilePopup from '../ProfilePopup/ProfilePopup';
import NotificationCenter from '../Notifications/NotificationCenter';
import Popup from '../Popup/Popup';

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
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
    const [profileUserId, setProfileUserId] = useState<number | null>(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const dropdownRef = useRef(null);

    const { user, setUser } = useUser();

    useEffect(() => {
        handleUserData();
    }, []);

    // Fetch initial notification count
    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/notifications/get', {
                    credentials: 'include',
                });
                if (!res.ok) return;
                const data = await res.json();
                if (!data) return;
                const notifs = Array.isArray(data) ? data : (data.data || []);
                setNotificationCount(Array.isArray(notifs) ? notifs.length : 0);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNotificationCount();
    }, []);

    // Listen for new notifications via WebSocket
    useEffect(() => {
        const handler = () => {
            setNotificationCount((prev) => prev + 1);
        };
        window.addEventListener('ws-notification', handler);
        return () => window.removeEventListener('ws-notification', handler);
    }, []);

    // Listen for notification removals via WebSocket
    useEffect(() => {
        const handler = () => {
            setNotificationCount((prev) => Math.max(0, prev - 1));
        };
        window.addEventListener('ws-notification-removed', handler);
        return () => window.removeEventListener('ws-notification-removed', handler);
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
            <div className="max-w-full h-full flex items-center justify-between p-4">
                {/* Left: Logo */}
                <a
                    href="/"
                    className="flex items-center space-x-3 rtl:space-x-reverse flex-shrink-0"
                >
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

                {/* Center: Navigation Links */}
                <div className="flex-1 flex justify-center">
                    <ul className="flex font-medium space-x-8 rtl:space-x-reverse">
                        <NavLink href="/social-feed">Social Feed</NavLink>
                        <NavLink href="/group">Group</NavLink>
                    </ul>
                </div>

                {/* Right: User Menu */}
                <div
                    className="flex items-center space-x-3 rtl:space-x-reverse relative flex-shrink-0"
                    ref={dropdownRef}
                >
                    {/* User list button */}
                    <button
                        type="button"
                        id="dropdownUsersButton"
                        className="cursor-pointer flex items-center justify-center bg-gray-800 text-white rounded-full w-10 h-10 hover:bg-gray-700"
                        aria-label="User list"
                        onClick={() => setIsUserListOpen(true)}
                    >
                        <FaUsers size={20} />
                    </button>

                    {/* Notifications button */}
                    <button
                        type="button"
                        className="cursor-pointer flex items-center justify-center bg-gray-800 text-white rounded-full w-10 h-10 hover:bg-gray-700 relative"
                        aria-label="Notifications"
                        onClick={() => setIsNotificationCenterOpen(true)}
                    >
                        <FaBell size={20} />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <div className="w-8 h-8">
                            <ProfileImage imageUrl="" avatarNumber={user?.profileImageID || 1} />
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-12 right-0 z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 w-44">
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

                                {user.userId !== 0 && (
                                    <div>
                                        <li
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                setProfileUserId(user.userId);
                                                setIsProfileOpen(true);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                                        >
                                            Profile
                                        </li>
                                        <li>
                                            {/* TODO: Need to create a settings component/page */}
                                            <Link
                                                href="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                            >
                                                Settings
                                            </Link>
                                        </li>
                                        <li
                                            onClick={handleLogout}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                                        >
                                            Sign out
                                        </li>
                                    </div>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <UserListPopup isOpen={isUserListOpen} onClose={() => setIsUserListOpen(false)} />
            <ProfilePopup
                isOpen={isProfileOpen}
                onClose={() => {
                    setIsProfileOpen(false);
                    setProfileUserId(null);
                }}
                userId={profileUserId}
                onUserClick={(userId) => {
                    setProfileUserId(userId);
                    setIsProfileOpen(true);
                }}
            />
            <Popup
                isOpen={isNotificationCenterOpen}
                onClose={() => setIsNotificationCenterOpen(false)}
                className="max-w-lg"
            >
                <NotificationCenter 
                    onNotificationHandled={() => {
                        setNotificationCount((prev) => Math.max(0, prev - 1));
                    }}
                />
            </Popup>
        </nav>
    );
};

export default Navbar;
