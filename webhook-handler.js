/**
 * Webhook Handler for Home Additions Forms
 * Sends form data to Make.com webhook
 * Wolf Carpenters - 2025
 */

(function() {
    'use strict';

    // Configuração do webhook
    const WEBHOOK_URL = 'https://hook.us2.make.com/m6c3nxfa5estl25ymykzq44hlvvfnajp';
    
    /**
     * Detecta a plataforma baseada na URL
     * @returns {string} - "GOOGLE ADS" ou "META" ou "ORGANIC"
     */
    function detectPlatform() {
        const url = window.location.href.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        
        // Verifica parâmetros UTM primeiro
        const utmSource = params.get('utm_source')?.toLowerCase() || '';
        const utmMedium = params.get('utm_medium')?.toLowerCase() || '';
        
        if (utmSource.includes('google') || utmMedium.includes('cpc') || utmMedium.includes('ppc')) {
            return 'GOOGLE ADS';
        }
        
        if (utmSource.includes('meta') || utmSource.includes('facebook') || utmSource.includes('instagram')) {
            return 'META';
        }
        
        // Verifica na URL
        if (url.includes('google')) {
            return 'GOOGLE ADS';
        }
        
        if (url.includes('meta') || url.includes('facebook') || url.includes('instagram')) {
            return 'META';
        }
        
        return 'ORGANIC';
    }
    
    /**
     * Obtém o nome da fonte (página)
     * @returns {string}
     */
    function getSource() {
        return document.title || 'Home Additions | Wolf Carpenters';
    }
    
    /**
     * Formata data e hora atual
     * @returns {string}
     */
    function getCurrentDateTime() {
        const now = new Date();
        return now.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }
    
    /**
     * Envia dados para o webhook
     * @param {Object} data - Dados do formulário
     * @returns {Promise}
     */
    async function sendToWebhook(data) {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Webhook error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Processa o envio do formulário
     * @param {Event} event - Evento de submit
     */
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        // Desabilita botão durante envio
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Coleta dados do formulário
        const formData = new FormData(form);
        const name = formData.get('name') || '';
        const email = formData.get('email') || '';
        const phone = formData.get('phone') || '';
        const additionType = formData.get('addition-type') || '';
        
        // Mapeia o tipo de adição para texto legível
        const additionTypeLabels = {
            'room-addition': 'Room Addition',
            'second-story': 'Second Story Addition',
            'garage': 'Garage Addition',
            'sunroom': 'Sunroom/Patio Enclosure',
            'master-suite': 'Master Suite',
            'not-sure': 'Not Sure Yet'
        };
        
        const additionTypeText = additionTypeLabels[additionType] || additionType;
        
        // Monta objeto de dados para webhook
        const webhookData = {
            NOME: name,
            'E-MAIL': email,
            TELEFONE: phone,
            PERGUNTA: additionTypeText,
            PLATAFORMA: detectPlatform(),
            FONTE: getSource(),
            QUANDO: getCurrentDateTime()
        };
        
        console.log('Sending to webhook:', webhookData);
        
        // Envia para webhook
        const result = await sendToWebhook(webhookData);
        
        // Envia para webhook e redireciona
        await sendToWebhook(webhookData);
        
        // Redireciona para página de agradecimento
        window.location.href = 'thank-you.html';
    }
    
    /**
     * Inicializa os event listeners quando o DOM estiver pronto
     */
    function init() {
        // Aguarda DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attachFormListeners);
        } else {
            attachFormListeners();
        }
    }
    
    /**
     * Anexa listeners a todos os formulários da página
     */
    function attachFormListeners() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Remove listener antigo se existir
            form.removeEventListener('submit', handleFormSubmit);
            // Adiciona novo listener
            form.addEventListener('submit', handleFormSubmit);
        });
        
        console.log(`✅ Webhook handler initialized for ${forms.length} form(s)`);
    }
    
    // Inicializa
    init();
    
})();
