import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  // isLogin controla se estamos na tela de Entrar ou Cadastrar
  const [isLogin, setIsLogin] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    
    try {
      if (isLogin) {
        // Tenta fazer o login
        await signInWithEmailAndPassword(auth, email, senha);
      } else {
        // Tenta criar uma nova conta
        await createUserWithEmailAndPassword(auth, email, senha);
      }
      // Se der tudo certo, redireciona para a tela principal
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setErro('Erro na autenticação. Verifique seus dados ou tente uma senha maior.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>{isLogin ? 'Entrar no App' : 'Criar Nova Conta'}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Seu e-mail" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Sua senha (mínimo 6 caracteres)" 
          value={senha} 
          onChange={(e) => setSenha(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)} 
        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {isLogin ? 'Não tem conta? Clique aqui para cadastrar' : 'Já tem conta? Clique aqui para entrar'}
      </button>

      {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
    </div>
  );
}