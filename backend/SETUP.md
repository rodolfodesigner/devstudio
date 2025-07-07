# 🚀 DevStudio - Sistema Completo

## 📋 Visão Geral

Este é um sistema completo que inclui:
- **Site principal** (HTML/CSS/JS)
- **Backend API** (Node.js/Express/MongoDB)
- **Dashboard Admin** (React)
- **CRM próprio**
- **Sistema de Email Marketing**
- **Pagamentos PIX**

## 🛠️ Pré-requisitos

- Node.js 16+ 
- MongoDB 5+
- Git

## 📁 Estrutura do Projeto

```
devstudio/
├── index.html              # Site principal
├── styles.css              # Estilos do site
├── script.js               # JavaScript do site
├── package.json            # Backend dependencies
├── server.js               # Servidor principal
├── models/                 # Modelos do banco
├── routes/                 # Rotas da API
├── middleware/             # Middlewares
├── utils/                  # Utilitários
├── admin/                  # Dashboard React
│   ├── package.json
│   └── src/
├── env.example             # Variáveis de ambiente
├── robots.txt              # SEO
├── sitemap.xml             # SEO
├── manifest.json           # PWA
└── README.md               # Documentação
```

## ⚙️ Configuração

### 1. **Configurar Variáveis de Ambiente**

Copie o arquivo `env.example` para `.env` e configure:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/devstudio

# JWT
JWT_SECRET=sua-chave-super-secreta-aqui

# Email (Outlook)
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=rodolfodesigner@outlook.com
EMAIL_PASS=sua-senha-do-outlook

# PIX
PIX_KEY=rodolfodesigner@outlook.com
PIX_KEY_TYPE=email
MERCHANT_NAME=DevStudio
MERCHANT_CITY=SAO PAULO
```

### 2. **Instalar Dependências do Backend**

```bash
npm install
```

### 3. **Instalar Dependências do Dashboard Admin**

```bash
cd admin
npm install
```

## 🚀 Executando o Sistema

### 1. **Iniciar MongoDB**

```bash
# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"

# macOS/Linux
mongod
```

### 2. **Iniciar Backend**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 3. **Iniciar Dashboard Admin**

```bash
cd admin
npm start
```

### 4. **Acessar o Sistema**

- **Site Principal**: http://localhost:3000
- **Dashboard Admin**: http://localhost:3001
- **API**: http://localhost:3000/api

## 📊 Funcionalidades

### **Site Principal**
- ✅ Design responsivo mobile-first
- ✅ Dark mode toggle
- ✅ Formulário de contato
- ✅ Calculadora de orçamento
- ✅ Chatbot WhatsApp
- ✅ Newsletter modal
- ✅ SEO completo
- ✅ PWA ready

### **Backend API**
- ✅ Autenticação JWT
- ✅ CRUD de leads
- ✅ Sistema de email
- ✅ Pagamentos PIX
- ✅ Estatísticas
- ✅ Validações
- ✅ Rate limiting

### **Dashboard Admin**
- ✅ Login seguro
- ✅ Gestão de leads
- ✅ Pipeline de vendas
- ✅ Relatórios
- ✅ Campanhas de email
- ✅ Pagamentos PIX
- ✅ Configurações

## 🔧 Configurações Específicas

### **Email Marketing**

O sistema usa seu email Outlook (`rodolfodesigner@outlook.com`) para:
- Envio de emails automáticos
- Notificações de leads
- Campanhas de marketing
- Confirmações de pagamento

### **PIX Payments**

Configure sua chave PIX no `.env`:
```env
PIX_KEY=rodolfodesigner@outlook.com
PIX_KEY_TYPE=email
```

### **WhatsApp Integration**

O chatbot está configurado para:
- Número: +55 11 957719763
- Respostas automáticas
- Integração direta

## 📱 Como Usar

### **1. Receber Leads**
- Os leads do site são salvos automaticamente
- Email de boas-vindas é enviado
- Notificação para admin

### **2. Gerenciar no Dashboard**
- Acesse http://localhost:3001
- Faça login com credenciais admin
- Visualize e gerencie leads
- Adicione interações e notas

### **3. Enviar Campanhas**
- Crie campanhas de email
- Use templates prontos
- Envie para listas segmentadas
- Acompanhe resultados

### **4. Receber Pagamentos**
- Gere QR Code PIX
- Envie para clientes
- Confirmação automática
- Comprovantes por email

## 🔒 Segurança

- **JWT Authentication** para API
- **Rate Limiting** para proteção
- **Input Validation** em todas as rotas
- **CORS** configurado
- **Helmet** para headers de segurança

## 📈 Analytics

O sistema inclui:
- **Google Analytics** integrado
- **Event tracking** personalizado
- **Relatórios** de conversão
- **Estatísticas** de leads e vendas

## 🚀 Deploy

### **Backend (Heroku/Vercel)**
```bash
# Configurar variáveis de ambiente
# Conectar MongoDB Atlas
# Deploy via Git
```

### **Frontend (Netlify/Vercel)**
```bash
cd admin
npm run build
# Upload da pasta build
```

### **Site Principal**
```bash
# Upload dos arquivos estáticos
# Configurar domínio
# SSL automático
```

## 🆘 Suporte

Para dúvidas ou problemas:
- **Email**: rodolfodesigner@outlook.com
- **WhatsApp**: +55 11 957719763

## 📝 Próximos Passos

1. **Configure** as variáveis de ambiente
2. **Instale** as dependências
3. **Execute** o sistema
4. **Teste** todas as funcionalidades
5. **Personalize** conforme necessário
6. **Deploy** em produção

---

**🎉 Sistema pronto para uso!** 