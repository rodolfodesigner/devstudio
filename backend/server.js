// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rotas
const routesPath = path.join(__dirname, 'routes');
const fs = require('fs');
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const route = require(path.join(routesPath, file));
    if (typeof route === 'function') {
      app.use(`/api/${file.replace('.js', '')}`, route);
    }
  }
});

// Conexão com MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/devstudio';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Seed automático de usuário admin
const User = require('./models/User');
(async () => {
  const adminEmail = 'admin@devstudio.com';
  const adminSenha = 'admin123';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      nome: 'Administrador',
      email: adminEmail,
      senha: adminSenha,
      role: 'admin'
    });
    await admin.save();
    console.log('Usuário admin padrão criado:', adminEmail);
  } else {
    admin.nome = 'Administrador';
    admin.senha = adminSenha;
    admin.role = 'admin';
    await admin.save();
    console.log('Usuário admin padrão atualizado:', adminEmail);
  }
})();

// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(__dirname));

// Rota padrão: servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
}); 