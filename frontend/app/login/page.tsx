'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import styles from './page.module.css'; // CSS Module import

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      await loginUser(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Show error message on UI instead of throwing
      } else {
        setError('Unexpected error occurred');
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.loginInput}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.loginInput}
          required
        />
        {error && <p className={styles.loginError}>{error}</p>}
        <button type="submit" className={styles.loginButton}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
