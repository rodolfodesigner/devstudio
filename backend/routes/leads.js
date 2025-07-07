const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware de autenticação
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

// @route   POST /api/leads
// @desc    Criar novo lead
// @access  Public
router.post('/', [
    body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('projectType').isIn(['site-institucional', 'ecommerce', 'app-mobile', 'sistema-web', 'landing-page', 'outro']).withMessage('Tipo de projeto inválido'),
    body('projectDescription').trim().isLength({ min: 10 }).withMessage('Descrição deve ter pelo menos 10 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            email,
            phone,
            company,
            projectType,
            projectDescription,
            budget,
            timeline,
            source = 'site'
        } = req.body;

        // Verificar se lead já existe
        let existingLead = await Lead.findOne({ email });
        if (existingLead) {
            // Atualizar lead existente
            existingLead.name = name;
            existingLead.phone = phone || existingLead.phone;
            existingLead.company = company || existingLead.company;
            existingLead.projectType = projectType;
            existingLead.projectDescription = projectDescription;
            existingLead.budget = budget || existingLead.budget;
            existingLead.timeline = timeline || existingLead.timeline;
            existingLead.status = 'novo';
            
            await existingLead.save();
            
            // Enviar email de boas-vindas
            await sendEmail({
                to: email,
                subject: 'Obrigado pelo contato! - DevStudio',
                template: 'welcome',
                data: { name, projectType }
            });

            return res.json({ 
                message: 'Lead atualizado com sucesso',
                lead: existingLead 
            });
        }

        // Criar novo lead
        const lead = new Lead({
            name,
            email,
            phone,
            company,
            projectType,
            projectDescription,
            budget,
            timeline,
            source
        });

        await lead.save();

        // Enviar email de boas-vindas
        await sendEmail({
            to: email,
            subject: 'Obrigado pelo contato! - DevStudio',
            template: 'welcome',
            data: { name, projectType }
        });

        // Enviar notificação para admin
        await sendEmail({
            to: process.env.EMAIL_USER,
            subject: 'Novo lead recebido - DevStudio',
            template: 'new-lead',
            data: { lead }
        });

        res.status(201).json({ 
            message: 'Lead criado com sucesso',
            lead 
        });

    } catch (error) {
        console.error('Erro ao criar lead:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   GET /api/leads
// @desc    Obter todos os leads (com filtros)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            assignedTo,
            source,
            projectType,
            search
        } = req.query;

        const filter = {};

        // Aplicar filtros
        if (status) filter.status = status;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (source) filter.source = source;
        if (projectType) filter.projectType = projectType;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { projectDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: 'assignedTo'
        };

        const leads = await Lead.paginate(filter, options);

        res.json(leads);
    } catch (error) {
        console.error('Erro ao obter leads:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   GET /api/leads/:id
// @desc    Obter lead específico
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('assignedTo')
            .populate('interactions.user')
            .populate('notes.user');

        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        res.json({ lead });
    } catch (error) {
        console.error('Erro ao obter lead:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   PUT /api/leads/:id
// @desc    Atualizar lead
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const {
            status,
            priority,
            assignedTo,
            estimatedValue,
            probability,
            nextFollowUp,
            tags
        } = req.body;

        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        // Atualizar campos
        if (status) lead.status = status;
        if (priority) lead.priority = priority;
        if (assignedTo) lead.assignedTo = assignedTo;
        if (estimatedValue) lead.estimatedValue = estimatedValue;
        if (probability) lead.probability = probability;
        if (nextFollowUp) lead.nextFollowUp = nextFollowUp;
        if (tags) lead.tags = tags;

        await lead.save();

        res.json({ lead });
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   POST /api/leads/:id/interactions
// @desc    Adicionar interação ao lead
// @access  Private
router.post('/:id/interactions', authMiddleware, [
    body('type').isIn(['email', 'whatsapp', 'telefone', 'reuniao', 'proposta', 'outro']).withMessage('Tipo de interação inválido'),
    body('description').trim().notEmpty().withMessage('Descrição é obrigatória')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, description } = req.body;
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        await lead.addInteraction(type, description, req.user.userId);

        res.json({ message: 'Interação adicionada com sucesso', lead });
    } catch (error) {
        console.error('Erro ao adicionar interação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   POST /api/leads/:id/notes
// @desc    Adicionar nota ao lead
// @access  Private
router.post('/:id/notes', authMiddleware, [
    body('content').trim().notEmpty().withMessage('Conteúdo é obrigatório')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content } = req.body;
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        await lead.addNote(content, req.user.userId);

        res.json({ message: 'Nota adicionada com sucesso', lead });
    } catch (error) {
        console.error('Erro ao adicionar nota:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// @route   GET /api/leads/stats/overview
// @desc    Obter estatísticas dos leads
// @access  Private
router.get('/stats/overview', authMiddleware, async (req, res) => {
    try {
        const stats = await Lead.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    novos: { $sum: { $cond: [{ $eq: ['$status', 'novo'] }, 1, 0] } },
                    contatados: { $sum: { $cond: [{ $eq: ['$status', 'contatado'] }, 1, 0] } },
                    propostas: { $sum: { $cond: [{ $eq: ['$status', 'proposta-enviada'] }, 1, 0] } },
                    negociando: { $sum: { $cond: [{ $eq: ['$status', 'negociando'] }, 1, 0] } },
                    fechados: { $sum: { $cond: [{ $eq: ['$status', 'fechado'] }, 1, 0] } },
                    perdidos: { $sum: { $cond: [{ $eq: ['$status', 'perdido'] }, 1, 0] } },
                    valorTotal: { $sum: '$estimatedValue' }
                }
            }
        ]);

        const sourceStats = await Lead.aggregate([
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 }
                }
            }
        ]);

        const projectTypeStats = await Lead.aggregate([
            {
                $group: {
                    _id: '$projectType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            overview: stats[0] || {},
            sources: sourceStats,
            projectTypes: projectTypeStats
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar lead
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao deletar lead' });
    }
});

module.exports = router; 