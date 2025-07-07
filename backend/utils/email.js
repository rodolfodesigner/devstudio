const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Configurar transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true para 465, false para outras portas
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Templates de email
const emailTemplates = {
    welcome: {
        subject: 'Bem-vindo à DevStudio!',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">DevStudio</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Desenvolvimento de Sites e Aplicativos</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-bottom: 20px;">Olá ${data.name}!</h2>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                        Obrigado por entrar em contato conosco! Recebemos sua solicitação para um projeto de <strong>${data.projectType}</strong>.
                    </p>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                        Nossa equipe está analisando suas necessidades e entraremos em contato em até 24 horas para discutir os detalhes do seu projeto.
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">O que acontece agora?</h3>
                        <ul style="color: #666; line-height: 1.8;">
                            <li>Análise detalhada do seu projeto</li>
                            <li>Proposta personalizada</li>
                            <li>Reunião para alinhamento</li>
                            <li>Início do desenvolvimento</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Enquanto isso, que tal conhecer alguns dos nossos trabalhos? 
                        <a href="https://devstudio.com/#portfolio" style="color: #667eea;">Clique aqui para ver nosso portfólio</a>
                    </p>
                </div>
                
                <div style="background: #333; padding: 20px; text-align: center; color: white;">
                    <p style="margin: 0 0 10px 0;">Precisa de ajuda? Entre em contato:</p>
                    <p style="margin: 5px 0;">
                        📧 <a href="mailto:rodolfodesigner@outlook.com" style="color: #667eea;">rodolfodesigner@outlook.com</a>
                    </p>
                    <p style="margin: 5px 0;">
                        📱 <a href="https://wa.me/5511957719763" style="color: #667eea;">+55 11 957719763</a>
                    </p>
                </div>
            </div>
        `
    },
    
    newLead: {
        subject: 'Novo lead recebido - DevStudio',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #ff6b6b; padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">🎉 Novo Lead!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">DevStudio - Sistema de Leads</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-bottom: 20px;">Detalhes do Lead</h2>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Nome:</strong> ${data.lead.name}</p>
                        <p><strong>Email:</strong> ${data.lead.email}</p>
                        <p><strong>Telefone:</strong> ${data.lead.phone || 'Não informado'}</p>
                        <p><strong>Empresa:</strong> ${data.lead.company || 'Não informado'}</p>
                        <p><strong>Tipo de Projeto:</strong> ${data.lead.projectType}</p>
                        <p><strong>Fonte:</strong> ${data.lead.source}</p>
                        <p><strong>Data:</strong> ${new Date(data.lead.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    
                    <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #2196f3; margin-top: 0;">Descrição do Projeto</h3>
                        <p style="color: #666; line-height: 1.6;">${data.lead.projectDescription}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://admin.devstudio.com/leads/${data.lead._id}" 
                           style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Ver Lead no Sistema
                        </a>
                    </div>
                </div>
                
                <div style="background: #333; padding: 20px; text-align: center; color: white;">
                    <p style="margin: 0;">DevStudio - Transformando ideias em realidade digital</p>
                </div>
            </div>
        `
    },
    
    newsletter: {
        subject: 'Newsletter DevStudio - Dicas e Novidades',
        html: (data) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">DevStudio Newsletter</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Dicas exclusivas sobre desenvolvimento web</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-bottom: 20px;">Olá ${data.name}!</h2>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                        Obrigado por se inscrever em nossa newsletter! Você receberá dicas exclusivas sobre desenvolvimento web, 
                        marketing digital e as últimas tendências do mercado.
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">O que você vai receber?</h3>
                        <ul style="color: #666; line-height: 1.8;">
                            <li>Dicas de SEO e performance</li>
                            <li>Tendências de design web</li>
                            <li>Cases de sucesso</li>
                            <li>Ofertas exclusivas</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Fique ligado! Em breve você receberá nosso primeiro conteúdo.
                    </p>
                </div>
                
                <div style="background: #333; padding: 20px; text-align: center; color: white;">
                    <p style="margin: 0 0 10px 0;">Para cancelar a inscrição, <a href="#" style="color: #667eea;">clique aqui</a></p>
                </div>
            </div>
        `
    }
};

// Função principal para enviar email
async function sendEmail({ to, subject, template, data = {}, html, text }) {
    try {
        let emailContent = {
            from: `"DevStudio" <${process.env.EMAIL_USER}>`,
            to,
            subject: subject || emailTemplates[template]?.subject || 'DevStudio - Comunicação'
        };

        if (html) {
            emailContent.html = html;
        } else if (text) {
            emailContent.text = text;
        } else if (template && emailTemplates[template]) {
            emailContent.html = emailTemplates[template].html(data);
        } else {
            throw new Error('Template ou conteúdo não fornecido');
        }

        const info = await transporter.sendMail(emailContent);
        
        console.log('✅ Email enviado:', info.messageId);
        return info;
        
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        throw error;
    }
}

// Função para enviar email em massa
async function sendBulkEmail(recipients, template, data = {}) {
    const results = [];
    
    for (const recipient of recipients) {
        try {
            const result = await sendEmail({
                to: recipient.email,
                template,
                data: { ...data, name: recipient.name }
            });
            results.push({ email: recipient.email, status: 'success', messageId: result.messageId });
        } catch (error) {
            results.push({ email: recipient.email, status: 'error', error: error.message });
        }
        
        // Delay entre emails para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

// Função para verificar conexão
async function testConnection() {
    try {
        await transporter.verify();
        console.log('✅ Conexão de email verificada com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão de email:', error);
        return false;
    }
}

module.exports = {
    sendEmail,
    sendBulkEmail,
    testConnection,
    emailTemplates
}; 