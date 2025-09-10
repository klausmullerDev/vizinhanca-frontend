import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; 
import Input from '../components/Input';
import Button from '../components/Button';
import Notification from '../components/Notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate(); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao fazer login.');

            login(data.user, data.token);
            navigate('/dashboard'); 

        } catch (error: any) {
            setNotification({ message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Entrar na sua conta</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input id="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input id="password" label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <Button type="submit" loading={loading}>Entrar</Button>
                </form>
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