'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProfileImage from '../ProfileImage/ProfileImage';
import Image from 'next/image';
import { fetchUserData, logoutUser } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import { FaBell, FaUsers, FaBars, FaTimes } from 'react-icons/fa';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { user, setUser } = useUser();

    useEffect(() => {
        handleUserData();
    }, []);

    // Fetch initial notification count
    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const res = await fetchWithAuth('http://localhost:8080/api/notifications/get', {
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
        <nav className="bg-gray-900 fixed top-0 left-0 w-full z-50 h-[7vh] border-b border-gray-800">
            <div className="flex items-center h-full w-full px-3 lg:px-5">
                {/* Left section - Logo */}
                <div className="flex items-center flex-shrink-0">
                    <a href="/" className="flex items-center gap-2 lg:gap-3">
                        <Image
                            src="http://localhost:3000/uploads/reboot01-logo.jpeg"
                            className="rounded-full"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                        <span className="text-base lg:text-lg font-semibold text-white tracking-tight hidden sm:block">
                            Social Network
                        </span>
                    </a>
                </div>

                {/* Middle spacer (nav links moved to page-level tabs) */}
                <div className="hidden lg:flex flex-1" />

                {/* Right section - Mobile: hamburger and icons, Desktop: full actions */}
                <div
                    className="flex-1 lg:flex-none flex items-center justify-end gap-2 relative"
                    ref={dropdownRef}
                >
                    {/* Mobile action buttons */}
                    <div className="flex items-center gap-1 lg:hidden">
                        {/* User list button - Mobile */}
                        <button
                            type="button"
                            className="cursor-pointer flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-9 h-9 transition-colors"
                            aria-label="User list"
                            onClick={() => setIsUserListOpen(true)}
                        >
                            <FaUsers size={20} />
                        </button>

                        {/* Notifications button - Mobile */}
                        <button
                            type="button"
                            className="cursor-pointer flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-9 h-9 transition-colors relative"
                            aria-label="Notifications"
                            onClick={() => setIsNotificationCenterOpen(true)}
                        >
                            <FaBell size={18} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Hamburger menu button - Mobile */}
                        <button
                            type="button"
                            className="cursor-pointer flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-9 h-9 transition-colors"
                            aria-label="Menu"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <FaBars size={20} />
                        </button>
                    </div>

                    {/* Desktop action buttons */}
                    <div className="hidden lg:flex items-center gap-2">
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
                                <ProfileImage
                                    imageUrl=""
                                    avatarNumber={user?.profileImageID || 1}
                                />
                            </div>
                            <span className="text-sm text-gray-300 font-medium hidden xl:block">
                                {user?.userName ?? 'Guest'}
                            </span>
                        </button>
                    </div>

                    {/* Desktop dropdown (unchanged) */}
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

            {/* Mobile Menu Overlay */}
            <div
                className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
                    isMobileMenuOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                <div
                    className={`absolute right-0 top-0 h-full w-[280px] bg-gray-900 transform transition-transform duration-300 ${
                        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Mobile menu header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9">
                                <ProfileImage
                                    imageUrl=""
                                    avatarNumber={user?.profileImageID || 1}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {user?.userName ?? 'Guest'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {user?.email ?? 'Not logged in'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Mobile account actions */}
                    <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                            Account
                        </p>
                        <div className="flex flex-col gap-1">
                            {user.userId === 0 ? (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        router.push('/login');
                                    }}
                                    className="block w-full text-left px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                >
                                    Login
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setProfileUserId(user.userId);
                                            setIsProfileOpen(true);
                                        }}
                                        className="block w-full text-left px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                    >
                                        Profile
                                    </button>
                                    <Link
                                        href="/settings"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                                    >
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="block w-full text-left px-3 py-2.5 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors mt-2 border-t border-gray-700 pt-3"
                                    >
                                        Sign out
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
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
