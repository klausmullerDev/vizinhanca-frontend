import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../components/Notification';
import { Loader } from '../components/Ui/Loader';
import { createResourceURL } from '../context/createResourceURL';

// Tipos
type ProfileFormData = {
    name: string;
    telefone: string; // Alterado para sempre ser string
    cpf: string;      // Alterado para sempre ser string
    // Adicionando campos de endereço
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
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
    const { user, setUser } = useAuth(); // Adicionado setUser
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ProfileFormData>({ 
        name: '', 
        telefone: '', 
        cpf: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: ''
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    // NOVO: Estado para armazenar os erros de validação
    const [errors, setErrors] = useState<FormErrors>({});
    // NOVOS ESTADOS: Para o arquivo do avatar e sua pré-visualização
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get<{ name: string; telefone?: string; cpf?: string; avatar?: string; endereco?: any }>('/users/profile');
                const { name, telefone, cpf, avatar, endereco } = response.data;
                setFormData({ 
                    name: name || '', 
                    telefone: telefone || '', 
                    cpf: cpf || '',
                    cep: endereco?.cep || '',
                    rua: endereco?.rua || '',
                    numero: endereco?.numero || '',
                    bairro: endereco?.bairro || '',
                    cidade: endereco?.cidade || '',
                    estado: endereco?.estado || ''
                });
                // ALTERADO: Constrói a URL completa do avatar se ele não for uma URL completa.
                setAvatarPreview(createResourceURL(avatar) || null);
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

    // NOVA FUNÇÃO: Lida com a seleção de um novo arquivo de imagem
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('Arquivo de avatar selecionado:', file);
            setAvatarFile(file);
            // Cria uma URL local para a pré-visualização da imagem
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    // ALTERADO: `handleSubmit` agora checa se existem erros antes de enviar
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true); // Adicionado para desabilitar o botão durante o envio

        // Checa todos os campos uma última vez antes de submeter
        const finalCpfError = validateCPF(formData.cpf);
        const finalTelefoneError = validateTelefone(formData.telefone);

        if (finalCpfError || finalTelefoneError) {
            setErrors({ cpf: finalCpfError, telefone: finalTelefoneError });
            setLoading(false); // Para o loading se houver erro de validação
            setNotification({ message: 'Por favor, corrija os erros no formulário.', type: 'error' });
            return;
        }

        try {
            // Usa FormData para enviar arquivos e texto
            const data = new FormData();
            data.append('name', formData.name);
            if (formData.cpf) data.append('cpf', formData.cpf.replace(/\D/g, ''));
            if (formData.telefone) data.append('telefone', formData.telefone.replace(/\D/g, ''));
            if (avatarFile) {
                data.append('avatar', avatarFile);
            }
            // Adicionando o endereço ao FormData
            // O backend (com Multer + Express) geralmente espera campos aninhados neste formato.
            if (formData.rua) data.append('endereco[rua]', formData.rua);
            if (formData.numero) data.append('endereco[numero]', formData.numero);
            if (formData.bairro) data.append('endereco[bairro]', formData.bairro);
            if (formData.cidade) data.append('endereco[cidade]', formData.cidade);
            if (formData.estado) data.append('endereco[estado]', formData.estado);
            if (formData.cep) data.append('endereco[cep]', formData.cep.replace(/\D/g, ''));

            // NOVO: Log para depurar o FormData
            console.log('Enviando os seguintes dados para a API:');
            for (const [key, value] of data.entries()) {
                console.log(`${key}:`, value);
            }

            // O Axios definirá o Content-Type como multipart/form-data automaticamente
            const response = await api.put('/users/profile', data);

            setNotification({ message: 'Perfil atualizado com sucesso!', type: 'success' });
            
            // NOVO: Atualiza o estado global do usuário com os dados retornados
            setUser(response.data);

            setTimeout(() => {
                if (user) navigate(`/perfil/${user.id}`);
            }, 1500);
        } catch (error) {
            console.error('Erro ao atualizar o perfil:', error); // Log do erro
            setNotification({ message: 'Não foi possível atualizar o perfil. Verifique o console para mais detalhes.', type: 'error' });
        } finally {
            setLoading(false); // Garante que o loading termine
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <Notification 
                notification={notification}
                onClose={() => setNotification(null)}
            />
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">Editar Perfil</h1>
                    <Link to={`/perfil/${user?.id}`} className="text-sm font-semibold text-indigo-600 hover:underline">
                        Voltar ao Perfil
                    </Link>
                </div>
            </header>
            <main className="py-8 px-4 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                    {/* Seção do Avatar */}
                    <div className="flex flex-col items-center space-y-4">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            <img 
                                src={avatarPreview || `https://ui-avatars.com/api/?name=${formData.name}&background=e0e7ff&color=4338ca&size=128`} 
                                alt="Avatar" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md hover:opacity-90 transition-opacity"
                            />
                        </label>
                        <input 
                            id="avatar-upload"
                            type="file" 
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="avatar-upload" className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">Alterar foto</label>
                    </div>

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

                    {/* Seção de Endereço */}
                    <div className="md:col-span-2 pt-4">
                        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Endereço</h3>
                    </div>

                    <div>
                        <label htmlFor="cep" className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                        <input type="text" id="cep" name="cep" value={formData.cep} onChange={handleChange} className="block w-full border-slate-300 rounded-md" placeholder="00000-000" />
                    </div>
                    <div>
                        <label htmlFor="rua" className="block text-sm font-medium text-slate-700 mb-1">Rua</label>
                        <input type="text" id="rua" name="rua" value={formData.rua} onChange={handleChange} className="block w-full border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="numero" className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                        <input type="text" id="numero" name="numero" value={formData.numero} onChange={handleChange} className="block w-full border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="bairro" className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                        <input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} className="block w-full border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="cidade" className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                        <input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} className="block w-full border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                        <input type="text" id="estado" name="estado" value={formData.estado} onChange={handleChange} className="block w-full border-slate-300 rounded-md" maxLength={2} />
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={() => user && navigate(`/perfil/${user.id}`)} className="bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};