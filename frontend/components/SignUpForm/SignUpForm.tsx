'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/lib/api/auth';
import SignUpFormUI from './SignUpFormUI';

const SignUpForm: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: '',
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        avatarNumber: 1, // Default to avatar 1
    });
    const [error, setError] = useState('');

    const handleInputChange =
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setFormData((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };

    const handleAvatarSelect = (avatarNumber: number) => {
        setFormData((prev) => ({
            ...prev,
            avatarNumber,
        }));
    };

    const validateForm = (): string | null => {
        if (!formData.username.trim()) return 'Username is required';
        if (!formData.email.trim()) return 'Email is required';
        if (!formData.password.trim()) return 'Password is required';
        if (!formData.confirmPassword.trim()) return 'Please confirm your password';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        if (!formData.firstName.trim()) return 'First name is required';
        if (!formData.lastName.trim()) return 'Last name is required';
        if (!formData.dateOfBirth) return 'Date of birth is required';
        if (!formData.gender) return 'Gender is required';

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';

        // Basic password strength check
        if (formData.password.length < 8) return 'Password must be at least 8 characters long';

        return null;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form data on submit:', formData);
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            console.log('Validation error:', error);
            return;
        }

        try {
            // Convert dateOfBirth to proper format for backend
            const signUpData = {
                ...formData,
                dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
            };

            console.log('Submitting sign-up data:', signUpData);

            await registerUser(signUpData);
            await loginUser(formData.username, formData.password);
            router.push('/social-feed');
        } catch (err: unknown) {
            console.error('Registration error:', err);
            if (err instanceof Error) {
                // Clean up error message if it's too technical
                let errorMsg = err.message;
                if (errorMsg.includes('fetch')) {
                    errorMsg = 'Unable to connect to server. Please try again.';
                }
                setError(errorMsg);
            } else {
                setError('Unexpected error occurred during registration');
            }
        }
    };

    return (
        <SignUpFormUI
            formData={formData}
            error={error}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onAvatarSelect={handleAvatarSelect}
        />
    );
};

export default SignUpForm;
