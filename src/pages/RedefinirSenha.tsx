import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const RedefinirSenha: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição de senha inválido ou ausente.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/auth/reset-password', {
        token,
        newPassword: password,
      });
      setMessage('Senha redefinida com sucesso! Você será redirecionado para a página de login.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError('Ocorreu um erro ao redefinir a senha. O token pode ser inválido ou ter expirado.');
    }
  };

  if (!token) {
    return (
      <Container className="mt-5">
        <div className="d-flex justify-content-center">
          <Alert variant="danger">Token de redefinição de senha inválido.</Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-center">
        <div style={{ width: '400px' }}>
          <h2 className="text-center mb-4">Redefinir Senha</h2>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Nova Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nova Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
              <Form.Label>Confirmar Nova Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Atualizar Senha
            </Button>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default RedefinirSenha;