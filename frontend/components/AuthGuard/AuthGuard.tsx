'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchUserData } from '@/lib/api/auth';

type AuthGuardProps = {
    children: React.ReactNode;
};

const publicRoutes = ['/', '/login', '/register'];

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // If current route is public, allow access
            if (publicRoutes.includes(pathname)) {
                setIsChecking(false);
                setIsAuthenticated(true);
                return;
            }

            // Check authentication for protected routes
            try {
                await fetchUserData();
                setIsAuthenticated(true);
                setIsChecking(false);
            } catch (error) {
                console.error('Authentication check failed:', error);
                setIsAuthenticated(false);
                setIsChecking(false);
                router.push('/login');
            }
        };

        checkAuth();
    }, [pathname, router]);

    // Show loading state while checking
    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If not authenticated and not on public route, don't render (will redirect)
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        return null;
    }

    return <>{children}</>;
}
