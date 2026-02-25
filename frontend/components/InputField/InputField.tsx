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
        <div className="w-full group">
            <label
                htmlFor={htmlFor}
                className="block mb-2 text-sm font-semibold text-gray-300"
            >
                {labelText}
                {/* {isRequired && <span className="text-red-500 ml-1">*</span>} */}
            </label>
            <input
                type={inputType}
                name={inputName}
                id={inputID}
                value={inputValue}
                onChange={onInputChange}
                placeholder={placeholderText}
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-800 border-slate-600 text-gray-100 placeholder-gray-500"
                required={isRequired}
            />
        </div>
    );
};

export default InputField;
