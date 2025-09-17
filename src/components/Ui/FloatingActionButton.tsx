import React from 'react';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

interface FABProps {
    onClick: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-transform hover:scale-110"
        aria-label="Pedir um novo favor"
    >
        <PlusIcon />
    </button>
);