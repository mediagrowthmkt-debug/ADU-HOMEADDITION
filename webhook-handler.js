/**
 * Webhook Handler for Home Additions Forms
 * Sends form data to Make.com webhook
 * Wolf Carpenters - 2025
 */

(function() {
    'use strict';

    // Configuração do webhook
    const WEBHOOK_URL = 'https://mediagrowth-n8n.63kuy3.easypanel.host/webhook/53d5ad38-b5b8-496a-ab98-b204a15068a9';
    const RECAPTCHA_SITE_KEY = '6Lf6EvYsAAAAACvhmVv7noOqYWoBMNTpncggwrW_';
    
    /**
     * Detecta a plataforma baseada na URL
     * @returns {string} - "GOOGLE" ou "META" ou "ORGANIC"
     */
    function detectPlatform() {
        const url = window.location.href.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        
        // Verifica parâmetros UTM primeiro
        const utmSource = params.get('utm_source')?.toLowerCase() || '';
        const utmMedium = params.get('utm_medium')?.toLowerCase() || '';
        
        if (utmSource.includes('google') || utmMedium.includes('cpc') || utmMedium.includes('ppc') || url.includes('google')) {
            return 'GOOGLE';
        }
        
        if (utmSource.includes('meta') || utmSource.includes('facebook') || utmSource.includes('instagram') || url.includes('meta') || url.includes('facebook') || url.includes('instagram')) {
            return 'META';
        }
        
        return 'ORGANIC';
    }
    
    /**
     * Obtém o nome da fonte (URL completa da página)
     * @returns {string}
     */
    function getFonte() {
        return window.location.href;
    }
    
    /**
     * Obtém o nome da página
     * @returns {string}
     */
    function getPageName() {
        return 'Home Additions | Wolf Carpenters';
    }
    
    /**
     * Obtém o nome da campanha
     * @returns {string}
     */
    function getCampaignName() {
        return 'Home Additions';
    }

    function injectHumanCheckStyles() {
        if (document.getElementById('wolf-human-check-styles')) return;

        const style = document.createElement('style');
        style.id = 'wolf-human-check-styles';
        style.textContent = `
            .wolf-hp-field { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
            .human-check { background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 14px; margin: 0 0 15px; }
            .human-check strong { display: block; margin-bottom: 8px; font-size: 0.85rem; font-weight: 700; color: #1a1a1a; }
            .human-check small { display: block; color: #666; font-size: 0.78rem; line-height: 1.35; margin-top: 8px; }
            .recaptcha-widget { min-height: 78px; }
        `;
        document.head.appendChild(style);
    }

    function enhanceFormProtection(form) {
        if (form.dataset.humanCheckReady === 'true') return;

        injectHumanCheckStyles();

        form.dataset.loadedAt = String(Date.now());

        const honeypot = document.createElement('div');
        honeypot.className = 'wolf-hp-field';
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.innerHTML = '<label>Company Website<input type="text" name="company_website" tabindex="-1" autocomplete="off"></label>';

        const humanCheck = document.createElement('div');
        humanCheck.className = 'human-check';
        humanCheck.innerHTML = `
            <strong>Human verification</strong>
            <div class="recaptcha-widget"></div>
            <small>Check I am not a robot before sending.</small>
        `;

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            form.insertBefore(honeypot, submitButton);
            form.insertBefore(humanCheck, submitButton);
        }

        form.dataset.humanCheckReady = 'true';

        if (window.grecaptcha && window.grecaptcha.render) {
            renderRecaptcha(form);
        }
    }

    function renderRecaptcha(form) {
        if (form.dataset.recaptchaWidgetId) return;

        const widget = form.querySelector('.recaptcha-widget');
        if (!widget || !window.grecaptcha || !window.grecaptcha.render) return;

        form.dataset.recaptchaWidgetId = String(
            window.grecaptcha.render(widget, {
                sitekey: RECAPTCHA_SITE_KEY
            })
        );
    }

    function getRecaptchaToken(form) {
        if (!window.grecaptcha || !window.grecaptcha.getResponse) {
            throw new Error('recaptcha_not_loaded');
        }

        renderRecaptcha(form);

        const widgetId = form.dataset.recaptchaWidgetId;
        const token = window.grecaptcha.getResponse(widgetId);
        if (!token) {
            throw new Error('recaptcha_missing');
        }

        return token;
    }

    function validateHumanCheck(form) {
        const honeypot = form.querySelector('[name="company_website"]');
        const loadedAt = Number(form.dataset.loadedAt || Date.now());

        if (honeypot && honeypot.value.trim()) {
            return false;
        }

        if (Date.now() - loadedAt < 4000) {
            alert('Please take a moment to complete the form before submitting.');
            return false;
        }

        return true;
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
        if (!validateHumanCheck(form)) return;

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
        
        const platform = detectPlatform();
        
        // Monta objeto de dados para webhook
        const webhookData = {
            email: email || undefined,
            phone: phone || undefined,
            name: name || undefined,
            campaign_name: getCampaignName(),
            page_name: getPageName(),
            FONTE: getFonte(),
            PLATAFORMA: platform,
            Qualified_question: additionTypeText || undefined,
            human_validation: 'passed',
            human_validation_method: 'recaptcha_honeypot_time',
            form_elapsed_ms: Date.now() - Number(form.dataset.loadedAt || Date.now()),
            honeypot: ''
        };
        
        // Remove campos undefined para enviar apenas campos preenchidos
        Object.keys(webhookData).forEach(key => 
            webhookData[key] === undefined && delete webhookData[key]
        );
        
        console.log('Sending to webhook:', webhookData);

        try {
            webhookData.recaptcha_token = getRecaptchaToken(form);
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            alert('Please complete the human verification before submitting.');
            return;
        }

        // Envia para webhook
        const result = await sendToWebhook(webhookData);
        if (!result.success) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            alert('Something went wrong. Please try again or call us directly.');
            return;
        }

        // Dispara eventos de conversão após validação e webhook aceitos
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', { content_name: getCampaignName(), content_category: additionTypeText });
        }
        if (typeof gtag !== 'undefined' && platform === 'GOOGLE') {
            gtag('event', 'conversion', { 'send_to': 'AW-16525015107/form_submit' });
        }

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
            enhanceFormProtection(form);
            // Remove listener antigo se existir
            form.removeEventListener('submit', handleFormSubmit);
            // Adiciona novo listener
            form.addEventListener('submit', handleFormSubmit);
        });
        
        console.log(`Webhook handler initialized for ${forms.length} form(s)`);
    }
    
    // Inicializa
    init();
    
})();
