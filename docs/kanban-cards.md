# Quadro Kanban — GitHub Projects
## sistema-gestao-pedidos

Criar um novo Project no GitHub (aba "Projects" do repositório) com as
colunas abaixo e adicione os cards na ordem indicada.

---

## COLUNA: ✅ Concluído

---
**[INFRA] Criar repositório e configurar estrutura de pastas**
- Responsável: Dev 3
- Prazo: 17/03 ✅ Concluído
- Tarefas:
  - [x] Criar repo `sistema-gestao-pedidos` no GitHub
  - [x] Adicionar README, .gitignore, .env.example
  - [x] Criar estrutura de pastas (frontend/, backend/, database/, docs/)
  - [x] Criar branch `develop` a partir da `main`
  - [x] Configurar proteção da branch `main` (exigir PR + 1 aprovação)
  - [x] Criar quadro Kanban no GitHub Projects

---
**[INFRA] Configurar banco de dados no Supabase**
- Responsável: Dev 3
- Prazo: 18/03 ✅ Concluído
- Tarefas:
  - [x] Criar conta e projeto no Supabase
  - [x] Executar database/schema.sql no SQL Editor do Supabase (3 tabelas: produtos, pedidos, itens_pedido)
  - [x] Ativar Supabase Auth: Authentication → Settings → habilitar provider Email
  - [x] Criar usuária inicial pelo painel com role: admin nos metadados
  - [x] Salvar credenciais (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY) no .env.example

---
**[INFRA] Criar workflows de CI/CD**
- Responsável: Dev 3
- Prazo: 18/03 ✅ Concluído
- Branch: feature/ci-cd-setup — Mergeado
- Tarefas:
  - [x] Criar .github/workflows/ci-develop.yml
  - [x] Criar .github/workflows/ci-main.yml
  - [x] Criar .github/pull_request_template.md
  - [x] Testar pipeline com PR de exemplo

---
**[BACKEND] Configurar servidor Node.js + Express**
- Responsável: Dev 2
- Prazo: 18/03 ✅ Concluído
- Branch: feature/backend-setup — Mergeado
- Tarefas:
  - [x] Inicializar package.json
  - [x] Instalar dependências: express, @supabase/supabase-js, dotenv, cors
  - [x] Criar server.js com health check (GET /)
  - [x] Criar lib/supabase.js — cliente Supabase isolado (evita dependência circular)
  - [x] Configurar cliente com SUPABASE_SECRET_KEY

---
**[BACKEND] Configurar autenticação com Supabase Auth**
- Responsável: Dev 2
- Prazo: 19/03 ✅ Concluído
- Branch: feature/auth-backend — Mergeado
- Tarefas:
  - [x] Criar middleware authenticateUser — valida token JWT via supabase.auth.getUser(token)
  - [x] Aplicar middleware nas rotas protegidas

---
**[FRONTEND] Criar tela de login**
- Responsável: Dev 1
- Prazo: 19/03 ✅ Concluído
- Branch: feature/login-page — Mergeado
- Tarefas:
  - [x] Criar login.html com formulário (e-mail + senha)
  - [x] Criar css/style.css com layout responsivo global
  - [x] Criar js/supabase-client.js — inicializar cliente com SUPABASE_PUBLISHABLE_KEY
  - [x] Criar js/auth.js — login, logout, exigirAutenticacao(), getToken()
  - [x] Redirecionar por role após login: admin para admin/dashboard.html, customer para index.html

---
**[BACKEND] CRUD de produtos**
- Responsável: Dev 2
- Prazo: 20/03 ✅ Concluído
- Branch: feature/produtos-backend — Mergeado
- Tarefas:
  - [x] GET /produtos — público, sem autenticação
  - [x] GET /produtos/:id — público
  - [x] POST /produtos — protegido, apenas admin
  - [x] PUT /produtos/:id — protegido, apenas admin
  - [x] DELETE /produtos/:id — protegido, apenas admin (soft delete)

---

## COLUNA: 📋 Backlog

### FASE I — até Defesa Parcial (26/03–01/04)

