// Configurações
const API_BASE = 'http://localhost:3000/api';

// Estado da aplicação
let lastDiagnosticResult = null;
let appState = {
    currentDiagnosticStep: 0,
    diagnosticAnswers: [],
    chatHistory: [],
    isChatOpen: false
};

// ===== FUNÇÕES PRINCIPAIS =====

async function startJourney() {
    showNotification('🚀 Inicializando sistema CodeJourney AI...');
    
    try {
        const response = await fetch(`${API_BASE}/chat/diagnostic/start`);
        const data = await response.json();
        
        appState.currentDiagnosticStep = data.step;
        showDiagnosticModal(data);
        
    } catch (error) {
        console.error('Erro ao iniciar:', error);
        showNotification('❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.', 'error');
    }
}

function openChat() {
    appState.isChatOpen = true;
    showChatModal();
    
    // Mensagem inicial do mentor
    addChatMessage('mentor', 'Olá! Sou seu mentor de IA. Como posso ajudar sua jornada na programação hoje?');
}

async function startDiagnostic() {
    showNotification('🎯 Iniciando diagnóstico de habilidades...');
    await startJourney();
}

function viewDemo() {
    showNotification('📺 Abrindo demonstração completa...');
    
    // Simula uma demo interativa
    setTimeout(() => {
        addChatMessage('mentor', '👋 Esta é uma demonstração do sistema! No modo real, eu analisaria seu código e daria feedbacks personalizados.');
        addChatMessage('user', 'Como aprender JavaScript mais rápido?');
        setTimeout(() => {
            addChatMessage('mentor', '💡 Foque em: 1) Fundamentos sólidos 2) Projetos práticos 3) Revisão constante. Que tal começarmos com um plano personalizado?');
        }, 1500);
    }, 1000);
}

// ===== MODAL DE DIAGNÓSTICO =====

