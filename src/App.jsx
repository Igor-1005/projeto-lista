import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CarrinhoDetalhes from './pages/CarrinhoDetalhes';
import Graficos from './pages/Graficos';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/carrinho/:id" element={<CarrinhoDetalhes />} />
        <Route path="/graficos" element={<Graficos />} />
      </Routes>
    </BrowserRouter>
  );
}