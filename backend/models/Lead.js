const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String },
    status: { type: String, enum: ['novo', 'em_contato', 'convertido', 'perdido'], default: 'novo' },
    criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema); 