import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [novoCarrinho, setNovoCarrinho] = useState('');
  const [carrinhos, setCarrinhos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [totaisCarrinhos, setTotaisCarrinhos] = useState({}); 
  const [editandoId, setEditandoId] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        carregarDados(user.uid);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const carregarDados = async (uid) => {
    await carregarCarrinhos(uid);
    await carregarTotais(uid);
  };

  const carregarCarrinhos = async (uid) => {
    const q = query(collection(db, "carrinhos"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const lista = [];
    querySnapshot.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data() });
    });
    setCarrinhos(lista);
  };

  const carregarTotais = async (uid) => {
    const q = query(collection(db, "itens"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    
    const totaisCalculados = {};
    querySnapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const valorItem = item.quantidade * item.preco;
      
      if (totaisCalculados[item.carrinhoId]) {
        totaisCalculados[item.carrinhoId] += valorItem;
      } else {
        totaisCalculados[item.carrinhoId] = valorItem;
      }
    });
    
    setTotaisCarrinhos(totaisCalculados);
  };

  const adicionarCarrinho = async (e) => {
    e.preventDefault();
    if (novoCarrinho.trim() === '') return;

    try {
      await addDoc(collection(db, "carrinhos"), {
        nome: novoCarrinho,
        userId: usuario.uid
      });
      setNovoCarrinho('');
      carregarDados(usuario.uid);
    } catch (error) {
      console.error("Erro ao adicionar carrinho: ", error);
    }
  };

  const deletarCarrinho = async (id) => {
    if(window.confirm("Tem certeza que deseja excluir este carrinho?")) {
      try {
        await deleteDoc(doc(db, "carrinhos", id));
        carregarDados(usuario.uid);
      } catch (error) {
        console.error("Erro ao deletar: ", error);
      }
    }
  };

  const iniciarEdicao = (carrinho) => {
    setEditandoId(carrinho.id);
    setNomeEditado(carrinho.nome);
  };

  const salvarEdicao = async (id) => {
    if (nomeEditado.trim() === '') return;
    try {
      await updateDoc(doc(db, "carrinhos", id), {
        nome: nomeEditado
      });
      setEditandoId(null);
      carregarDados(usuario.uid);
    } catch (error) {
      console.error("Erro ao atualizar: ", error);
    }
  };

  const sair = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>🛒 Meus Carrinhos</h2>
        
        <div>
          <button onClick={() => navigate('/graficos')} style={{ padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}>
            📊 Ver Gráficos
          </button>
          
          <button onClick={sair} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sair
          </button>
        </div>
      </div>

      <form onSubmit={adicionarCarrinho} style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
        <input 
          type="text" 
          value={novoCarrinho} 
          onChange={(e) => setNovoCarrinho(e.target.value)} 
          placeholder="Ex: Compras do Mês, Festa de Aniversário..." 
          style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '15px 30px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          Criar Carrinho
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {carrinhos.length === 0 ? (
          <p style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center' }}>Nenhum carrinho criado ainda. Crie o primeiro acima!</p>
        ) : (
          carrinhos.map((carrinho) => {
            const total = totaisCarrinhos[carrinho.id] || 0;

            return (
              <div key={carrinho.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {editandoId === carrinho.id ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      value={nomeEditado} 
                      onChange={(e) => setNomeEditado(e.target.value)} 
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <button onClick={() => salvarEdicao(carrinho.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>Salvar</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '1.2rem' }}>
                        {carrinho.nome}
                      </h3>
                      <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                      </p>
                    </div>
                    <button onClick={() => iniciarEdicao(carrinho)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>✏️ Editar</button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => navigate(`/carrinho/${carrinho.id}`)} 
                    style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🛒 Entrar
                  </button>
                  <button 
                    onClick={() => deletarCarrinho(carrinho.id)} 
                    style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}