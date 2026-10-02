# 🛒 Gestor Inteligente de Compras

Um aplicativo web completo para gerenciamento de compras, controle de orçamento em tempo real e visualização de dados financeiros. Desenvolvido como projeto acadêmico demonstrando proficiência em React, integração com Backend as a Service (Firebase) e design de interface moderno.

## ✨ Funcionalidades

* **Autenticação Segura:** Sistema de login e registro gerenciado pelo Firebase Auth, garantindo total isolamento e privacidade dos dados de cada usuário.
* **Gestão de Carrinhos (Categorias):** Criação, edição, leitura e exclusão de diferentes carrinhos de compras (ex: Mercado, Peças, Festas).
* **Controle Detalhado de Itens (CRUD):** 
  * Adição de produtos com nome, quantidade e preço.
  * Edição dinâmica em linha (inline) de itens já cadastrados.
  * Gestão de status visual do produto (Pendente, Em Orçamento, Finalizado).
* **Cálculos em Tempo Real:** Subtotais por item e totais gerais por carrinho calculados e renderizados dinamicamente via gerenciamento de estado, sem necessidade de recarregar a página.
* **Dashboard Financeiro:** Visualização da distribuição de despesas através de gráficos interativos (Pizza e Barras) gerados com a biblioteca `recharts`.

## 🚀 Tecnologias Utilizadas

* **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Roteamento:** React Router DOM
* **Visualização de Dados:** Recharts
* **Backend & Banco de Dados:** Firebase (Authentication & Firestore NoSQL)
* **Estilização:** CSS3 Nativo (Flexbox e CSS Grid)

## 🛠️ Como rodar o projeto localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado em sua máquina.
* O gerenciador de pacotes NPM (já vem com o Node).

### Passos para instalação

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/Igor-1005/projeto-lista](https://github.com/Igor-1005/projeto-lista)
   ```
2. **Acesse a pasta do projeto:**
   ```bash
   cd projeto-lista
   ```
3. **Instale as dependências:**
   ```bash
   npm install
   ```
4. **Inicie o servidor local:**
   ```bash
   npm run dev
   ```
5. Acesse o link gerado no terminal (geralmente `http://localhost:5173`) no seu navegador.

## 📁 Estrutura de Pastas Principal

```text
src/
├── assets/          # Ícones e imagens estáticas
├── pages/           # Telas da aplicação (Login, Dashboard, CarrinhoDetalhes, Graficos)
├── App.jsx          # Configuração de rotas (React Router)
├── firebase.js      # Inicialização e conexão com o banco de dados Firebase
└── main.jsx         # Ponto de entrada do React
```

## 👤 Autor

Desenvolvido por João Igor - Análise e Desenvolvimento de Sistemas.