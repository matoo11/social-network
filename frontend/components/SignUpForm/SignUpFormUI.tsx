import React from 'react';
import InputField from '../InputField/InputField';
import AvatarSelector from '../AvatarSelector/AvatarSelector';

type FormData = {
    username: string;
    nickname: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    avatarNumber: number;
    aboutMe: string;
};

type SignUpFormUIProps = {
    formData: FormData;
    error: string;
    onInputChange: (
        field: string,
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onAvatarSelect: (avatarNumber: number) => void;
};

const SignUpFormUI: React.FC<SignUpFormUIProps> = ({
    formData,
    error,
    onInputChange,
    onSubmit,
    onAvatarSelect,
}) => {
    return (
        <div className="mx-auto w-full max-w-md p-4 sm:p-6 md:p-8 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 my-2 sm:my-4 max-h-[90dvh] overflow-y-auto overflow-x-hidden">
            <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-3 text-sm sm:text-base">
                <h5 className="font-serif text-xl font-medium text-white text-center">
                    Create your account
                </h5>
                <AvatarSelector
                    selectedAvatar={formData.avatarNumber}
                    onAvatarSelect={onAvatarSelect}
                />
                <InputField
                    htmlFor="username"
                    labelText="Your username"
                    inputType="text"
                    inputName="username"
                    inputID="username"
                    inputValue={formData.username}
                    onInputChange={onInputChange('username')}
                    placeholderText="Username"
                    isRequired={true}
                />
                <InputField
                    htmlFor="email"
                    labelText="Your email"
                    inputType="email"
                    inputName="email"
                    inputID="email"
                    inputValue={formData.email}
                    onInputChange={onInputChange('email')}
                    placeholderText="example@company.com"
                    isRequired={true}
                />

                <InputField
                    htmlFor="password"
                    labelText="Your password"
                    inputType="password"
                    inputName="password"
                    inputID="password"
                    inputValue={formData.password}
                    onInputChange={onInputChange('password')}
                    placeholderText="••••••••"
                    isRequired={true}
                />
                <InputField
                    htmlFor="confirmPassword"
                    labelText="Confirm password"
                    inputType="password"
                    inputName="confirmPassword"
                    inputID="confirmPassword"
                    inputValue={formData.confirmPassword}
                    onInputChange={onInputChange('confirmPassword')}
                    placeholderText="••••••••"
                    isRequired={true}
                />
                <div className="grid grid-cols-2 gap-3">
                    <InputField
                        htmlFor="firstName"
                        labelText="First name"
                        inputType="text"
                        inputName="firstName"
                        inputID="firstName"
                        inputValue={formData.firstName}
                        onInputChange={onInputChange('firstName')}
                        placeholderText="First name"
                        isRequired={true}
                    />
                    <InputField
                        htmlFor="lastName"
                        labelText="Last name"
                        inputType="text"
                        inputName="lastName"
                        inputID="lastName"
                        inputValue={formData.lastName}
                        onInputChange={onInputChange('lastName')}
                        placeholderText="Last name"
                        isRequired={true}
                    />
                </div>
                <InputField
                    htmlFor="nickname"
                    labelText="Nickname (optional)"
                    inputType="text"
                    inputName="nickname"
                    inputID="nickname"
                    inputValue={formData.nickname}
                    onInputChange={onInputChange('nickname')}
                    placeholderText="Nickname"
                    isRequired={false}
                />

                <div>
                    <label
                        htmlFor="aboutMe"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        About Me (optional)
                    </label>
                    <textarea
                        id="aboutMe"
                        name="aboutMe"
                        value={formData.aboutMe}
                        onChange={onInputChange('aboutMe') as any}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Gender
                        </label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="M"
                                    checked={formData.gender === 'M'}
                                    onChange={onInputChange('gender')}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                                    Male
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="F"
                                    checked={formData.gender === 'F'}
                                    onChange={onInputChange('gender')}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                                    Female
                                </span>
                            </label>
                        </div>
                    </div>

                    <InputField
                        htmlFor="dateOfBirth"
                        labelText="Date of Birth"
                        inputType="date"
                        inputName="dateOfBirth"
                        inputID="dateOfBirth"
                        inputValue={formData.dateOfBirth}
                        onInputChange={onInputChange('dateOfBirth')}
                        placeholderText="Date of Birth"
                        isRequired={true}
                    />
                </div>
                {error && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    className="cursor-pointer w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Create account
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <a
                        href="/login"
                        className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                    >
                        Login here
                    </a>
                </p>
            </form>
        </div>
    );
};

export default SignUpFormUI;
