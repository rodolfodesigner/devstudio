const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    valor: { type: Number, required: true },
    status: { type: String, enum: ['pendente', 'pago', 'cancelado'], default: 'pendente' },
    pixCopiaCola: { type: String },
    criadoEm: { type: Date, default: Date.now }
});

// Índices
PaymentSchema.index({ lead: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ criadoEm: -1 });

module.exports = mongoose.model('Payment', PaymentSchema); 