---
**[BACKEND] Middleware de roles (admin vs customer)**
- Responsável: Dev 2
- Prazo: 22/03
- Branch: feature/roles-middleware
- Tarefas:
  - Criar middleware requireAdmin — verifica user.user_metadata.role === 'admin', retorna 403 se não for
  - Criar middleware requireCustomer — verifica se o usuário está autenticado (qualquer role)
  - Substituir authenticateUser por requireAdmin nas rotas de escrita de produtos (POST, PUT, DELETE /produtos)
  - Aplicar requireAdmin na rota GET /pedidos para admin ver todos os pedidos
  - Aplicar requireCustomer na rota POST /pedidos para cliente autenticado registrar pedido
  - Abrir PR para develop
- Observação: roles definidos em user_metadata.role do Supabase Auth — 'admin' para a vendedora, 'customer' para clientes

---
**[BACKEND] Cadastro e pedidos de clientes**
- Responsável: Dev 2
- Prazo: 22/03
- Branch: feature/clientes-backend
- Tarefas:
  - POST /cadastro — registrar novo cliente via supabase.auth.admin.createUser() com role: customer nos metadados
  - POST /pedidos — registrar pedido do cliente autenticado (requireCustomer); usuario_id extraído do token, não do body
  - GET /pedidos — admin vê todos; customer vê apenas os próprios (filtrar por usuario_id)
  - GET /pedidos/:id — admin vê qualquer; customer vê apenas o próprio
  - PUT /pedidos/:id/status — apenas admin
  - Cálculo automático de valor_total no backend
  - Abrir PR para develop

---
**[FRONTEND] Vitrine pública — catálogo de produtos**
- Responsável: Dev 1
- Prazo: 23/03
- Branch: feature/vitrine-publica
- Tarefas:
  - Criar frontend/index.html — catálogo público com listagem de produtos (sem login necessário)
  - js/index.js — buscar produtos via GET /produtos e renderizar cards
  - Cada card exibe nome, preço, descrição, imagem e botão "Pedir"
  - Botão "Pedir": redireciona para login.html se não autenticado, ou para pedido.html se já logado
  - Link para login.html e cadastro.html no cabeçalho
  - Abrir PR para develop

---
**[FRONTEND] Cadastro de clientes**
- Responsável: Dev 1
- Prazo: 23/03
- Branch: feature/cadastro-cliente
- Tarefas:
  - Criar frontend/cadastro.html — formulário: nome, e-mail, senha, confirmar senha
  - js/cadastro.js — POST /cadastro para registrar, redirecionar para index.html após sucesso
  - Validações: senha mínima 6 caracteres, confirmação de senha, e-mail válido
  - Link para login.html ("já tem conta? faça login")
  - Abrir PR para develop

---
**[FRONTEND] Admin — dashboard**
- Responsável: Dev 1
- Prazo: 25/03
- Branch: `feature/admin-dashboard`
- Tarefas:
  - Criar `frontend/admin/dashboard.html` — página protegida: apenas admin acessa
  - Exibir resumo geral: total de pedidos, pedidos pendentes, confirmados e entregues
  - Exibir lista dos últimos 5 pedidos recebidos com status
  - `js/admin/dashboard.js` — buscar dados via `GET /pedidos` e `GET /produtos`, agregar no frontend
  - Link de navegação para `admin/produtos.html` e `admin/pedidos.html`
  - Redirecionar para `index.html` se role não for admin
  - Abrir PR para `develop`
- Observação: não requer endpoint novo — reutiliza GET /pedidos e GET /produtos já existentes

---
**[FRONTEND] Admin — painel de produtos**
- Responsável: Dev 1
- Prazo: 23/03
- Branch: `feature/admin-produtos`
- Tarefas:
  - Criar frontend/admin/produtos.html — painel protegido: apenas admin acessa
  - Verificar role após exigirAutenticacao() — redirecionar para index.html se não for admin
  - Grid de produtos com cards: editar e excluir
  - Formulário de cadastro/edição integrado na página
  - js/admin/produtos.js — integração com API (listar, criar, editar, excluir)
  - Abrir PR para develop

