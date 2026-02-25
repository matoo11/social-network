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
        <div className="mx-auto w-full max-w-md lg:max-w-4xl p-3 sm:p-4 md:p-5 bg-gray-800 border border-gray-700 rounded-lg shadow-sm my-2 sm:my-3 max-h-[90dvh] overflow-y-auto overflow-x-hidden">
            <form
                onSubmit={onSubmit}
                className="max-w-md lg:max-w-4xl mx-auto space-y-2 text-sm sm:text-[15px]"
            >
                <h5 className="font-serif text-xl font-medium text-white text-center">
                    Create your account
                </h5>
                <AvatarSelector
                    selectedAvatar={formData.avatarNumber}
                    onAvatarSelect={onAvatarSelect}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
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
                    <div>
                        <label className="block mb-2 text-sm font-medium text-white">Gender</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="M"
                                    checked={formData.gender === 'M'}
                                    onChange={onInputChange('gender')}
                                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="ml-2 text-sm text-gray-300">Male</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="F"
                                    checked={formData.gender === 'F'}
                                    onChange={onInputChange('gender')}
                                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="ml-2 text-sm text-gray-300">Female</span>
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

                <div className="space-y-1">
                    <label htmlFor="aboutMe" className="block mb-2 text-sm font-medium text-white">
                        About Me (optional)
                    </label>
                    <textarea
                        id="aboutMe"
                        name="aboutMe"
                        value={formData.aboutMe}
                        onChange={onInputChange('aboutMe') as any}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        maxLength={300}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 resize-none"
                    />
                    <div className="text-xs text-gray-400 text-right">
                        {formData.aboutMe.length}/300
                    </div>
                </div>

                {error && (
                    <div className="p-4 mb-4 text-sm text-red-300 rounded-lg bg-red-900/30 border border-red-700">
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    className="cursor-pointer w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Create account
                </button>
                <p className="text-sm font-light text-gray-400">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-blue-500 hover:underline">
                        Login here
                    </a>
                </p>
            </form>
        </div>
    );
};

export default SignUpFormUI;
