import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const EsqueciSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
      setMessage('Se as credenciais estiverem corretas, você receberá um e-mail com as instruções para redefinir sua senha.');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err: any) {
      setError('Ocorreu um erro. Por favor, tente novamente mais tarde.');
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-center">
        <div style={{ width: '400px' }}>
          <h2 className="text-center mb-4">Esqueci a Senha</h2>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Endereço de e-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Redefinir Senha
            </Button>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default EsqueciSenha;