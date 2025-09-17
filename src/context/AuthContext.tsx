import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

// Tipos
type User = {
    id: string;
    name: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
};

// Criação do Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Começa como true

    useEffect(() => {
        const loadUserFromStorage = async () => {
            const storedToken = localStorage.getItem('authToken');

            if (storedToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const response = await api.get('/users/profile');
                    setUser(response.data);
                } catch (error) {
                    console.error("Sessão inválida, limpando token.", error);
                    localStorage.removeItem('authToken');
                }
            }
            // Importante: finaliza o carregamento mesmo se não houver token
            setLoading(false);
        };

        loadUserFromStorage();
    }, []); // Roda apenas uma vez quando a aplicação é montada

    const login = (userData: User, token: string) => {
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};