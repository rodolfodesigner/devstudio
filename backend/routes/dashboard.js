const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Payment = require('../models/Payment');
const EmailCampaign = require('../models/EmailCampaign');
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

// Dashboard principal (responde em /)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Estatísticas de leads
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({
      criadoEm: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const convertedLeads = await Lead.countDocuments({ status: 'convertido' });

    // Estatísticas de pagamentos
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'pago' } },
      { $group: { _id: null, total: { $sum: '$valor' } } }
    ]);

    // Estatísticas de email
    const totalCampaigns = await EmailCampaign.countDocuments();
    const sentCampaigns = await EmailCampaign.countDocuments({ status: 'enviado' });

    // Leads por mês (últimos 6 meses)
    const monthlyLeads = await Lead.aggregate([
      {
        $match: {
          criadoEm: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$criadoEm' },
            month: { $month: '$criadoEm' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Pagamentos por mês (últimos 6 meses)
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          status: 'pago',
          criadoEm: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$criadoEm' },
            month: { $month: '$criadoEm' }
          },
          total: { $sum: '$valor' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      leads: {
        total: totalLeads,
        novos: newLeads,
        convertidos: convertedLeads,
        taxaConversao: totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(2) : 0
      },
      pagamentos: {
        total: totalPayments,
        receita: totalRevenue[0]?.total || 0
      },
      email: {
        campanhas: totalCampaigns,
        enviadas: sentCampaigns
      },
      charts: {
        monthlyLeads,
        monthlyPayments
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
  }
});

// Alias para compatibilidade com frontend antigo
router.get('/stats', authMiddleware, async (req, res) => {
  // Reutiliza a mesma lógica da rota principal
  try {
    // Estatísticas de leads
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({
      criadoEm: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const convertedLeads = await Lead.countDocuments({ status: 'convertido' });

    // Estatísticas de pagamentos
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'pago' } },
      { $group: { _id: null, total: { $sum: '$valor' } } }
    ]);

    // Estatísticas de email
    const totalCampaigns = await EmailCampaign.countDocuments();
    const sentCampaigns = await EmailCampaign.countDocuments({ status: 'enviado' });

    // Leads por mês (últimos 6 meses)
    const monthlyLeads = await Lead.aggregate([
      {
        $match: {
          criadoEm: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$criadoEm' },
            month: { $month: '$criadoEm' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Pagamentos por mês (últimos 6 meses)
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          status: 'pago',
          criadoEm: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$criadoEm' },
            month: { $month: '$criadoEm' }
          },
          total: { $sum: '$valor' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      leads: {
        total: totalLeads,
        novos: newLeads,
        convertidos: convertedLeads,
        taxaConversao: totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(2) : 0
      },
      pagamentos: {
        total: totalPayments,
        receita: totalRevenue[0]?.total || 0
      },
      email: {
        campanhas: totalCampaigns,
        enviadas: sentCampaigns
      },
      charts: {
        monthlyLeads,
        monthlyPayments
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
  }
});

// Leads recentes
router.get('/recent-leads', authMiddleware, async (req, res) => {
    try {
        const leads = await Lead.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email phone status createdAt');
        
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar leads recentes' });
    }
});

// Pagamentos recentes
router.get('/recent-payments', authMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('amount status description createdAt');
        
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pagamentos recentes' });
    }
});

// Campanhas recentes
router.get('/recent-campaigns', authMiddleware, async (req, res) => {
    try {
        const campaigns = await EmailCampaign.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name status sentCount createdAt');
        
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar campanhas recentes' });
    }
});

module.exports = router; 