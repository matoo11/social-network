import React from 'react';
import InputField from '../General/InputField';

type SignInFormUIProps = {
    userIdentifier: string;
    password: string;
    error: string;
    onUserIdentifierChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const SignInFormUI: React.FC<SignInFormUIProps> = ({
    userIdentifier,
    password,
    error,
    onUserIdentifierChange,
    onPasswordChange,
    onSubmit,
}) => {
    return (
        <div className="mx-auto w-full max-w-sm p-5 sm:p-6 md:p-8 bg-gray-800 border border-gray-700 rounded-lg shadow-sm overflow-hidden">
            <form className="space-y-6" onSubmit={onSubmit}>
                <h5 className="font-serif text-xl font-medium text-white text-center">
                    Sign in to our platform
                </h5>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <InputField
                    htmlFor="email"
                    labelText="Your email or username"
                    inputType="text"
                    inputName="email"
                    inputID="email"
                    inputValue={userIdentifier}
                    onInputChange={onUserIdentifierChange}
                    placeholderText="Email or Username"
                    isRequired={true}
                />
                <InputField
                    htmlFor="password"
                    labelText="Your password"
                    inputType="password"
                    inputName="password"
                    inputID="password"
                    inputValue={password}
                    onInputChange={onPasswordChange}
                    placeholderText="••••••••"
                    isRequired={true}
                />
                <button
                    type="submit"
                    className="cursor-pointer w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Login to your account
                </button>
                <div className="text-sm font-medium text-gray-300">
                    Not registered?{' '}
                    <a href="/register" className="text-blue-500 hover:underline">
                        Create account
                    </a>
                </div>
            </form>
        </div>
    );
};

export default SignInFormUI;
