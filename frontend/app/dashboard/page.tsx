'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import PostList from '@/components/PostList/PostList';
import FollowButton from '@/components/FollowButton/FollowButton';

const Dashboard = () => {
    const router = useRouter();
    const [error, setError] = useState('');

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/signout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Failed to logout');
            }

            router.push('/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/createPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: 'private post', typeId: 1, title: 'hla' }),
            });

            if (!res.ok) {
                throw new Error('Failed to logout');
            }

            //   router.push('/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/createComment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ commentText: 'hello how are you', postID: 10 }),
            });

            if (!res.ok) {
                throw new Error('Failed to logout');
            }

            //   router.push('/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };
    const handleFollow = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/addFollow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userID: 1 }),
            });

            if (!res.ok) {
                throw new Error('Failed to logout');
            }

            //   router.push('/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    const unfollow = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/unFollow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userID: 1 }),
            });

            if (!res.ok) {
                throw new Error('Failed to logout');
            }

            //   router.push('/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    const checkfollow = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/checkFollowStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userID: 5 }),
            });

            if (!res.ok) {
                throw new Error('Failed to logout');
            }
            console.log(await res.json())

            //   router.push('/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <h1>Welcome to the Dashboard!</h1>
            <div className={styles.logoutContainer}>
                <h2>Logout Form</h2>
                <FollowButton userID={5}/>
                <form onSubmit={handleLogout} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        Logout
                    </button>
                </form>
                <form onSubmit={handleCreate} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        post
                    </button>
                </form>
                <form onSubmit={handleComment} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        post
                    </button>
                </form>
                <form onSubmit={handleFollow} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        follow
                    </button>
                </form>
                <form onSubmit={unfollow} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        unfollow
                    </button>
                </form>
                <form onSubmit={checkfollow} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        checkfollow
                    </button>
                </form>
            </div>
            <PostList />
        </div>
    );
};

export default Dashboard;
