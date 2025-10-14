// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <div className={styles.logo}>
                    <Link href="/">MyApp</Link>
                </div>
                <ul className={styles.navLinks}>
                    <li><Link href="/">Home</Link></li>
                    <li id='dropdownUsersButton'
                        onClick={() => {
                            const menu = document.getElementById("dropdownUsers");
                            if (menu) {

                                menu.classList.toggle("hidden");
                            }
                        }}>User list</li>
                    <li
                        onClick={() => {
                            const menu = document.getElementById("openchat");
                            if (menu) {
                                console.log("here")
                                menu.classList.toggle("hidden");
                            }
                        }}>open chat</li>
                    <li><Link href="/about">About (Not-working)</Link></li>
                    <li><Link href="/dashboard">Dashboard</Link></li>
                    <li><Link href="/social-feed">Social Feed</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
