# Salão Reflexus — Sistema de Gestão e Agendamento

PWA completo para gestão de salão de beleza com dois portais: **Administrativo** (dashboard, agenda, clientes, financeiro) e **Cliente** (autoatendimento, agendamento, chat).

---

## Arquitetura

```
Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 3
Persistência: JSON (local) ou Vercel KV (produção)
```

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router, React Server Components) |
| UI | React 19, Tailwind CSS 3, Lucide Icons |
| Gráficos | Recharts |
| Autenticação | JWT (jsonwebtoken) + bcryptjs |
| Data | JSON filesystem ou Vercel KV (Redis) |
| Build | Standalone output (`output: 'standalone'`) |
| PWA | Service Worker + Manifest + Install Prompt |

---

## Funcionalidades

### 🔐 Autenticação
- **Admin**: login por email + senha (`/login`), sessão JWT em localStorage
- **Cliente**: login por username + senha (`/cliente`), sessão JWT separada
- Senha temporária para clientes, obrigatório trocar no primeiro acesso

### 📊 Dashboard (`/dashboard`)
- Cards de KPIs: agendamentos hoje/mês, receita hoje/mês, novos clientes
- Gráfico de receita semanal (barras)
- Gráfico de serviços mais realizados (pizza)
- Lista de agendamentos de hoje e próximos
- Atalhos rápidos para ações frequentes

### 📅 Agenda (`/agenda`)
- Visualizações: Dia, Semana, Mês
- Slots de 30 min das 08:00 às 20:00
- Criação rápida de agendamento
- Modal de detalhes: dados do cliente, serviços, status, ações
- Ações: Confirmar, Recusar, Concluir, Cancelar
- Botão "Lembrar" que envia WhatsApp para clientes do dia
- Botão "Chat" que abre conversa com o cliente
- Botão "WhatsApp" que abre wa.me com mensagem preenchida

### ✏️ Novo Agendamento (`/agendamento`)
- 4 etapas: Cliente → Serviços → Data/Hora → Confirmar
- Busca e cadastro rápido de clientes
- Múltiplos serviços por agendamento
- Filtro automático de horários disponíveis (remove conflitos)
- Cálculo automático de duração total e valor

### 👥 Clientes (`/clientes`)
- Lista com busca por nome ou telefone
- Cadastro com geração automática de username e senha
- Exibição de credenciais na criação (para compartilhar via WhatsApp)
- Página de detalhes: perfil, histórico de agendamentos, gastos
- Reset de senha

### 💇 Serviços (`/servicos`)
- Catálogo agrupado por categoria
- Busca e filtro por categoria
- Cadastro: nome, duração, preço, comissão, categoria

### 📈 Financeiro (`/financeiro`)
- Cards: Receita, Despesa, Lucro
- Gráfico semanal de receita
- Lista de transações com filtro por período e tipo
- Registro de entradas e saídas

### ⚙️ Configurações (`/configuracoes`)
- Dados do salão (nome, endereço, telefone)
- Modo escuro
- Troca de senha do admin

### 💬 Chat (`/cliente/chat`)
- Comunicação direta entre cliente e salão
- Admin acessa pelo botão flutuante no canto inferior direito
- Notificação de mensagens não lidas (badge)
- Busca de clientes para iniciar conversa
- Armazenamento interno (sem dependência externa)

---

## Portais

### Admin
| Rota | Página |
|------|--------|
| `/login` | Login do admin |
| `/dashboard` | Dashboard com KPIs e gráficos |
| `/agenda` | Calendário de agendamentos |
| `/agendamento` | Criar novo agendamento |
| `/clientes` | Lista de clientes |
| `/clientes/[id]` | Detalhes do cliente |
| `/servicos` | Catálogo de serviços |
| `/financeiro` | Controle financeiro |
| `/configuracoes` | Configurações do salão |

### Cliente
| Rota | Página |
|------|--------|
| `/cliente` | Login do cliente |
| `/cliente/agendar` | Autoatendimento (agendar) |
| `/cliente/meus-agendamentos` | Meus agendamentos |
| `/cliente/chat` | Chat com o salão |
| `/cliente/perfil` | Editar perfil e trocar senha |

---

## API (Endpoints)

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login admin (email + senha) |
| POST | `/api/auth/client-login` | Login cliente (username + senha) |
| POST | `/api/auth/change-password` | Trocar senha do admin |
| POST | `/api/client/change-password` | Trocar senha do cliente |

