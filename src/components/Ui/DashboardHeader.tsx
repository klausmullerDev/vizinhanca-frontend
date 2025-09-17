import React from 'react';
import { useNavigate } from 'react-router-dom';

type User = { id: string; name: string | null; email: string; } | null;

interface DashboardHeaderProps {
    user: User;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
    const navigate = useNavigate();

    return (
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-900/10 sticky top-0 z-20">
            <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Mural de Favores</h1>
                    <p className="text-xs sm:text-sm text-slate-500">A ajuda que você precisa está ao lado.</p>
                </div>
                <button
                    onClick={() => user && navigate(`/perfil/${user.id}`)}
                    className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-indigo-700 ring-2 ring-white cursor-pointer"
                    aria-label="Acessar perfil"
                >
                    {user?.name?.charAt(0)}
                </button>
            </div>
        </header>
    );
};