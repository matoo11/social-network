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
      </div>
    </div>
  );
};

export default Dashboard;
