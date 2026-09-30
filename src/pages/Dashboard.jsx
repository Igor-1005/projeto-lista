import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [novaTarefa, setNovaTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        carregarTarefas(user.uid);
      } else {
        navigate('/'); 
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const carregarTarefas = async (uid) => {
    const q = query(collection(db, "tarefas"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    
    const lista = [];
    querySnapshot.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data() });
    });
    setTarefas(lista);
  };

  const adicionarTarefa = async (e) => {
    e.preventDefault();
    if (novaTarefa.trim() === '') return;

    try {
      await addDoc(collection(db, "tarefas"), {
        texto: novaTarefa,
        userId: usuario.uid 
      });
      setNovaTarefa('');
      carregarTarefas(usuario.uid); 
    } catch (error) {
      console.error("Erro ao adicionar: ", error);
    }
  };

  const deletarTarefa = async (id) => {
    try {
      await deleteDoc(doc(db, "tarefas", id));
      carregarTarefas(usuario.uid);
    } catch (error) {
      console.error("Erro ao deletar: ", error);
    }
  };

  const sair = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Minhas Tarefas</h2>
        <button onClick={sair} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sair
        </button>
      </div>

      <form onSubmit={adicionarTarefa} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          value={novaTarefa} 
          onChange={(e) => setNovaTarefa(e.target.value)} 
          placeholder="Digite uma nova tarefa..." 
          style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Adicionar
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tarefas.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>Nenhuma tarefa encontrada.</p>
        ) : (
          tarefas.map((tarefa) => (
            <li key={tarefa.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px' }}>
              <span>{tarefa.texto}</span>
              <button onClick={() => deletarTarefa(tarefa.id)} style={{ padding: '5px 10px', backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer' }}>
                Excluir
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}