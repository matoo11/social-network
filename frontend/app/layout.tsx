import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/General/Navbar';
import WebSocketInit from './WebSocketInit';
import { UserProvider } from './context/UserContext';
import AuthGuard from '@/components/General/AuthGuard';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/Notifications/ToastContainer';
import ToastNotificationListener from '@/components/Notifications/ToastNotificationListener';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Social network',
    description: 'Social network',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
                    integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ToastProvider>
                    <UserProvider>
                        <AuthGuard>
                            <WebSocketInit />
                            <ToastContainer />
                            <ToastNotificationListener />
                            {children}
                            {/* <Navbar /> */}
                        </AuthGuard>
                    </UserProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
