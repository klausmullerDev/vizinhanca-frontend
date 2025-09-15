import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const PerfilPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto p-4">
                    <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
                    <p className="text-sm text-slate-500">Gerencie suas informações e saia com segurança.</p>
                </div>
            </header>

            <main className="py-8 px-4 max-w-2xl mx-auto">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Nome</label>
                            <p className="text-lg text-slate-800">{user?.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Email</label>
                            <p className="text-lg text-slate-800">{user?.email}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <button
                                onClick={handleLogout}
                                className="w-full sm:w-auto bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Sair (Logout)
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
