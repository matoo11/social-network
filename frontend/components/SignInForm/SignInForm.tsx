// components/SignInForm/SignInForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import SignInFormUI from './SignInFormUI';
import { useUser } from '../../app/context/UserContext';
import Username from '../Username/Username';

type UserInfo = {
    userID: number;
    userName: string;
    nickName: string;
    email: string;
    imageID: number;
};

const SignInForm: React.FC = () => {
    const router = useRouter();
    const { setUser } = useUser();

    const [userIdentifier, setUserIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            const user: UserInfo = await loginUser(userIdentifier, password);
            console.log('Logged in user:', user);

            setUser({
                userName: user.userName,
                nickName: user.nickName,
                email: user.email,
                profileImageID: user.imageID,
            });

            router.push('/social-feed');
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
