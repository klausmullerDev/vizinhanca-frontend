import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react'; // Ícone alterado para Heart
import type { User } from '../../context/AuthContext';
import { createResourceURL } from '@/utils/createResourceURL';
import { useNotifications } from '../../context/NotificationsContext';

interface AppHeaderProps {
    user: User | null;
    searchValue: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNotificationsClick: () => void; // Nova prop para controlar o painel
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, searchValue, onSearchChange, onNotificationsClick }) => {
    const { unreadCount } = useNotifications();

    const avatarSrc = createResourceURL(user?.avatar) 
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=e0e7ff&color=4338ca&size=96`;

    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/dashboard" className="text-xl font-bold text-indigo-600">
                            Vizinhança
                        </Link>
                    </div>

                    {/* Barra de Pesquisa */}
                    <div className="flex-1 max-w-md mx-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="search"
                                name="search"
                                id="search"
                                value={searchValue}
                                onChange={onSearchChange}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-full leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Buscar por título ou descrição..."
                            />
                        </div>
                    </div>

                    {/* Ícones da Direita */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button 
                                className="p-2 rounded-full hover:bg-slate-100" 
                                aria-label="Notificações"
                                onClick={onNotificationsClick} // Chama a função do pai
                            >
                                <Heart className="h-6 w-6 text-slate-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                                )}
                            </button>
                        </div>
                        <Link to={`/perfil/${user?.id}`} className="block">
                            <img className="h-9 w-9 rounded-full object-cover ring-2 ring-offset-2 ring-transparent hover:ring-indigo-500 transition-shadow" src={avatarSrc} alt="Avatar do usuário" />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};