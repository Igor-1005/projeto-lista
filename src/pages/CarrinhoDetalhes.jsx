import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

export default function CarrinhoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [nomeCarrinho, setNomeCarrinho] = useState('Carregando...');
  const [itens, setItens] = useState([]);
  
  // Estados para adicionar um novo item
  const [nomeItem, setNomeItem] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [preco, setPreco] = useState('');
  const [status, setStatus] = useState('Pendente');

  // Novos estados para a funcionalidade de Edição
  const [editandoItemId, setEditandoItemId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editQuantidade, setEditQuantidade] = useState(1);
  const [editPreco, setEditPreco] = useState('');

  useEffect(() => {
    carregarDadosDoCarrinho();
    carregarItens();
  }, [id]);

  const carregarDadosDoCarrinho = async () => {
    const docRef = doc(db, "carrinhos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setNomeCarrinho(docSnap.data().nome);
    } else {
      setNomeCarrinho("Carrinho não encontrado");
    }
  };

  const carregarItens = async () => {
    const q = query(collection(db, "itens"), where("carrinhoId", "==", id));
    const querySnapshot = await getDocs(q);
    const lista = [];
    querySnapshot.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data() });
    });
    setItens(lista);
  };

  const adicionarItem = async (e) => {
    e.preventDefault();
    if (nomeItem.trim() === '' || preco === '') return;

    try {
      await addDoc(collection(db, "itens"), {
        nome: nomeItem,
        quantidade: Number(quantidade),
        preco: Number(preco),
        status: status,
        carrinhoId: id,
        userId: auth.currentUser.uid
      });
      setNomeItem('');
      setQuantidade(1);
      setPreco('');
      setStatus('Pendente');
      carregarItens(); 
    } catch (error) {
      console.error("Erro ao adicionar item: ", error);
    }
  };

  const deletarItem = async (itemId) => {
    if(window.confirm("Remover este item?")) {
      await deleteDoc(doc(db, "itens", itemId));
      carregarItens();
    }
  };

  const atualizarStatus = async (itemId, novoStatus) => {
    await updateDoc(doc(db, "itens", itemId), {
      status: novoStatus
    });
    carregarItens();
  };

  // Funções para gerir a Edição dos Itens
  const iniciarEdicaoItem = (item) => {
    setEditandoItemId(item.id);
    setEditNome(item.nome);
    setEditQuantidade(item.quantidade);
    setEditPreco(item.preco);
  };

  const cancelarEdicao = () => {
    setEditandoItemId(null);
  };

  const salvarEdicaoItem = async (itemId) => {
    if (editNome.trim() === '' || editPreco === '') return;
    try {
      await updateDoc(doc(db, "itens", itemId), {
        nome: editNome,
        quantidade: Number(editQuantidade),
        preco: Number(editPreco)
      });
      setEditandoItemId(null);
      carregarItens();
    } catch (error) {
      console.error("Erro ao atualizar item: ", error);
    }
  };

  const valorTotal = itens.reduce((total, item) => total + (item.quantidade * item.preco), 0);

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            ← Voltar aos Carrinhos
          </button>
          <h2 style={{ margin: 0, color: '#333' }}>🛒 {nomeCarrinho}</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Total do Carrinho</p>
          <h3 style={{ margin: 0, color: '#10b981', fontSize: '24px' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
          </h3>
        </div>
      </div>

      {/* Formulário de Adição de Item */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>Adicionar Novo Item</h3>
        <form onSubmit={adicionarItem} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" placeholder="Nome do produto" required
            value={nomeItem} onChange={(e) => setNomeItem(e.target.value)} 
            style={{ flex: '2', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
          <input 
            type="number" min="1" placeholder="Qtd" required
            value={quantidade} onChange={(e) => setQuantidade(e.target.value)} 
            style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
          <input 
            type="number" step="0.01" min="0" placeholder="Preço (R$)" required
            value={preco} onChange={(e) => setPreco(e.target.value)} 
            style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
          <select 
            value={status} onChange={(e) => setStatus(e.target.value)}
            style={{ flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
            <option value="Pendente">Pendente</option>
            <option value="Em Orçamento">Em Orçamento</option>
            <option value="Finalizado">Finalizado</option>
          </select>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Adicionar
          </button>
        </form>
      </div>

      {/* Lista de Itens */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {itens.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>O carrinho está vazio.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '15px' }}>Produto</th>
                <th style={{ padding: '15px' }}>Qtd</th>
                <th style={{ padding: '15px' }}>Preço Un.</th>
                <th style={{ padding: '15px' }}>Subtotal</th>
                <th style={{ padding: '15px' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  
                  {editandoItemId === item.id ? (
                    /* MODO DE EDIÇÃO ATIVO */
                    <>
                      <td style={{ padding: '15px' }}>
                        <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                      </td>
                      <td style={{ padding: '15px' }}>
                        <input type="number" min="1" value={editQuantidade} onChange={(e) => setEditQuantidade(e.target.value)} style={{ width: '60px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                      </td>
                      <td style={{ padding: '15px' }}>
                        <input type="number" step="0.01" min="0" value={editPreco} onChange={(e) => setEditPreco(e.target.value)} style={{ width: '80px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                      </td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>R$ {(editQuantidade * editPreco).toFixed(2)}</td>
                      <td style={{ padding: '15px', color: '#666', fontSize: '14px' }}>Guardar p/ alterar</td>
                      <td style={{ padding: '15px', textAlign: 'right', display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        <button onClick={() => salvarEdicaoItem(item.id)} style={{ padding: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Guardar">
                          💾
                        </button>
                        <button onClick={cancelarEdicao} style={{ padding: '8px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Cancelar">
                          ❌
                        </button>
                      </td>
                    </>
                  ) : (
                    /* MODO DE VISUALIZAÇÃO NORMAL */
                    <>
                      <td style={{ padding: '15px', fontWeight: '500' }}>{item.nome}</td>
                      <td style={{ padding: '15px' }}>{item.quantidade}x</td>
                      <td style={{ padding: '15px' }}>R$ {Number(item.preco).toFixed(2)}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>R$ {(item.quantidade * item.preco).toFixed(2)}</td>
                      <td style={{ padding: '15px' }}>
                        <select 
                          value={item.status} 
                          onChange={(e) => atualizarStatus(item.id, e.target.value)}
                          style={{ 
                            padding: '5px', borderRadius: '4px', border: '1px solid #ddd',
                            backgroundColor: item.status === 'Finalizado' ? '#d1fae5' : item.status === 'Em Orçamento' ? '#fef3c7' : '#fee2e2',
                            color: item.status === 'Finalizado' ? '#065f46' : item.status === 'Em Orçamento' ? '#92400e' : '#991b1b'
                          }}>
                          <option value="Pendente">Pendente</option>
                          <option value="Em Orçamento">Em Orçamento</option>
                          <option value="Finalizado">Finalizado</option>
                        </select>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right', display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        <button onClick={() => iniciarEdicaoItem(item)} style={{ padding: '8px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Editar">
                          ✏️
                        </button>
                        <button onClick={() => deletarItem(item.id)} style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Excluir">
                          🗑️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}