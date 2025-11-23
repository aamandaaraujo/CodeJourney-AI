require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO IA ---
let model;
try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIza")) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        console.log("✅ IA Conectada!");
    }
} catch (e) { console.log("⚠️ Modo Offline Ativo"); }

const router = express.Router();

// --- BANCO DE DADOS DE PERGUNTAS (FUTURISTA) ---
const QUESTIONS = [
    {
        id: 1,
        question: "1. INICIALIZANDO SCAN: Qual seu nível de sincronização atual com código?",
        options: ["Nível 0: Acesso Negado (Nunca programei)", "Nível 1: Iniciado (Sei lógica básica)", "Nível 2: Operante (Já crio scripts)", "Nível 3: Hacker (Trabalho na área)"]
    },
    {
        id: 2,
        question: "2. SETOR DE OPERAÇÃO: Qual área do sistema você deseja dominar?",
        options: ["Interface Visual (Front-end)", "Núcleo do Sistema (Back-end)", "Inteligência Artificial & Dados", "Dispositivos Móveis (Mobile)"]
    },
    {
        id: 3,
        question: "3. DISPONIBILIDADE DE PROCESSAMENTO: Quanto tempo você pode dedicar?",
        options: ["Modo Econômico (30min/dia)", "Modo Padrão (1h-2h/dia)", "Overclocking (4h+/dia)"]
    },
    {
        id: 4,
        question: "4. PROTOCOLO DE APRENDIZADO: Como você processa melhor a informação?",
        options: ["Visual (Vídeos e Diagramas)", "Prático (Documentação e Código)", "Híbrido (Mentoria e Projetos)"]
    },
    {
        id: 5,
        question: "5. SISTEMA OPERACIONAL NATIVO: Qual seu ambiente principal?",
        options: ["Windows", "MacOS", "Linux / Distros", "Mobile / Tablet"]
    },
    {
        id: 6,
        question: "6. OBJETIVO DA MISSÃO: Onde você quer chegar em 6 meses?",
        options: ["Freelancer (Mercenário Digital)", "Big Tech (Corporação)", "Startup (Inovação)", "Projetos Pessoais (Hobby)"]
    },
    {
        id: 7,
        question: "7. IDIOMA DO SISTEMA: Qual seu nível de Inglês Técnico?",
        options: ["Básico (Preciso de tradutor)", "Intermediário (Leio documentação)", "Fluente (Sem barreiras)"]
    },
    {
        id: 8,
        question: "8. DEBUGGING: Como você lida com erros no código?",
        options: ["Entro em pânico", "Pesquiso no Google/StackOverflow", "Uso IA para corrigir", "Analiso os logs calmamente"]
    }
];

// --- ROTA CHAT ---
router.post('/chat/message', async (req, res) => {
    const { message } = req.body;
    try {
        if (model) {
            const result = await model.generateContent(`Responda como um mentor futurista (Cyberpunk). Curto e direto: ${message}`);
            const response = await result.response;
            return res.json({ response: response.text() });
        }
        throw new Error("Sem IA");
    } catch (error) {
        let resposta = "Acesso ao mainframe instável. Tente novamente.";
        if (message.toLowerCase().includes('olá')) resposta = "Link estabelecido. CodeJourney operante. Qual sua diretiva?";
        res.json({ response: resposta });
    }
});

// --- ROTAS DIAGNÓSTICO ---
router.get('/chat/diagnostic/start', (req, res) => {
    // Começa sempre na primeira pergunta (Índice 0 do array)
    res.json({
        step: 1,
        totalSteps: QUESTIONS.length,
        progress: 0,
        ...QUESTIONS[0]
    });
});

router.post('/chat/diagnostic/answer', (req, res) => {
    const { currentStep } = req.body;
    
    // Se ainda tem perguntas pela frente
    if (currentStep < QUESTIONS.length) {
        const nextIndex = currentStep; // O próximo passo é o índice atual (pois arrays começam em 0)
        
        res.json({
            complete: false,
            step: currentStep + 1,
            totalSteps: QUESTIONS.length,
            progress: Math.round((currentStep / QUESTIONS.length) * 100),
            ...QUESTIONS[nextIndex]
        });
    } else {
        // Acabou as 8 perguntas -> Gera o Resultado
        res.json({
            complete: true,
            recommendation: "OPERADOR FULLSTACK NÍVEL ALPHA",
            level: "Recruta em Ascensão",
            timeline: "Ciclo de 6 Meses",
            techStack: ["React.js Core", "Node.js Server", "Cyber-Security Basics", "AI Integration"],
            nextSteps: [
                "Configurar ambiente de desenvolvimento seguro",
                "Executar 'Hello World' em 3 linguagens",
                "Construir portfólio no GitHub",
                "Dominar a Matrix (Lógica de Programação)"
            ]
        });
    }
});

app.use('/api', router);
app.listen(port, () => console.log(`🚀 SERVIDOR CODEJOURNEY: ONLINE NA PORTA ${port}`));