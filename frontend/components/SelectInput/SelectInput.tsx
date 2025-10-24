// 'use client';

// import React from 'react';

// interface Option {
//     label: string;
//     value: number;
// }

// interface SelectInputProps {
//     id?: string;
//     label?: string;
//     options: Option[];
//     selectedValue?: number;
//     onChange?: (selectedValue: number) => void;
//     placeholder?: string;
//     className?: string;
// }

// const SelectInput: React.FC<SelectInputProps> = ({
//     id,
//     label,
//     options,
//     selectedValue,
//     onChange,
//     placeholder = 'Select an option',
//     className = '',
// }) => {
//     return (
//         <div className={`max-w-sm mx-auto ${className}`}>
//             {label && (
//                 <label
//                     htmlFor={id}
//                     className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
//                 >
//                     {label}
//                 </label>
//             )}
//             <select
//                 id={id}
//                 value={selectedValue ?? ''}
//                 onChange={(e) => {
//                     const selected = Number(e.target.value);
//                     if (!isNaN(selected)) onChange?.(selected);
//                 }}
//                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
//                    focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
//                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
//                    dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
//             >
//                 {placeholder && (
//                     <option value="" disabled>
//                         {placeholder}
//                     </option>
//                 )}
//                 {options.map((option) => (
//                     <option key={option.value} value={option.value}>
//                         {option.label}
//                     </option>
//                 ))}
//             </select>
//         </div>
//     );
// };

// export default SelectInput;
