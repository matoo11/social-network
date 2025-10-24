'use clinet';

import React from 'react';
import { useState } from 'react';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import PostFormUI from './PostFormUI';

const PostForm: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imgageUrl: '',
        postType: 0,
        privateUsers: [] as number[],
    });
    const [error, setError] = useState('');

    const handleInputChange =
        (field: string | number) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setFormData((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form data on submit:', formData);
        // Add your form submission logic here
    };

    return (
        <PostFormUI
            formData={formData}
            error={error}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
        />
    );
};

export default PostForm;
