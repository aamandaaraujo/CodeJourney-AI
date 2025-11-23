const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuração mais robusta do Gemini
let genAI;
let model;

try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'sua_chave_real_aqui') {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });
        console.log('✅ Gemini AI configurado com sucesso');
    } else {
        console.log('⚠️  Gemini API Key não configurada - usando modo simulação');
    }
} catch (error) {
    console.log('❌ Erro na configuração do Gemini:', error.message);
}

// Prompt do mentor especializado
const MENTOR_CONTEXT = `
Você é um mentor especializado do CodeJourney AI, um sistema de aprendizado de programação. 
Siga estas regras:

1. Seja direto e prático
2. Explique conceitos complexos de forma simples
3. Dê exemplos de código quando relevante
4. Incentive o aprendizado progressivo
5. Faça perguntas para entender o nível do aluno

Áreas de foco:
- Front-end (HTML, CSS, JavaScript)
- Back-end (Node.js, Python)
- React, Vue, Angular
- Banco de dados
- Boas práticas de programação

Mantenha as respostas entre 50-150 palavras.
`;

// Respostas simuladas para quando a API não está configurada
// No objeto SIMULATED_RESPONSES, adicione respostas mais úteis:
const SIMULATED_RESPONSES = {
    'javascript': `💡 **JavaScript - Roadmap de Aprendizado:**

**Fase 1: Fundamentos (2-3 semanas)**
• Variáveis, tipos de dados, operadores
• Funções, escopo, closures
• Estruturas de controle (if/else, loops)
• Arrays e métodos (map, filter, reduce)

**Fase 2: DOM e Eventos (2 semanas)**
• Seleção e manipulação de elementos
• Event listeners e handlers
• Formulários e validação

**Fase 3: Projetos Práticos (3-4 semanas)**
• Calculadora
• Todo List
• Weather App com API
• Jogo da Memória

**Recursos Recomendados:**
• MDN JavaScript Guide
• freeCodeCamp JavaScript Curriculum
• JavaScript30 (30 projetos em 30 dias)`,

    'react': `⚛️ **React - Plano de Estudos:**

**Pré-requisitos:**
✅ JavaScript ES6+
✅ HTML/CSS
✅ Conceitos de componentes

**Conteúdo Principal:**
1. **Componentes Funcionais** - O básico
2. **Hooks** - useState, useEffect, useContext
3. **JSX** - Sintaxe e expressões
4. **Props e State** - Gerenciamento de dados
5. **Event Handling** - Interatividade

**Projeto Progressivo:**
Week 1: Componente de perfil
Week 2: Lista de tarefas
Week 3: App de clima com API
Week 4: E-commerce simples

**Comando Inicial:**
\`\`\`bash
npx create-react-app meu-projeto
cd meu-projeto
npm start
\`\`\``,

    // ... outras respostas similares às do frontend
};

exports.generateResponse = async (userMessage) => {
    try {
        // Se a API do Gemini estiver configurada, use-a
        if (model) {
            const prompt = `${MENTOR_CONTEXT}\n\nAluno: ${userMessage}\nMentor:`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } else {
            // Modo simulação - respostas pré-definidas
            const message = userMessage.toLowerCase();
            
            if (message.includes('javascript')) return SIMULATED_RESPONSES.javascript;
            if (message.includes('react')) return SIMULATED_RESPONSES.react;
            if (message.includes('python')) return SIMULATED_RESPONSES.python;
            if (message.includes('html')) return SIMULATED_RESPONSES.html;
            if (message.includes('css')) return SIMULATED_RESPONSES.css;
            if (message.includes('node')) return SIMULATED_RESPONSES.node;
            if (message.includes('carreira') || message.includes('emprego')) return SIMULATED_RESPONSES.carreira;
            
            return SIMULATED_RESPONSES.default;
        }
    } catch (error) {
        console.error('Erro no Gemini:', error);
        
        // Fallback para respostas simuladas em caso de erro
        const message = userMessage.toLowerCase();
        if (message.includes('javascript')) return SIMULATED_RESPONSES.javascript;
        if (message.includes('react')) return SIMULATED_RESPONSES.react;
        
        return '🤖 **Mentor CodeJourney**: Estou com dificuldades técnicas no momento. Enquanto isso, que tal praticar JavaScript ou explorar React? São ótimas tecnologias para começar!';
    }
};