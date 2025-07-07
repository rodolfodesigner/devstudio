const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EmailCampaign = require('../models/EmailCampaign');
const Lead = require('../models/Lead');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');

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

// Buscar todas as campanhas
router.get('/campaigns', authMiddleware, async (req, res) => {
    try {
        const campaigns = await EmailCampaign.find().sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar campanhas' });
    }
});

// Buscar campanha por ID
router.get('/campaigns/:id', authMiddleware, async (req, res) => {
    try {
        const campaign = await EmailCampaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campanha não encontrada' });
        }
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar campanha' });
    }
});

// Criar nova campanha
router.post('/campaigns', authMiddleware, async (req, res) => {
    try {
        const { name, subject, content, targetAudience } = req.body;
        
        const campaign = new EmailCampaign({
            name,
            subject,
            content,
            targetAudience,
            createdBy: req.user.id
        });
        
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar campanha' });
    }
});

// Atualizar campanha
router.put('/campaigns/:id', authMiddleware, async (req, res) => {
    try {
        const campaign = await EmailCampaign.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!campaign) {
            return res.status(404).json({ error: 'Campanha não encontrada' });
        }
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar campanha' });
    }
});

// Deletar campanha
router.delete('/campaigns/:id', authMiddleware, async (req, res) => {
    try {
        const campaign = await EmailCampaign.findByIdAndDelete(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campanha não encontrada' });
        }
        res.json({ message: 'Campanha deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar campanha' });
    }
});

// Enviar campanha
router.post('/campaigns/:id/send', authMiddleware, async (req, res) => {
    try {
        const campaign = await EmailCampaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campanha não encontrada' });
        }

        // Buscar leads baseado no público-alvo
        let leads = [];
        if (campaign.targetAudience === 'all') {
            leads = await Lead.find({ email: { $exists: true, $ne: '' } });
        } else if (campaign.targetAudience === 'new') {
            leads = await Lead.find({ 
                email: { $exists: true, $ne: '' },
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });
        }

        // Enviar emails
        let sentCount = 0;
        for (const lead of leads) {
            try {
                await sendEmail({
                    to: lead.email,
                    subject: campaign.subject,
                    html: campaign.content.replace(/{{nome}}/g, lead.name || 'Cliente')
                });
                sentCount++;
            } catch (error) {
                console.error(`Erro ao enviar email para ${lead.email}:`, error);
            }
        }

        // Atualizar campanha
        campaign.status = 'sent';
        campaign.sentAt = new Date();
        campaign.sentCount = sentCount;
        await campaign.save();

        res.json({ 
            message: `Campanha enviada para ${sentCount} destinatários`,
            sentCount 
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar campanha' });
    }
});

// Estatísticas de email
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const totalCampaigns = await EmailCampaign.countDocuments();
        const sentCampaigns = await EmailCampaign.countDocuments({ status: 'sent' });
        const totalSent = await EmailCampaign.aggregate([
            { $match: { status: 'sent' } },
            { $group: { _id: null, total: { $sum: '$sentCount' } } }
        ]);

        res.json({
            totalCampaigns,
            sentCampaigns,
            totalSent: totalSent[0]?.total || 0,
            openRate: 0 // Implementar tracking de abertura
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

module.exports = router; 