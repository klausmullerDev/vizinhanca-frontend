import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

// Tipos
export type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    cpf?: string;
    telefone?: string;
    dataDeNascimento?: string;
    sexo?: string;
    endereco?: object; // Pode ser mais específico se tiver um tipo Endereco
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
                    // ALTERADO: Usando /users/profile que sabemos que existe.
                    const response = await api.get('/users/profile');
                    setUser(response.data);
                } catch (error) {
                    console.error("Sessão inválida, limpando token.", error);
                    // CORRIGIDO: Chama logout() para limpar completamente a sessão.
                    logout();
                }
            }
            // Importante: finaliza o carregamento mesmo se não houver token
            setLoading(false);
        };

        loadUserFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logout, setUser, setLoading]); // Adicionando dependências estáveis

    // Efeito para verificar se o perfil está completo após o login/carregamento
    useEffect(() => {
        const checkProfileCompletion = () => {
            // Se o usuário está logado, mas não tem CPF ou telefone,
            // consideramos o perfil incompleto e o redirecionamos.
            // Isso evita uma chamada extra à API e é mais robusto.
            if (user && (!user.cpf || !user.telefone)) {
                // Evita redirecionamentos infinitos se já estivermos na página correta.
                if (location.pathname !== '/completar-cadastro') {
                    navigate('/completar-cadastro', { replace: true });
                }
            }
        };
        checkProfileCompletion();
    }, [user, location.pathname, navigate]);

    return null; // Este componente não renderiza nada, apenas executa efeitos.
}

// Componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Começa como true

    const login = useCallback((userData: User, token: string) => {
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    }, []);

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        setUser,
        setLoading,
    }), [user, loading, login, logout]);

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