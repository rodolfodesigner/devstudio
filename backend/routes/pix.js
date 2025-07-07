const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const router = express.Router();

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
}

// @route   POST /api/pix/create
// @desc    Criar pagamento PIX
// @access  Public
router.post('/create', [
    body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
    body('description').trim().isLength({ min: 3 }).withMessage('Descrição deve ter pelo menos 3 caracteres'),
    body('customer.name').trim().isLength({ min: 2 }).withMessage('Nome do cliente é obrigatório'),
    body('customer.email').isEmail().normalizeEmail().withMessage('Email inválido')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { amount, description, customer, metadata = {} } = req.body;

        // Gerar ID único para o pedido
        const orderId = `PIX-${Date.now()}-${uuidv4().substring(0, 8)}`;

        // Criar pagamento
        const payment = new Payment({
            orderId,
            amount: parseFloat(amount),
            description,
            customer,
            metadata
        });

        await payment.save();

        // Gerar QR Code PIX
        await payment.generatePixQRCode();

        // Gerar imagem do QR Code
        const qrCodeImage = await QRCode.toDataURL(payment.pixData.qrCode, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        payment.pixData.qrCodeImage = qrCodeImage;
        await payment.save();

        res.json({
            success: true,
            payment: {
                orderId: payment.orderId,
                amount: payment.amount,
                description: payment.description,
                status: payment.status,
                qrCode: payment.pixData.qrCode,
                qrCodeImage: payment.pixData.qrCodeImage,
                copyPaste: payment.pixData.copyPaste,
                expiresAt: payment.pixData.expiresAt
            }
        });

    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   GET /api/pix/:orderId
// @desc    Obter status do pagamento
// @access  Public
router.get('/:orderId', async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId });
        
        if (!payment) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        res.json({
            success: true,
            payment: {
                orderId: payment.orderId,
                amount: payment.amount,
                description: payment.description,
                status: payment.status,
                paidAt: payment.paidAt,
                expiresAt: payment.pixData.expiresAt,
                isExpired: payment.isExpired()
            }
        });

    } catch (error) {
        console.error('Erro ao obter pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   POST /api/pix/:orderId/confirm
// @desc    Confirmar pagamento (webhook)
// @access  Private
router.post('/:orderId/confirm', authMiddleware, async (req, res) => {
    try {
        const { transactionId } = req.body;
        
        const payment = await Payment.findOne({ orderId: req.params.orderId });
        
        if (!payment) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        if (payment.status === 'paid') {
            return res.json({ message: 'Pagamento já foi confirmado' });
        }

        // Marcar como pago
        await payment.markAsPaid(transactionId);

        // Enviar notificação por email
        const sendEmail = require('../utils/email');
        await sendEmail({
            to: payment.customer.email,
            subject: 'Pagamento Confirmado - DevStudio',
            template: 'payment-confirmed',
            data: { payment }
        });

        res.json({ 
            success: true, 
            message: 'Pagamento confirmado com sucesso',
            payment: {
                orderId: payment.orderId,
                status: payment.status,
                paidAt: payment.paidAt
            }
        });

    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   GET /api/pix
// @desc    Listar pagamentos (admin)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const pagamentos = await Payment.find().populate('lead');
        res.json(pagamentos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar pagamentos' });
    }
});

// @route   POST /api/pix/:orderId/refund
// @desc    Reembolsar pagamento
// @access  Private
router.post('/:orderId/refund', authMiddleware, [
    body('reason').trim().isLength({ min: 3 }).withMessage('Motivo do reembolso é obrigatório')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { reason } = req.body;
        const payment = await Payment.findOne({ orderId: req.params.orderId });

        if (!payment) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        if (payment.status !== 'paid') {
            return res.status(400).json({ error: 'Apenas pagamentos confirmados podem ser reembolsados' });
        }

        await payment.refund(reason);

        // Enviar notificação por email
        const sendEmail = require('../utils/email');
        await sendEmail({
            to: payment.customer.email,
            subject: 'Reembolso Processado - DevStudio',
            template: 'payment-refunded',
            data: { payment, reason }
        });

        res.json({ 
            success: true, 
            message: 'Reembolso processado com sucesso',
            payment: {
                orderId: payment.orderId,
                status: payment.status,
                refundedAt: payment.refundedAt,
                refundReason: payment.refundReason
            }
        });

    } catch (error) {
        console.error('Erro ao processar reembolso:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   GET /api/pix/stats/overview
// @desc    Obter estatísticas dos pagamentos
// @access  Private
router.get('/stats/overview', authMiddleware, async (req, res) => {
    try {
        const stats = await Payment.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
                    expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
                    refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } },
                    paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } }
                }
            }
        ]);

        const dailyStats = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            overview: stats[0] || {},
            dailyStats
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   POST /api/pix/webhook
// @desc    Webhook para confirmação de pagamento (simulado)
// @access  Public
router.post('/webhook', async (req, res) => {
    try {
        const { orderId, transactionId, status } = req.body;

        if (!orderId || !transactionId) {
            return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
        }

        const payment = await Payment.findOne({ orderId });
        
        if (!payment) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        if (status === 'paid' && payment.status === 'pending') {
            await payment.markAsPaid(transactionId);
            
            // Enviar notificação por email
            const sendEmail = require('../utils/email');
            await sendEmail({
                to: payment.customer.email,
                subject: 'Pagamento Confirmado - DevStudio',
                template: 'payment-confirmed',
                data: { payment }
            });
        }

        res.json({ success: true, message: 'Webhook processado com sucesso' });

    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar pagamento
router.post('/', authMiddleware, async (req, res) => {
    try {
        const novoPagamento = new Payment(req.body);
        await novoPagamento.save();
        res.status(201).json(novoPagamento);
    } catch (err) {
        res.status(400).json({ error: 'Erro ao criar pagamento' });
    }
});

// Atualizar status do pagamento
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const pagamento = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(pagamento);
    } catch (err) {
        res.status(400).json({ error: 'Erro ao atualizar pagamento' });
    }
});

module.exports = router; 