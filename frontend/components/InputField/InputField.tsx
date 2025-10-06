import React from 'react';

type InputFieldProps = {
    htmlFor: string;
    labelText: string;
    inputType: string;
    inputName: string;
    inputID?: string;
    inputValue: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholderText: string;
    isRequired?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
    htmlFor,
    labelText,
    inputType,
    inputName,
    inputID,
    inputValue,
    onInputChange,
    placeholderText,
    isRequired = false,
}) => {
    return (
        <div className="relative z-0 w-full mb-5 group">
            <label
                htmlFor={htmlFor}
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
                {labelText}
            </label>
            <input
                type={inputType}
                name={inputName}
                id={inputID}
                value={inputValue}
                onChange={onInputChange}
                placeholder={placeholderText}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required={isRequired}
            />
        </div>
    );
};

export default InputField;
