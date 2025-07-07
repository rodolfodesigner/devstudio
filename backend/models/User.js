const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    criadoEm: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) return next();
    this.senha = await bcrypt.hash(this.senha, 10);
    next();
});

UserSchema.methods.compararSenha = function(senha) {
    return bcrypt.compare(senha, this.senha);
};

// Compatibilidade com código que espera comparePassword
UserSchema.methods.comparePassword = function(senha) {
    return bcrypt.compare(senha, this.senha);
};

UserSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    nome: this.nome,
    email: this.email,
    role: this.role,
    criadoEm: this.criadoEm
  };
};

module.exports = mongoose.model('User', UserSchema);

// Adiciona este bloco ao final do arquivo para criar o admin padrão se não existir
if (process.env.NODE_ENV !== 'test') {
  const email = 'admin@devstudio.com';
  const password = 'admin123';
  const name = 'Admin';
  const role = 'admin';
  const User = module.exports;
  User.findOne({ email }).then(user => {
    if (!user) {
      User.create({ name, email, password, role })
        .then(() => console.log('Usuário admin padrão criado!'))
        .catch(err => console.error('Erro ao criar admin padrão:', err));
    }
  });
} 