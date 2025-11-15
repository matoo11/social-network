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

    const [currentSelection , setCurrentSelection] = useState(selectedOption);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = selectOptions.find(
      (opt) => opt.optionValue === Number(e.target.value)
    );
    if (selected) {
      setCurrentSelection(selected); // update internal state
      onChange?.(selected); // notify parent (optional)
    }
  };
    return (
        <div className={`max-w-sm mx-auto ${className}`}>
            <label
                htmlFor={id}
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
                {selectLabel}
            </label>

            <select
                id={id}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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

export default SelectInput
