import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Notification from '../components/Notification';
import MaskedInput from '../components/MaskedInput';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CompletarCadastroPage: React.FC = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cpf: '',
    telefone: '',
    dataDeNascimento: '',
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
    setFormData({ ...formData, dataDeNascimento: date ? date.toISOString().split('T')[0] : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const profileData = {
      cpf: formData.cpf.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
      dataDeNascimento: formData.dataDeNascimento ? new Date(formData.dataDeNascimento) : undefined,
      sexo: formData.sexo,
      endereco: {
        rua: formData.rua,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep.replace(/\D/g, ''),
      }
    };

    try {
      console.log('Enviando dados para a API:', profileData);
      await api.put('/users/profile', profileData);
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
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Complete o seu Perfil</h2>
        <p className="text-center text-gray-600 mb-6">Para continuar, precisamos de mais algumas informações.</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md-grid-cols-2 gap-4" autoComplete="off">
          <MaskedInput id="cpf" label="CPF" mask="000.000.000-00" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" autoComplete="off" />
          <MaskedInput id="telefone" label="Telefone" mask="(00) 00000-0000" value={formData.telefone} onChange={handleChange} required placeholder="(00) 00000-0000" autoComplete="off" />
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Data de Nascimento</label>
            <DatePicker
              selected={formData.dataDeNascimento ? new Date(formData.dataDeNascimento + 'T00:00:00') : null}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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