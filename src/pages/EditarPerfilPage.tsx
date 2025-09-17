import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { Loader } from '../components/Ui/Loader';

// Tipos
type ProfileFormData = {
    name: string;
    telefone: string; // Alterado para sempre ser string
    cpf: string;      // Alterado para sempre ser string
};

type FormErrors = {
    telefone?: string;
    cpf?: string;
};

// --- FUNÇÕES DE VALIDAÇÃO ---
// Valida se o CPF (apenas dígitos) tem 11 caracteres
const validateCPF = (cpf: string): string | undefined => {
    if (!cpf) return undefined; // Campo não é obrigatório
    const cpfDigits = cpf.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (cpfDigits.length !== 11) {
        return 'O CPF deve conter 11 dígitos.';
    }
    return undefined;
};

// Valida se o telefone (apenas dígitos) tem 10 ou 11 caracteres (fixo ou celular)
const validateTelefone = (telefone: string): string | undefined => {
    if (!telefone) return undefined; // Campo não é obrigatório
    const telDigits = telefone.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (telDigits.length < 10 || telDigits.length > 11) {
        return 'O telefone deve conter 10 ou 11 dígitos (com DDD).';
    }
    return undefined;
};

export const EditarPerfilPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ProfileFormData>({ name: '', telefone: '', cpf: '' });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    // NOVO: Estado para armazenar os erros de validação
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                const { name, telefone, cpf } = response.data;
                setFormData({ name, telefone: telefone || '', cpf: cpf || '' });
            } catch (error) {
                setNotification({ message: 'Erro ao carregar dados do perfil.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // ALTERADO: `handleChange` agora também valida os campos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validação em tempo real
        if (name === 'cpf') {
            setErrors(prev => ({ ...prev, cpf: validateCPF(value) }));
        }
        if (name === 'telefone') {
            setErrors(prev => ({ ...prev, telefone: validateTelefone(value) }));
        }
    };

    // ALTERADO: `handleSubmit` agora checa se existem erros antes de enviar
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Checa todos os campos uma última vez antes de submeter
        const finalCpfError = validateCPF(formData.cpf);
        const finalTelefoneError = validateTelefone(formData.telefone);

        if (finalCpfError || finalTelefoneError) {
            setErrors({ cpf: finalCpfError, telefone: finalTelefoneError });
            setNotification({ message: 'Por favor, corrija os erros no formulário.', type: 'error' });
            return;
        }

        try {
            // Envia apenas os campos que não estão vazios
            const dataToSubmit = {
                name: formData.name,
                ...(formData.cpf && { cpf: formData.cpf.replace(/\D/g, '') }),
                ...(formData.telefone && { telefone: formData.telefone.replace(/\D/g, '') }),
            };

            await api.put('/users/profile', dataToSubmit);
            setNotification({ message: 'Perfil atualizado com sucesso!', type: 'success' });
            setTimeout(() => {
                if (user) navigate(`/perfil/${user.id}`);
            }, 1500);
        } catch (error) {
            setNotification({ message: 'Não foi possível atualizar o perfil.', type: 'error' });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto p-4">
                    <h1 className="text-2xl font-bold text-slate-800">Editar Perfil</h1>
                    <p className="text-sm text-slate-500">Atualize suas informações pessoais.</p>
                </div>
            </header>
            <main className="py-8 px-4 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                    {/* Campo Nome (inalterado) */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="block w-full border-slate-300 rounded-md" required />
                    </div>

                    {/* Campo Telefone com Validação */}
                    <div>
                        <label htmlFor="telefone" className="block text-sm font-medium text-slate-700 mb-1">Telefone (com DDD)</label>
                        <input
                            type="tel"
                            id="telefone"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                            placeholder="(XX) XXXXX-XXXX"
                            // NOVO: Estilo condicional para erro e atributos mobile-friendly
                            className={`block w-full rounded-md ${errors.telefone ? 'border-red-500 ring-red-500' : 'border-slate-300'}`}
                            inputMode="tel" // Melhora a experiência em teclados mobile
                        />
                        {errors.telefone && <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>}
                    </div>

                    {/* Campo CPF com Validação */}
                    <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                        <input
                            type="text"
                            id="cpf"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            // NOVO: Estilo condicional para erro e atributos mobile-friendly
                            className={`block w-full rounded-md ${errors.cpf ? 'border-red-500 ring-red-500' : 'border-slate-300'}`}
                            inputMode="numeric" // Melhora a experiência em teclados mobile
                        />
                        {errors.cpf && <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>}
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={() => user && navigate(`/perfil/${user.id}`)} className="bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};