### Clientes
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clients` | Listar clientes (`?search=`) |
| POST | `/api/clients` | Criar cliente |
| GET | `/api/clients/[id]` | Detalhes do cliente |
| PUT | `/api/clients/[id]` | Atualizar cliente |
| DELETE | `/api/clients/[id]` | Excluir cliente |

### Serviços
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/services` | Listar serviços (`?search=&category=`) |
| POST | `/api/services` | Criar serviço |
| GET | `/api/services/[id]` | Detalhes do serviço |
| PUT | `/api/services/[id]` | Atualizar serviço |
| DELETE | `/api/services/[id]` | Excluir serviço |

### Agendamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/appointments` | Listar (`?date=&status=&clientId=`) |
| POST | `/api/appointments` | Criar (com detecção de conflito) |
| GET | `/api/appointments/[id]` | Detalhes |
| PUT | `/api/appointments/[id]` | Atualizar |
| DELETE | `/api/appointments/[id]` | Cancelar |
| POST | `/api/appointments/[id]/action` | Ações: confirm/reject/complete/cancel |

### Chat
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/chat` | Mensagens (`?clientId=`) |
| POST | `/api/chat` | Enviar mensagem |
| GET | `/api/chat/unread` | Conversas com não lidas |
| PUT | `/api/chat/[id]/read` | Marcar como lida |

### Outros
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/api/config/salon` | Configurações do salão |
| GET | `/api/dashboard` | Dados agregados do dashboard |
| GET/POST | `/api/transactions` | Transações financeiras |
| GET/POST | `/api/init` | Popular banco com dados iniciais |
| GET/POST | `/api/professionals` | Profissionais |

---

## Modelos de Dados

```
User      → id, name, email, password, role (ADMIN|RECEPTIONIST), active
Client    → id, name, phone, username, password, mustChangePassword, active
Service   → id, name, duration(min), price, commission, category, active
Professional → id, name, phone, commission, active
Appointment → id, client, professional, date, startTime, endTime,
              status (PENDING|SCHEDULED|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED),
              totalPrice, totalDuration, services[], notes, paid
Transaction → id, type (INCOME|EXPENSE), description, amount, date, category
Message   → id, clientId, from (client|admin), text, read, createdAt
```

Armazenados como arquivos JSON em `data/`:
`users.json`, `clients.json`, `services.json`, `professionals.json`, `appointments.json`, `transactions.json`, `messages.json`

---

## Instalação e Uso

```bash
# Instalar dependências
cd salao-reflexus
npm install

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

Acessar: **http://localhost:3000**

### Primeiro Acesso (Admin)
1. Acesse `/login`
2. O banco de dados é populado automaticamente com dados iniciais
3. Login padrão:
   - **Email:** `admin@reflexus.com`
   - **Senha:** `admin123`

### Fluxo de Cliente
1. Admin cria cliente em `/clientes` (gera username + senha automáticos)
2. Admin compartilha as credenciais com o cliente
3. Cliente acessa `/cliente` e faz login
4. No primeiro acesso, cliente **deve trocar a senha**
5. Cliente pode agendar, ver histórico, e conversar com o salão

---

## Deploy

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel --prod
```

### Variáveis de Ambiente
| Variável | Descrição |
|----------|-----------|
| `JWT_SECRET` | Chave secreta para tokens JWT |
| `KV_URL` | URL do Vercel KV (opcional, fallback para JSON) |
| `KV_REST_API_URL` | URL da REST API do KV |
| `KV_REST_API_TOKEN` | Token da REST API do KV |

Sem KV configurado, o sistema usa arquivos JSON em `data/`.

---

## PWA

O aplicativo é instalável no celular:
- **Android**: Banner "Adicionar à tela inicial" aparece automaticamente
- **iOS**: Instruções no banner "Compartilhar > Adicionar à Tela de Início"
- Service Worker com cache-first para páginas e network-first para API
- Suporte a notificações push

---

## Estrutura do Projeto

```
salao-reflexus/
├── data/                          # Banco de dados JSON
├── public/                        # Assets estáticos + PWA
│   ├── manifest.json
│   ├── sw.js
│   └── icon-*.png
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # REST API
│   │   ├── cliente/               # Portal do cliente
│   │   ├── agenda/                # Páginas admin
│   │   ├── dashboard/
│   │   ├── agendamento/
│   │   ├── clientes/
│   │   ├── servicos/
│   │   ├── financeiro/
│   │   └── configuracoes/
│   ├── components/
│   │   ├── ui/                    # Button, Input, Card, Modal, Badge, Select
│   │   ├── layout/                # Sidebar, DashboardLayout, ClientLayout
│   │   └── chat/                  # ChatPanel
│   ├── context/                   # AuthContext, ThemeContext
│   ├── lib/                       # datastore.ts, storage.ts, kv-store.ts
│   └── utils/                     # format.ts
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Licença

Projeto privado — Salão Reflexus
