// src/components/Button.tsx

import React from 'react';

// Ícone de spinner
const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// A interface herda TODAS as propriedades de um botão HTML padrão
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, loading = false, ...props }) => {
    const baseClasses = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
    const disabledClasses = "disabled:bg-indigo-400 disabled:cursor-not-allowed";

    return (
        <button
            // O {...props} é a chave! Ele passa type="submit", onClick, etc.
            // para o elemento <button> real.
            {...props}
            disabled={loading || props.disabled}
            className={`${baseClasses} ${disabledClasses}`}
        >
            {loading && <ButtonSpinner />}
            {children}
        </button>
    );
};

export default Button;