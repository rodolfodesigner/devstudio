const mongoose = require('mongoose');

const EmailCampaignSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    mensagem: { type: String, required: true },
    destinatarios: [{ type: String, required: true }],
    status: { type: String, enum: ['rascunho', 'enviando', 'enviado'], default: 'rascunho' },
    criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema); 