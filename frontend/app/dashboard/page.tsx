'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Correct for App Router


// pages/dashboard.tsx
const Dashboard = () => {
  const router = useRouter();
  
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    else {
      router.push('/login');
    }
    console.log(res.status);
  }
  
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to the Dashboard!</h1>

    <div style={styles.container}>
      <h2>Logout Form</h2>
      <form onSubmit={handleLogout} style={styles.form}>
        <button type="submit" style={styles.button}>
          Logout
        </button>
      </form>
    </div>
    </div>


);
};


const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
  },
};

export default Dashboard;
