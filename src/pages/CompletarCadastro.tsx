import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useNavigate, useLocation } from 'react-router-dom';

import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Notification from '../components/Notification';
import MaskedInput from '../components/MaskedInput';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Componente customizado para o DatePicker, garantindo o estilo correto.
const DatePickerInput = React.forwardRef<
  HTMLInputElement, 
  { value?: string; onClick?: () => void; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }
>(({ value, onClick, onChange }, ref) => (
  <MaskedInput
    id="dataDeNascimento"
    mask="00/00/0000"
    onClick={onClick}
    ref={ref}
  />
));

const CompletarCadastroPage: React.FC = () => {

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    cpf: '',
    telefone: '',
    dataDeNascimento: null as Date | null,
    sexo: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => {
          if (!response.data.erro) {
            setFormData(prevData => ({
              ...prevData,
              rua: response.data.logradouro,
              bairro: response.data.bairro,
              cidade: response.data.localidade,
              estado: response.data.uf,
            }));
          }
        })
        .catch(error => console.error("Erro ao buscar CEP:", error));
    }
  }, [formData.cep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  
  const handleDateChange = (date: Date | null) => { 
    setFormData({ ...formData, dataDeNascimento: date });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    // Usar FormData para alinhar com a documentação (multipart/form-data)
    const data = new FormData();
    data.append('cpf', formData.cpf.replace(/\D/g, ''));
    data.append('telefone', formData.telefone.replace(/\D/g, ''));
    if (formData.dataDeNascimento) data.append('dataDeNascimento', formData.dataDeNascimento.toISOString().split('T')[0]);
    if (formData.sexo) data.append('sexo', formData.sexo);

    // Adiciona o endereço no formato esperado pelo backend (geralmente `endereco[campo]`)
    data.append('endereco[rua]', formData.rua);
    data.append('endereco[numero]', formData.numero);
    data.append('endereco[bairro]', formData.bairro);
    data.append('endereco[cidade]', formData.cidade);
    data.append('endereco[estado]', formData.estado);
    data.append('endereco[cep]', formData.cep.replace(/\D/g, ''));

    try {
      const response = await api.put('/users/profile', data);
      // Atualiza o usuário no contexto global
      setUser(response.data);
      setNotification({ message: 'Perfil atualizado com sucesso! Redirecionando...', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Não foi possível atualizar o perfil.';
      setNotification({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const sexoOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' },
    { value: 'Outro', label: 'Outro' },
    { value: 'PrefiroNaoInformar', label: 'Prefiro não informar' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Complete o seu Perfil</h2>
        <p className="text-center text-gray-600 mb-6">Para continuar, precisamos de mais algumas informações.</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" autoComplete="off">
          <MaskedInput id="cpf" label="CPF" mask="000.000.000-00" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" autoComplete="off" />
          <MaskedInput id="telefone" label="Telefone" mask="(00) 00000-0000" value={formData.telefone} onChange={handleChange} required placeholder="(00) 00000-0000" autoComplete="off" />
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Data de Nascimento</label>
            <DatePicker              
              selected={formData.dataDeNascimento}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={80}
              customInput={<DatePickerInput />}
            />
          </div>
          <Select id="sexo" label="Gênero" options={sexoOptions} value={formData.sexo} onChange={handleChange} />
          <h3 className="text-lg font-semibold pt-4 md:col-span-2">Endereço</h3>
          <MaskedInput id="cep" label="CEP" mask="00000-000" value={formData.cep} onChange={handleChange} required placeholder="00000-000" autoComplete="off" />
          <Input id="rua" label="Rua" value={formData.rua} onChange={handleChange} required autoComplete="off" />
          <Input id="numero" label="Número" value={formData.numero} onChange={handleChange} required autoComplete="off" />
          <Input id="bairro" label="Bairro" value={formData.bairro} onChange={handleChange} required autoComplete="off" />
          <Input id="cidade" label="Cidade" value={formData.cidade} onChange={handleChange} required autoComplete="off" />
          <Input id="estado" label="Estado" value={formData.estado} onChange={handleChange} required maxLength={2} autoComplete="off" />
          <div className="md:col-span-2">
            <Button type="submit" loading={loading}>Salvar e Continuar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletarCadastroPage;