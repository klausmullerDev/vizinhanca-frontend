import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Notification from '../components/Notification';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    // REMOVIDO: O Notification não é mais necessário para erros de formulário
    // const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("A função handleSubmit FOI ACIONADA!");
        e.preventDefault();
        setLoading(true);
        setFormError(null);

        try {
            const loginResponse = await api.post('/users/login', { email, password });
            const { user, token } = loginResponse.data;

            login(user, token);

            const profileResponse = await api.get('/users/profile');
            const { isProfileComplete } = profileResponse.data;

            if (isProfileComplete) {
                navigate('/dashboard');
            } else {
                navigate('/completar-cadastro');
            }

        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao fazer login.';
            setFormError(message);
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (formError) setFormError(null);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (formError) setFormError(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Entrar na sua conta</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        // O erro agora será exibido pelo próprio componente Input
                        error={formError}
                        required
                    />
                    <Input
                        id="password"
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        // O erro agora será exibido pelo próprio componente Input
                        error={formError}
                        required
                    />

                    {/* REMOVIDO: O parágrafo de erro genérico foi removido.
                      O componente Input agora é responsável por mostrar o erro.
                    */}
                    {/* {formError && (
                        <p className="text-sm text-red-600 text-center">{formError}</p>
                    )} */}

                    <Button type="submit" loading={loading}>Entrar</Button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/esqueci-senha" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Esqueceu sua senha?
                    </Link>
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;