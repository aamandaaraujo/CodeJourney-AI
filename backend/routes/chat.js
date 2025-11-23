const express = require('express');
const router = express.Router();

// Rota de teste do chat
router.get('/test', (req, res) => {
    res.json({
        status: 'Chat API está funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota de mensagens - SIMULADA
router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ 
                error: 'Mensagem é obrigatória' 
            });
        }

        // Simular uma resposta após um delay
        setTimeout(() => {
            res.json({
                success: true,
                response: `🤖 Mentor: Você disse: "${message}". Isso é ótimo! Vamos aprender juntos.`,
                timestamp: new Date().toISOString()
            });
        }, 1000);

    } catch (error) {
        console.error('Erro no chat:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor' 
        });
    }
});

// ... (as outras rotas do diagnóstico podem ser mantidas)

module.exports = router;