---
**[FRONTEND] Pedido do cliente**
- Responsável: Dev 1
- Prazo: 24/03
- Branch: feature/pedido-cliente
- Tarefas:
  - Criar frontend/pedido.html — página protegida (apenas clientes autenticados)
  - Listar produtos disponíveis com seletor de quantidade
  - Cálculo de total em tempo real
  - Campos: endereço de entrega e data de entrega desejada
  - js/pedido.js — POST /pedidos com token no header Authorization
  - Após envio: redirecionar para meus-pedidos.html
  - Abrir PR para develop

---
**[FRONTEND] Meus pedidos — acompanhamento do cliente**
- Responsável: Dev 1
- Prazo: 24/03
- Branch: feature/meus-pedidos
- Tarefas:
  - Criar frontend/meus-pedidos.html — página protegida (apenas clientes autenticados)
  - Listar pedidos do cliente logado via GET /pedidos (backend filtra por usuario_id)
  - Exibir: data do pedido, produtos, valor total e status atual (pendente / confirmado / entregue)
  - js/meus-pedidos.js — integração com API
  - Abrir PR para develop

---
**[FRONTEND] Admin — painel de pedidos**
- Responsável: Dev 1
- Prazo: 25/03
- Branch: feature/admin-pedidos
- Tarefas:
  - Criar frontend/admin/pedidos.html — painel protegido: apenas admin acessa
  - Listar todos os pedidos com filtro por status
  - Atualizar status de cada pedido (pendente → confirmado → entregue)
  - js/admin/pedidos.js — integração com API
  - Redirecionar para index.html se role não for admin
  - Abrir PR para develop

---
**[DEV3] Revisar artigo parcial no Overleaf**
- Responsável: Dev 3
- Prazo: 22/03
- Tarefas:
  - Adicionar seção de Metodologia (Kanban + GitHub Projects)
  - Adicionar seção de Tecnologias Utilizadas (incluir Supabase Auth e sistema de roles)
  - Atualizar escopo para refletir dois tipos de usuário (admin e cliente)
  - Revisar introdução e referencial teórico
  - Enviar versão atualizada ao orientador

---
**[EQUIPE] Preparar defesa parcial**
- Responsável: Equipe
- Prazo: 25/03
- Tarefas:
  - Montar slides (introdução, problema, solução, demo do MVP completo, próximos passos)
  - Demo: fluxo cliente (vitrine → cadastro → pedido → meus pedidos) + fluxo admin (login → produtos → pedidos)
  - Definir quem apresenta cada parte
  - Ensaio da apresentação

---

### FASE II — até Entrega Final (22/05)

---
**[BACKEND] Testes unitários**
- Responsável: Dev 2
- Prazo: 17/04
- Branch: test/unitarios
- Tarefas:
  - Instalar Jest (npm install --save-dev jest)
  - Testar função de cálculo de valor_total (lógica isolada do banco)
  - Testar função de validação de dados de entrada
  - Testar middlewares requireAdmin e requireCustomer com tokens mockados
  - Confirmar script "test": "jest --passWithNoTests" no package.json
  - Abrir PR para develop

---
**[BACKEND] Testes de integração**
- Responsável: Dev 2
- Prazo: 24/04
- Branch: test/integracao
- Tarefas:
  - Instalar Supertest (npm install --save-dev supertest)
  - Testar GET /produtos — público, sem token
  - Testar POST /produtos — 401 sem token, 403 com token de customer, 201 com token de admin
  - Testar POST /cadastro — criação de cliente
  - Testar POST /pedidos — customer autenticado cria pedido
  - Testar GET /pedidos — admin vê todos, customer vê só os próprios
  - Testar PUT /pedidos/:id/status — apenas admin
  - Abrir PR para develop
- Observação: tokens gerados via Supabase Auth SDK, não por mock manual

---
**[FRONTEND] Responsividade e validações**
- Responsável: Dev 1
- Prazo: 24/04
- Branch: feature/responsividade
- Tarefas:
  - Garantir layout funcional em mobile em todas as páginas (RNF01)
  - Validações em todos os formulários: login, cadastro, pedido, admin/produtos (RNF04)
  - Abrir PR para develop

