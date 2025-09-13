import React from 'react';
import { IMaskInput } from 'react-imask';

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    mask: string;

    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MaskedInput: React.FC<MaskedInputProps> = ({ label, id, name, mask, value, onChange, ...props }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <IMaskInput
                mask={mask}
                value={value as string}
                id={id}
                name={name || id}


                onAccept={(acceptedValue) => {
                    const event = {
                        target: {
                            id: id,
                            name: name || id,
                            value: acceptedValue,
                        },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                }}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                {...props}
            />
        </div>
    );
};

export default MaskedInput;