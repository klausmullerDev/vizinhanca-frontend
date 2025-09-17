import React from 'react';

const EmptyStateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

export const EmptyState = () => (
    <div className="text-center py-16 sm:py-20 px-6 bg-white rounded-lg border-2 border-dashed border-slate-300">
        <EmptyStateIcon />
        <h2 className="mt-4 text-xl font-semibold text-slate-700">O mural está vazio.</h2>
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">Seja o primeiro a pedir um favor!</p>
    </div>
);