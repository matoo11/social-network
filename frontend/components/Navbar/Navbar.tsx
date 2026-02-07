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
                const notifs = Array.isArray(data) ? data : data.data || [];
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
        <nav className="bg-gray-900 fixed top-0 left-0 w-full z-50 h-[7vh]">
            <div className="flex items-center h-full w-full">
                {/* Left section - Logo (matches left sidebar width) */}
                <div className="w-[17.5%] flex items-center px-5 flex-shrink-0">
                    <a href="/" className="flex items-center gap-3">
                        <Image
                            src="http://localhost:3000/uploads/reboot01-logo.jpeg"
                            className="rounded-full"
                            alt="Logo"
                            width={36}
                            height={36}
                        />
                        <span className="text-lg font-semibold text-white tracking-tight">
                            Social Network
                        </span>
                    </a>
                </div>

                {/* Middle section - Navigation links (matches post feed width) */}
                <div className="w-[52.5%] flex items-center justify-center">
                    <ul className="flex items-center gap-1">
                        <NavLink href="/social-feed">Social Feed</NavLink>
                        <NavLink href="/group">Groups</NavLink>
                    </ul>
                </div>

                {/* Right section - User actions (matches chat area width) */}
                <div
                    className="w-[30%] flex items-center justify-end px-5 gap-2 relative"
                    ref={dropdownRef}
                >
                    {/* User list button */}
                    <button
                        type="button"
                        id="dropdownUsersButton"
                        className="cursor-pointer flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-9 h-9 transition-colors"
                        aria-label="User list"
                        onClick={() => setIsUserListOpen(true)}
                    >
                        <FaUsers size={18} />
                    </button>

                    {/* Notifications button */}
                    <button
                        type="button"
                        className="cursor-pointer flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-9 h-9 transition-colors relative"
                        aria-label="Notifications"
                        onClick={() => setIsNotificationCenterOpen(true)}
                    >
                        <FaBell size={16} />
                        {notificationCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>

                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-800 transition-colors"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <div className="w-7 h-7">
                            <ProfileImage imageUrl="" avatarNumber={user?.profileImageID || 1} />
                        </div>
                        <span className="text-sm text-gray-300 font-medium hidden xl:block">
                            {user?.userName ?? 'Guest'}
                        </span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-14 right-5 z-50 text-sm list-none bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden w-48">
                            <div className="px-4 py-3 border-b border-gray-700">
                                <p className="text-sm font-medium text-white">
                                    {user?.userName ?? 'Guest'}
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                    {user?.email ?? 'Not logged in'}
                                </p>
                            </div>
                            <ul className="py-1">
                                {user.userId === 0 && (
                                    <li
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            router.push('/login');
                                        }}
                                        className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors"
                                    >
                                        Login
                                    </li>
                                )}

                                {user.userId !== 0 && (
                                    <>
                                        <li
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                setProfileUserId(user.userId);
                                                setIsProfileOpen(true);
                                            }}
                                            className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors"
                                        >
                                            Profile
                                        </li>
                                        <li>
                                            <Link
                                                href="/settings"
                                                className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                            >
                                                Settings
                                            </Link>
                                        </li>
                                        <li className="border-t border-gray-700">
                                            <span
                                                onClick={handleLogout}
                                                className="block px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 cursor-pointer transition-colors"
                                            >
                                                Sign out
                                            </span>
                                        </li>
                                    </>
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
