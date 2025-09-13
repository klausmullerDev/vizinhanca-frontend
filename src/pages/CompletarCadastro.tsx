import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function CompletarCadastro() {
  const navigate = useNavigate();
  const [cidade, setCidade] = useState('');
  const [telefone, setTelefone] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await api.put('/users/profile', { cidade, telefone });

      alert('Perfil atualizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao atualizar o perfil', error);
      alert('Não foi possível atualizar o perfil. Tente novamente.');
    }
  }

  return (
    <div>
      <h1>Complete seu Perfil</h1>
      <p>Para continuar, precisamos de mais algumas informações.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Sua cidade"
          value={cidade}
          onChange={e => setCidade(e.target.value)}
        />
        <input
          type="text"
          placeholder="Seu telefone"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
        />
        <button type="submit">Salvar e Continuar</button>
      </form>
    </div>
  );
}