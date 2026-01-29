'use client';

import { useEffect, useState } from 'react';
import Popup from '../Popup/Popup';
import FollowButton from '../FollowButton/FollowButton';
import { useUser } from '@/app/context/UserContext';

type ProfileUser = {
    userID: number;
    userName: string;
    nickName: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender: string;
    imageID: number;
    aboutMe?: string;
    profileTypeId: number;
    profileTypeName: string;
};

type ProfilePost = {
    postID: number;
    title: string;
    content: string;
    postTypeId: number;
    imageID?: number;
    createdAt: string;
    commentsCount: number;
};

type ProfileFollow = {
    userID: number;
    userName: string;
    nickName: string;
    firstName: string;
    lastName: string;
    imageID: number;
};

type ProfileData = {
    user: ProfileUser;
    posts: ProfilePost[];
    followers: ProfileFollow[];
    following: ProfileFollow[];
    followersCount: number;
    followingCount: number;
    isOwner: boolean;
    isFollower: boolean;
    profileTypeName: string;
};

type ProfilePopupProps = {
    isOpen: boolean;
    onClose: () => void;
    userId: number | null;
    onUserClick?: (userId: number) => void;
};

export default function ProfilePopup({ isOpen, onClose, userId, onUserClick }: ProfilePopupProps) {
    const { user: currentUser } = useUser();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');

    useEffect(() => {
        if (isOpen && userId) {
            loadProfile(userId);
        }
    }, [isOpen, userId]);

    const loadProfile = async (targetUserId: number) => {
        setLoading(true);
        setError('');
        setActiveTab('posts');
        
        try {
            const res = await fetch('http://localhost:8080/api/profile/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userID: targetUserId }),
            });

            if (res.status === 403) {
                setError('This profile is private');
                setProfile(null);
                setLoading(false);
                return;
            }

            if (!res.ok) {
                throw new Error('Failed to load profile');
            }

            const data = await res.json();
            setProfile(data.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load profile');
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async () => {
        if (!profile) return;

        const newVisibility = profile.profileTypeName === 'Public' ? 'Private' : 'Public';

        try {
            const res = await fetch('http://localhost:8080/api/profile/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ visibility: newVisibility }),
            });

            if (!res.ok) {
                throw new Error('Failed to toggle visibility');
            }

            if (userId) {
                await loadProfile(userId);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to toggle profile visibility');
        }
    };

    const handleUserClick = (targetUserId: number) => {
        if (onUserClick) {
            onUserClick(targetUserId);
        }
    };

    return (
        <Popup isOpen={isOpen} onClose={onClose} className="max-w-5xl">
            <div className="border-2 border-gray-600 rounded-lg h-full shadow-sm overflow-hidden dark:bg-gray-900">
                {/* Header */}
                <div className="flex justify-center gap-5 items-center h-16 pt-2 border-b-2 border-gray-600 shadow-sm overflow-hidden dark:bg-gray-900">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        Profile
                    </h3>
                </div>

                {/* Content */}
                <div className="p-6 h-[calc(100%-4rem)] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-white text-lg">Loading...</div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-red-500 text-lg">{error}</div>
                        </div>
                    )}

                    {!loading && !error && profile && (
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <span className="text-white text-3xl font-bold">
                                                {profile.user.firstName?.[0] || profile.user.userName[0]}
                                            </span>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h2 className="text-2xl font-bold text-white">
                                                {profile.user.firstName} {profile.user.lastName}
                                            </h2>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    profile.profileTypeName === 'public'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-purple-500/20 text-purple-400'
                                                }`}
                                            >
                                                {profile.profileTypeName}
                                            </span>
                                        </div>

                                        <p className="text-gray-400 mb-3">@{profile.user.userName}</p>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                            <div>
                                                <span className="text-gray-400">Email: </span>
                                                <span className="text-white">{profile.user.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Gender: </span>
                                                <span className="text-white">{profile.user.gender}</span>
                                            </div>
                                            {profile.user.dateOfBirth && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-400">Birthday: </span>
                                                    <span className="text-white">
                                                        {new Date(profile.user.dateOfBirth).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {profile.user.aboutMe && (
                                            <p className="text-gray-300 mb-3 text-sm">{profile.user.aboutMe}</p>
                                        )}

                                        <div className="flex gap-4 mb-3 text-sm">
                                            <div className="text-white">
                                                <span className="font-bold">{profile.followersCount}</span>{' '}
                                                <span className="text-gray-400">Followers</span>
                                            </div>
                                            <div className="text-white">
                                                <span className="font-bold">{profile.followingCount}</span>{' '}
                                                <span className="text-gray-400">Following</span>
                                            </div>
                                            <div className="text-white">
                                                <span className="font-bold">{profile.posts.length}</span>{' '}
                                                <span className="text-gray-400">Posts</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            {profile.isOwner ? (
                                                <button
                                                    onClick={toggleVisibility}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                                                >
                                                    Make {profile.profileTypeName === 'Public' ? 'Private' : 'Public'}
                                                </button>
                                            ) : (
                                                <FollowButton userID={profile.user.userID} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b-2 border-gray-600">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('posts')}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                            activeTab === 'posts'
                                                ? 'text-blue-500 border-b-2 border-blue-500'
                                                : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                    >
                                        Posts ({profile.posts.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('followers')}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                            activeTab === 'followers'
                                                ? 'text-blue-500 border-b-2 border-blue-500'
                                                : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                    >
                                        Followers ({profile.followersCount})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('following')}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                            activeTab === 'following'
                                                ? 'text-blue-500 border-b-2 border-blue-500'
                                                : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                    >
                                        Following ({profile.followingCount})
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="space-y-3">
                                {activeTab === 'posts' && (
                                    <div className="space-y-3">
                                        {profile.posts.length > 0 ? (
                                            profile.posts.map((post) => (
                                                <div
                                                    key={post.postID}
                                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4"
                                                >
                                                    <h4 className="text-lg font-bold text-white mb-2">
                                                        {post.title}
                                                    </h4>
                                                    <p className="text-gray-300 mb-2 text-sm">{post.content}</p>
                                                    <div className="flex gap-3 text-xs text-gray-400">
                                                        <span>
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{post.commentsCount} comments</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-400 text-sm">
                                                No posts yet
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'followers' && (
                                    <div className="space-y-2">
                                        {profile.followers.length > 0 ? (
                                            profile.followers.map((follower) => (
                                                <div
                                                    key={follower.userID}
                                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <div
                                                        className="cursor-pointer flex-1"
                                                        onClick={() => handleUserClick(follower.userID)}
                                                    >
                                                        <h5 className="text-white font-medium text-sm hover:text-blue-500">
                                                            {follower.firstName} {follower.lastName}
                                                        </h5>
                                                        <p className="text-gray-400 text-xs">
                                                            @{follower.userName}
                                                        </p>
                                                    </div>
                                                    {currentUser.userId !== follower.userID && (
                                                        <FollowButton userID={follower.userID} />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-400 text-sm">
                                                No followers yet
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'following' && (
                                    <div className="space-y-2">
                                        {profile.following.length > 0 ? (
                                            profile.following.map((following) => (
                                                <div
                                                    key={following.userID}
                                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <div
                                                        className="cursor-pointer flex-1"
                                                        onClick={() => handleUserClick(following.userID)}
                                                    >
                                                        <h5 className="text-white font-medium text-sm hover:text-blue-500">
                                                            {following.firstName} {following.lastName}
                                                        </h5>
                                                        <p className="text-gray-400 text-xs">
                                                            @{following.userName}
                                                        </p>
                                                    </div>
                                                    {currentUser.userId !== following.userID && (
                                                        <FollowButton userID={following.userID} />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-400 text-sm">
                                                Not following anyone yet
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Popup>
    );
}
