import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

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
    // Adicionando setUser e setLoading para uso interno
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

// Criação do Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// NOVO: Componente que lida com os efeitos colaterais (side-effects) que dependem do roteador.
const AuthEffects = () => {
    const { user, logout, setUser, setLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Efeito para carregar o usuário do localStorage na inicialização
    useEffect(() => {
        const loadUserFromStorage = async () => {
            const storedToken = localStorage.getItem('authToken');

            if (storedToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    // Apenas buscamos os dados básicos do usuário aqui
                    const response = await api.get('/users/me'); // Supondo que esta rota retorne o User
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Roda apenas uma vez

    // Efeito para verificar se o perfil está completo após o login/carregamento
    useEffect(() => {
        const checkProfileCompletion = async () => {
            if (user && location.pathname !== '/completar-cadastro') {
                try {
                    const profileResponse = await api.get('/users/profile');
                    const { isProfileComplete } = profileResponse.data;

                    if (!isProfileComplete) {
                        navigate('/completar-cadastro', { replace: true });
                    }
                } catch (error) {
                    console.error("Erro ao verificar a completude do perfil:", error);
                    logout();
                }
            }
        };
        checkProfileCompletion();
    }, [user, location.pathname, navigate, logout]);

    return null; // Este componente não renderiza nada, apenas executa efeitos.
}

// Componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Começa como true

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
        setUser,
        setLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* AuthEffects é renderizado aqui para ter acesso ao contexto */}
            <AuthEffects />
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