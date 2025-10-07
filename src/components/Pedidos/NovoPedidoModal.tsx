import React, { useState, type FormEvent, useRef } from 'react';
import { api } from '../../services/api';
import { Camera, X } from 'lucide-react';

// Adicionando o tipo Pedido para alinhar com o Dashboard
type Author = {
    id: string;
    name: string;
    avatar?: string;
};

type Interesse = {
    user: {
        id: string;
        name: string;
        avatar?: string;
    }
};

type Pedido = {
    id: string;
    titulo: string;
    descricao: string;
    status: string;
    imagem?: string;
    createdAt: string;
    author: Author;
    usuarioJaDemonstrouInteresse: boolean;
    interesses: Interesse[];
    interessesCount: number;
};

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

interface NovoPedidoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPedidoCriado: (novoPedido: Pedido) => void;
}

export const NovoPedidoModal: React.FC<NovoPedidoModalProps> = ({ isOpen, onClose, onPedidoCriado }) => {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    // NOVOS ESTADOS: Para o arquivo da imagem e sua pré-visualização
    const [imagemFile, setImagemFile] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!titulo.trim() || !descricao.trim()) {
            return; // A validação do backend cuidará disso, ou podemos adicionar notificação no Dashboard
        }
        setLoading(true);

        // ALTERADO: Usa FormData para enviar arquivos e texto
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descricao', descricao);
        if (imagemFile) {
            formData.append('imagem', imagemFile);
        }

        try {
            const response = await api.post('/pedidos', formData);
            // Limpa o formulário e chama o callback de sucesso
            setTitulo('');
            setDescricao('');
            setImagemFile(null);
            setImagemPreview('');
            onPedidoCriado(response.data);
        } catch (error) {
            // O Dashboard já lida com a exibição de erros da API
            console.error("Erro ao criar pedido:", error);
        } finally {
            setLoading(false);
        }
    };

    // NOVA FUNÇÃO: Lida com a seleção de um novo arquivo de imagem
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagemFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagemPreview(previewUrl);
        }
    };

    // NOVA FUNÇÃO: Remove a imagem selecionada
    const handleRemoveImage = () => {
        setImagemFile(null);
        setImagemPreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30" onClick={onClose}></div>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in-0 zoom-in-95" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold text-slate-800">Pedir um novo favor</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><XIcon /></button>
                    </div>
                    <form onSubmit={handleCreate} className="p-6 space-y-6">
                        <div>
                            <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                            <input 
                                type="text" 
                                id="titulo" 
                                name="titulo" 
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required 
                                placeholder='Ex: Furadeira emprestada' 
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                            />
                        </div>
                        <div>
                            <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                            <textarea 
                                id="descricao" 
                                name="descricao" 
                                rows={4} 
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                required 
                                placeholder="Descreva o que você precisa." 
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            ></textarea>
                        </div>
                        {/* Seção de Upload de Imagem */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Imagem (Opcional)</label>
                            {imagemPreview ? (
                                <div className="relative group">
                                    <img src={imagemPreview} alt="Pré-visualização" className="w-full h-48 object-cover rounded-md border" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
                                        aria-label="Remover imagem"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
                                >
                                    <div className="space-y-1 text-center">
                                        <Camera className="mx-auto h-12 w-12 text-slate-400" />
                                        <p className="text-sm text-slate-600">Clique para selecionar ou arraste uma imagem</p>
                                        <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                {loading ? 'Publicando...' : 'Publicar Pedido'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};