---
**[DEV3] Segurança — proteção e validações**
- Responsável: Dev 3
- Prazo: 24/04
- Branch: feature/seguranca
- Tarefas:
  - Confirmar que requireAdmin está em todas as rotas de escrita e admin
  - Confirmar que requireCustomer está em POST /pedidos e filtragem por usuario_id em GET /pedidos
  - Confirmar que SUPABASE_SECRET_KEY e SUPABASE_URL estão isolados no .env (nunca no repo)
  - Validação e sanitização de entrada no backend (todos os campos)
  - Verificar que RLS está habilitado nas 3 tabelas (produtos, pedidos, itens_pedido)
  - Confirmar HTTPS ativo nas URLs de produção (Vercel + Render)
  - Abrir PR para develop

---
**[DEV3] Deploy da aplicação**
- Responsável: Dev 3
- Prazo: 02/05
- Branch: feature/deploy
- Tarefas:
  - Deploy do frontend no Vercel (conectar ao repo, deploy automático na main)
  - Deploy do backend no Render (Railway descartado — free tier instável)
  - Configurar variáveis de ambiente em produção nos painéis da Vercel e do Render
  - Configurar RENDER_DEPLOY_HOOK como secret no GitHub para o workflow de CD
  - Testar aplicação em produção end-to-end (fluxo cliente + fluxo admin)
  - Documentar URLs de produção no README

---
**[EQUIPE] Testes com a usuária real**
- Responsável: Equipe
- Prazo: 09/05
- Tarefas:
  - Agendar sessão de teste com a microempreendedora (agendar com antecedência — recurso externo)
  - Preparar roteiro de teste — dois fluxos:
    - Fluxo admin: login → cadastrar produto → ver pedidos → atualizar status
    - Fluxo cliente: cadastro → catálogo → fazer pedido → acompanhar status
  - Coletar feedback por escrito
  - Registrar evidências (prints, anotações) para o Relatório de Implementação

---
**[DEV1+2] Ajustes pós-teste**
- Responsável: Dev 1 + Dev 2
- Prazo: 15/05
- Tarefas:
  - Implementar correções apontadas pela usuária
  - Ajustes de interface e usabilidade
  - Abrir PR para develop → merge para main

---
**[DEV3] Relatório de Implementação na Comunidade**
- Responsável: Dev 3
- Prazo: 15/05
- Tarefas:
  - Redigir relatório descrevendo as atividades com a usuária
  - Incluir evidências, prints, feedback coletado
  - Descrever impactos observados

---
**[EQUIPE] Finalizar artigo científico**
- Responsável: Dev 3 + Equipe
- Prazo: 15/05
- Tarefas:
  - Seção de Resultados (com dados dos testes)
  - Seção de Conclusão
  - Revisão completa das referências (normas SBC)
  - Revisão final de formatação no Overleaf

---
**[EQUIPE] 🔴 Deadline interno — entrega final**
- Responsável: Equipe
- Prazo: 19/05
- Tarefas:
  - Confirmar que aplicação está funcionando em produção
  - Artigo final revisado e pronto
  - Relatório de implementação finalizado
  - Tudo pronto para submissão oficial em 22/05

---
**[EQUIPE] Preparar defesa final**
- Responsável: Equipe
- Prazo: 05/06
- Tarefas:
  - Montar slides finais (aplicação implementada, resultados, análise, demo)
  - Preparar demonstração ao vivo do sistema — fluxo completo cliente + admin
  - Ensaio completo da apresentação

---

## Como criar no GitHub Projects

1. Acesse o repositório → aba **Projects** → **New project**
2. Escolha o template **Board** (Kanban)
3. Renomeie as colunas padrão para:
   - 📋 Backlog
   - 🔄 Em Progresso
   - 👀 Em Revisão
   - ✅ Concluído
4. Mova os cards da seção ✅ Concluído acima para a coluna correspondente
5. Adicione os demais cards na coluna Backlog, na ordem indicada
6. Para cada card, defina:
   - Assignee (responsável)
   - Due date (prazo)
   - Label: infra / frontend / backend / docs / segurança
7. Quando começar uma tarefa, mova o card para Em Progresso
8. Ao abrir o PR, mova para Em Revisão
9. Após merge aprovado, mova para Concluído