import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function Graficos() {
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const carregarDados = async () => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;

      try {
        const qCarrinhos = query(collection(db, "carrinhos"), where("userId", "==", uid));
        const snapCarrinhos = await getDocs(qCarrinhos);
        const mapaCarrinhos = {};
        snapCarrinhos.forEach(doc => {
          mapaCarrinhos[doc.id] = doc.data().nome;
        });

        const qItens = query(collection(db, "itens"), where("userId", "==", uid));
        const snapItens = await getDocs(qItens);

        const totais = {};
        snapItens.forEach(docSnap => {
          const item = docSnap.data();
          const totalItem = item.quantidade * item.preco;
          if (totais[item.carrinhoId]) {
            totais[item.carrinhoId] += totalItem;
          } else {
            totais[item.carrinhoId] = totalItem;
          }
        });

        const dadosFinais = Object.keys(totais).map(carrinhoId => ({
          name: mapaCarrinhos[carrinhoId] || 'Carrinho Excluído',
          value: totais[carrinhoId]
        }));

        setDadosGrafico(dadosFinais);
      } catch (error) {
        console.error("Erro ao gerar gráficos:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const valorTotalGeral = dadosGrafico.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            ← Voltar ao Painel
          </button>
          <h2 style={{ margin: 0, color: '#333' }}>📊 Dashboard Financeiro</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Custo Total Acumulado</p>
          <h3 style={{ margin: 0, color: '#10b981', fontSize: '24px' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalGeral)}
          </h3>
        </div>
      </div>

      {carregando ? (
        <p style={{ textAlign: 'center', fontSize: '18px' }}>A processar os dados financeiros...</p>
      ) : dadosGrafico.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', backgroundColor: '#fff', padding: '30px', borderRadius: '12px' }}>
          Não há dados suficientes. Adicione itens aos seus carrinhos para gerar os gráficos!
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center', color: '#374151', marginBottom: '20px' }}>Distribuição por Carrinho</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosGrafico} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                    {dadosGrafico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center', color: '#374151', marginBottom: '20px' }}>Comparação de Custos</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {dadosGrafico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}