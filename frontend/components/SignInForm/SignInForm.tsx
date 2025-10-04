// components/SignInForm/SignInForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import SignInFormUI from './SignInFormUI';

const SignInForm: React.FC = () => {
    const router = useRouter();

    const [userIdentifier, setUserIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            await loginUser(userIdentifier, password);
            router.push('/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unexpected error occurred');
            }
        }
    };

    return (
        <SignInFormUI
            userIdentifier={userIdentifier}
            password={password}
            error={error}
            onUserIdentifierChange={(e) => setUserIdentifier(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleSubmit}
        />
    );
};

export default SignInForm;
