'use client';

import React from 'react';
import { useState } from 'react';

type SelectOption = {
    optionText: string;
    optionValue: number;
};

type SelectInputProps = {
    id?: string;
    selectLabel?: string;
    selectOptions: SelectOption[];
    selectedOption: SelectOption;
    className?: string;
    onChange?: (option: SelectOption) => void;
};

const SelectInput: React.FC<SelectInputProps> = ({
    id = 'select-option',
    selectLabel = 'Select an option',
    selectOptions,
    selectedOption = { optionText: 'Public', optionValue: 1 },
    className,
    onChange,
}) => {
    const [currentSelection, setCurrentSelection] = useState(selectedOption);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = selectOptions.find((opt) => opt.optionValue === Number(e.target.value));
        if (selected) {
            setCurrentSelection(selected); // update internal state
            onChange?.(selected); // notify parent (optional)
        }
    };
    return (
        <div className={`w-full ${className || ''}`}>
            <label
                htmlFor={id}
                className="block mb-2 text-sm font-semibold text-gray-300"
            >
                {selectLabel}
            </label>

            <select
                id={id}
                className="w-full px-3 py-2 border-2 border-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-800 border-slate-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                value={currentSelection?.optionValue}
                onChange={handleChange}
            >
                {selectOptions.map((option) => (
                    <option key={option.optionValue} value={option.optionValue}>
                        {option.optionText}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectInput;
