// components/SignInForm/SignInForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import SignInFormUI from './SignInFormUI';
import { useUser } from '../../app/context/UserContext';
import Username from '../General/Username';

type UserInfo = {
    userID: number;
    userName: string;
    nickName: string;
    email: string;
    imageID: number;
};

interface SignInFormProps {
    onSuccess?: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSuccess }) => {
    const router = useRouter();
    const { setUser } = useUser();

    const [userIdentifier, setUserIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const result = await loginUser(userIdentifier, password);

        if ('error' in result) {
            setError(result.error);
            return;
        }

        const user: UserInfo = result.data;
        console.log('Logged in user:', user);

        setUser({
            userId: user.userID,
            userName: user.userName,
            nickName: user.nickName,
            email: user.email,
            profileImageID: user.imageID,
        });

        if (onSuccess) {
            onSuccess();
        }

        router.push('/social-feed');
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
