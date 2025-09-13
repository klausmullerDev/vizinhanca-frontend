import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';


import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Notification from '../components/Notification';
import MaskedInput from '../components/MaskedInput';


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const profileData = {
      cpf: formData.cpf.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
      dataDeNascimento: formData.dataDeNascimento,
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
          <Input id="dataDeNascimento" label="Data de Nascimento" type="date" value={formData.dataDeNascimento} onChange={handleChange} required autoComplete="off" />
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