function showDiagnosticModal(data) {
    const modal = createModal('diagnostic');
    
    // Gerar opções dinamicamente
    let optionsHTML = '';
    if (data.options && data.options.length > 0) {
        optionsHTML = `
            <div class="answer-options">
                ${data.options.map(option => `
                    <button class="option-btn" onclick="submitDiagnosticAnswer('${option}')">
                        ${option}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="cyber-modal-content">
            <div class="modal-header">
                <h3>🎯 DIAGNÓSTICO INTELIGENTE</h3>
                <span class="close-modal" onclick="closeModal('diagnostic')">×</span>
            </div>
            
            <div class="modal-body">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${data.progress}%"></div>
                </div>
                <p class="progress-text">Progresso: ${data.progress}% (${data.step}/${data.totalSteps})</p>
                
                <div class="question-container">
                    <p class="question">${data.question}</p>
                    ${optionsHTML}
                    
                    <div class="custom-answer">
                        <input type="text" id="customAnswer" placeholder="Ou digite sua resposta personalizada...">
                        <button class="btn-neon-primary" onclick="submitCustomAnswer()">Enviar Resposta</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function submitDiagnosticAnswer(answer) {
    try {
        const response = await fetch(`${API_BASE}/chat/diagnostic/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentStep: appState.currentDiagnosticStep,
                answer: answer
            })
        });

        const data = await response.json();
        
        if (data.complete) {
            closeModal('diagnostic');
            showDiagnosticResults(data);
        } else {
            appState.currentDiagnosticStep = data.step;
            showDiagnosticModal(data);
        }
        
    } catch (error) {
        console.error('Erro no diagnóstico:', error);
        showNotification('❌ Erro ao processar resposta.', 'error');
    }
}

function submitCustomAnswer() {
    const customInput = document.getElementById('customAnswer');
    if (customInput.value.trim()) {
        submitDiagnosticAnswer(customInput.value.trim());
    }
}

function showDiagnosticResults(data) {
    lastDiagnosticResult = data; // SALVA O RESULTADO PARA O DOWNLOAD

    const modal = createModal('results');
    modal.innerHTML = `
        <div class="cyber-modal-content">
            <div class="modal-header">
                <h3>🎉 DIAGNÓSTICO CONCLUÍDO!</h3>
                <span class="close-modal" onclick="closeModal('results')">×</span>
            </div>
            
            <div class="modal-body">
                <div class="result-icon">🚀</div>
                
                <div class="result-card">
                    <h4>SEU PLANO DE MISSÃO</h4>
                    <p><strong>Protocolo Recomendado:</strong> ${data.recommendation}</p>
                    <p><strong>Patente Atual:</strong> ${data.level}</p>
                    <p><strong>Tempo de Execução:</strong> ${data.timeline}</p>
                </div>
                
                <div class="tech-stack">
                    <h4>🛠️ ARSENAL TECNOLÓGICO</h4>
                    <div class="tech-tags">
                        ${data.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                
                <div class="next-steps">
                    <h4>📋 DIRETRIZES IMEDIATAS</h4>
                    <ol>
                        ${data.nextSteps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="result-actions">
                    <button class="btn-neon-primary" onclick="closeModal('results'); openChat();">
                        💬 Iniciar Treinamento (Chat)
                    </button>
                    <button class="btn-hologram" onclick="downloadStudyPlan()">
                        📥 Extrair Dados (.TXT)
                    </button>
                </div>
            </div>
        </div>
    `;
}

function downloadStudyPlan() {
    if (!lastDiagnosticResult) {
        showNotification('❌ Nenhum plano encontrado para baixar.', 'error');
        return;
    }

    showNotification('📥 Compilando dados para extração...');

    // 1. Criar o conteúdo do texto
    const data = lastDiagnosticResult;
    const conteudoTexto = `
=========================================
      CODEJOURNEY AI - PLANO DE VOO
=========================================
DATA: ${new Date().toLocaleString()}

🚀 PERFIL DO AGENTE
-----------------------------------------
TRILHA:   ${data.recommendation}
NÍVEL:    ${data.level}
TIMELINE: ${data.timeline}

🛠️ STACK TECNOLÓGICA (FERRAMENTAS)
-----------------------------------------
${data.techStack.map(tech => `[ ] ${tech}`).join('\n')}

📋 PRÓXIMOS PASSOS (CHECKLIST)
-----------------------------------------
${data.nextSteps.map((step, index) => `${index + 1}. [ ] ${step}`).join('\n')}

=========================================
"O código é a poesia da máquina." - CodeJourney
=========================================
    `;

    // 2. Criar um "Blob" (arquivo na memória)
    const blob = new Blob([conteudoTexto], { type: 'text/plain' });

    // 3. Criar link invisível e clicar nele
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'CodeJourney_Plano_Missao.txt'; // Nome do arquivo
    
    document.body.appendChild(a);
    a.click(); // Simula o clique

    // 4. Limpeza
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setTimeout(() => {
        showNotification('✅ Download concluído com sucesso!');
    }, 1000);
}

// ===== MODAL DE CHAT =====

function showChatModal() {
    const modal = createModal('chat');
    modal.innerHTML = `
        <div class="cyber-modal-content chat-modal">
            <div class="modal-header">
                <h3>🤖 MENTOR CODEJOURNEY AI</h3>
                <span class="close-modal" onclick="closeModal('chat')">×</span>
            </div>
            
            <div class="modal-body">
                <div class="chat-messages" id="chatMessages">
                    <!-- Mensagens serão adicionadas aqui -->
                </div>
                
                <div class="chat-input-area">
                    <div class="input-container">
                        <input type="text" id="chatInput" placeholder="Digite sua dúvida de programação..." 
                               onkeypress="handleChatInput(event)">
                        <button class="btn-neon-primary" onclick="sendChatMessage()">
                            📤 Enviar
                        </button>
                    </div>
                    <div class="quick-questions">
                        <span>Perguntas rápidas:</span>
                        <button class="quick-btn" onclick="askQuickQuestion('Como começar com JavaScript?')">JavaScript</button>
                        <button class="quick-btn" onclick="askQuickQuestion('O que é React?')">React</button>
                        <button class="quick-btn" onclick="askQuickQuestion('Dicas para aprender programação')">Dicas</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar histórico do chat
    renderChatHistory();
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 1. Adicionar mensagem do usuário na tela
    addChatMessage('user', message);
    input.value = '';
    input.disabled = true; // Desabilita input enquanto carrega
    
    // Mostra indicador de "digitando..." (opcional, ou apenas aguarda)
    
    try {
        // 2. Conectar com o Backend Real
        const response = await fetch(`${API_BASE}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        // 3. Adicionar resposta da IA
        if (data.response) {
            addChatMessage('mentor', data.response);
        } else {
            addChatMessage('mentor', '⚠️ Erro ao receber resposta da IA.');
        }

    } catch (error) {
        console.error('Erro:', error);
        addChatMessage('mentor', '❌ Falha na conexão com o servidor.');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function askQuickQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendChatMessage();
}

function addChatMessage(sender, text) {
    const message = {
        sender,
        text,
        timestamp: new Date().toLocaleTimeString()
    };
    
    appState.chatHistory.push(message);
    renderChatHistory();
}

function renderChatHistory() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = appState.chatHistory.map(msg => `
        <div class="chat-message ${msg.sender}">
            <div class="message-avatar">${msg.sender === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">
                <p>${msg.text}</p>
                <span class="message-time">${msg.timestamp}</span>
            </div>
        </div>
    `).join('');
    
    // Scroll para baixo
    container.scrollTop = container.scrollHeight;
}

// ===== SISTEMA DE MODAIS =====

function createModal(type) {
    closeAllModals();
    
    const modal = document.createElement('div');
    modal.className = 'cyber-modal';
    modal.id = `${type}Modal`;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 20, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(modal);
    return modal;
}

function closeModal(type) {
    const modal = document.getElementById(`${type}Modal`);
    if (modal) {
        modal.remove();
    }
    
    if (type === 'chat') {
        appState.isChatOpen = false;
    }
}

function closeAllModals() {
    document.querySelectorAll('.cyber-modal').forEach(modal => modal.remove());
}

// ===== SISTEMA DE NOTIFICAÇÕES =====

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `cyber-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'error' ? '❌' : '💡'}</span>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #0c0c1d, #1a1a2e);
        border: 1px solid #00f3ff;
        border-radius: 8px;
        padding: 15px 20px;
        color: white;
        font-family: 'Outfit', sans-serif;
        z-index: 1001;
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.3);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===== EVENT LISTENERS =====

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cyber-modal')) {
        e.target.remove();
    }
});

// Tecla ESC fecha modais
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// ===== ANIMAÇÕES CSS =====

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .cyber-modal-content {
        background: linear-gradient(135deg, #0c0c1d 0%, #1a1a2e 100%);
        border: 2px solid #00f3ff;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 0 50px rgba(0, 243, 255, 0.2);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #00f3ff;
        padding-bottom: 15px;
    }
    
    .modal-header h3 {
        color: #00f3ff;
        margin: 0;
        font-family: 'Tourney', monospace;
    }
    
    .close-modal {
        color: #00f3ff;
        font-size: 24px;
        cursor: pointer;
        background: none;
        border: none;
    }
    
    .progress-bar {
        width: 100%;
        height: 10px;
        background: #0c0c1d;
        border-radius: 5px;
        margin: 20px 0;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00f3ff, #00ff88);
        border-radius: 5px;
        transition: width 0.5s ease;
    }
    
    .question {
        font-size: 1.2em;
        margin-bottom: 20px;
        color: white;
    }
    
    .answer-options {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .option-btn, .quick-btn {
        background: rgba(0, 243, 255, 0.1);
        border: 1px solid #00f3ff;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .option-btn:hover, .quick-btn:hover {
        background: rgba(0, 243, 255, 0.3);
        transform: translateY(-2px);
    }
    
    .custom-answer {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    
    .custom-answer input {
        flex: 1;
        padding: 10px;
        background: #0c0c1d;
        border: 1px solid #00f3ff;
        border-radius: 5px;
        color: white;
    }
    
    .chat-messages {
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
    }
    
    .chat-message {
        display: flex;
        margin-bottom: 15px;
        align-items: flex-start;
    }
    
    .chat-message.user {
        flex-direction: row-reverse;
    }
    
    .message-avatar {
        font-size: 1.5em;
        margin: 0 10px;
    }
    
    .message-content {
        background: rgba(0, 243, 255, 0.1);
        padding: 10px 15px;
        border-radius: 10px;
        max-width: 70%;
        border: 1px solid rgba(0, 243, 255, 0.3);
    }
    
    .chat-message.user .message-content {
        background: rgba(0, 255, 136, 0.1);
        border-color: rgba(0, 255, 136, 0.3);
    }
    
    .message-time {
        font-size: 0.8em;
        color: #888;
        display: block;
        margin-top: 5px;
    }
    
    .input-container {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .input-container input {
        flex: 1;
        padding: 12px;
        background: #0c0c1d;
        border: 1px solid #00f3ff;
        border-radius: 5px;
        color: white;
    }
    
    .quick-questions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 0.9em;
        color: #888;
    }
    
    .result-card, .next-steps {
        background: rgba(0, 243, 255, 0.05);
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        border: 1px solid rgba(0, 243, 255, 0.2);
    }
    
    .result-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
    }
`;

document.head.appendChild(style);

// ===== INICIALIZAÇÃO =====

console.log('🚀 CodeJourney AI Frontend Carregado!');
console.log('👉 Funções disponíveis: startJourney(), openChat(), startDiagnostic(), viewDemo()');

// Mensagem de boas-vindas
setTimeout(() => {
    showNotification('🌟 CodeJourney AI Carregado! Clique em "Inicializar Sistema" para começar.');
}, 1000);