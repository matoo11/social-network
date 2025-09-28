'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

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
                body: JSON.stringify({ message: "hello how are you", typeId: 1, title: "hla" })
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
                body: JSON.stringify({ commentText: "hello how are you", postID: 10 })
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
                body: JSON.stringify({ userID: 100 })
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

    const checkFollowStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/checkFollowStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userID: 2 })
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

    const unfollow = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/unFollow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userID: 4 })
            });

            if (!res.ok) {
                console.log(await res.json())
                throw new Error('Failed to logout');
            }
            console.log(res.status)

            //   router.push('/login');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    const getFollowers = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8080/api/getFollowers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userID: 5 })
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
                <form onSubmit={checkFollowStatus} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        check status
                    </button>
                </form>
                <form onSubmit={unfollow} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        unfollow
                    </button>
                </form>
                <form onSubmit={getFollowers} className={styles.logoutForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.logoutButton}>
                        getFollowers
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;
