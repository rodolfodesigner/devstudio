const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Obter token do header
    const token = req.header('x-auth-token');

    // Verificar se não há token
    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
}; 