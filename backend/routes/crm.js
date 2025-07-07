const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Buscar todos os leads
router.get('/leads', auth, async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar leads' });
    }
});

// Buscar lead por ID
router.get('/leads/:id', auth, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar lead' });
    }
});

// Atualizar lead
router.put('/leads/:id', auth, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar lead' });
    }
});

// Deletar lead
router.delete('/leads/:id', auth, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }
        res.json({ message: 'Lead deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar lead' });
    }
});

// Estatísticas do CRM
router.get('/stats', auth, async (req, res) => {
    try {
        const totalLeads = await Lead.countDocuments();
        const newLeads = await Lead.countDocuments({ 
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        const convertedLeads = await Lead.countDocuments({ status: 'converted' });
        
        res.json({
            totalLeads,
            newLeads,
            convertedLeads,
            conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

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

// Alias para compatibilidade com frontend
router.get('/leads', authMiddleware, async (req, res) => {
  try {
    const leads = await Lead.find();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar leads' });
  }
});

router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'CRM endpoint funcionando!' });
});

module.exports = router; 