# Webhook Integration Update - ADU/Home Additions
**Data:** 21 de Janeiro de 2026  
**Projeto:** Wolf Carpenters - Home Additions Landing Page

---

## 📋 Resumo das Alterações

Atualização da integração webhook para os formulários da landing page de ADU/Home Additions, seguindo as especificações exatas para envio de dados ao Make.com.

---

## 🔗 Webhook Configurado

**URL:** `https://hook.us2.make.com/m6c3nxfa5estl25ymykzq44hlvvfnajp`

---

## 📤 Estrutura de Dados Enviados

### Campos Obrigatórios (sempre enviados):
- `campaign_name`: "Home Additions"
- `page_name`: "Home Additions | Wolf Carpenters"
- `FONTE`: URL completa da página (window.location.href)
- `PLATAFORMA`: "META" ou "GOOGLE" (baseado na detecção automática)

### Campos Opcionais (enviados apenas se preenchidos):
- `email`: Email do usuário
- `phone`: Telefone do usuário
- `name`: Nome do usuário
- `Qualified_question`: Tipo de adição selecionado no formulário

---

## 🎯 Lógica de Detecção de Plataforma

### PLATAFORMA = "META"
Detectado quando a URL ou parâmetros UTM contêm:
- `meta`
- `facebook`
- `instagram`

### PLATAFORMA = "GOOGLE"
Detectado quando a URL ou parâmetros UTM contêm:
- `google`
- `utm_medium=cpc`
- `utm_medium=ppc`

### PLATAFORMA = "ORGANIC"
Quando nenhuma das condições acima for atendida.

---

## 📋 Perguntas Qualificatórias (Qualified_question)

O campo `Qualified_question` captura o tipo de adição selecionado pelo usuário:

1. **Room Addition** - Adição de cômodo
2. **Second Story Addition** - Segundo andar
3. **Garage Addition** - Adição de garagem
4. **Sunroom/Patio Enclosure** - Varanda fechada
5. **Master Suite** - Suíte master
6. **Not Sure Yet** - Ainda não decidiu

---

## 📝 Formulários Atualizados

### 1. Formulário Hero (Topo da Página)
- **Localização:** Seção Hero
- **Campos:** Nome, Email, Telefone, Tipo de Adição
- **Botão:** "Get Free Consultation"

### 2. Formulário de Contato (Final da Página)
- **Localização:** Seção CTA (#contact-form)
- **Campos:** Nome, Email, Telefone, Tipo de Adição
- **Botão:** "Get Free Consultation"

---

## 🔄 Fluxo de Envio

1. **Usuário preenche o formulário**
2. **Clica em "Get Free Consultation"**
3. **JavaScript captura os dados**
4. **Detecta plataforma automaticamente**
5. **Coleta URL da página (FONTE)**
6. **Monta objeto com dados**
7. **Remove campos vazios**
8. **Envia para webhook via POST**
9. **Redireciona para thank-you.html**

---

## 📦 Arquivos Modificados

### 1. `webhook-handler.js` (Versão Development)
- ✅ Função `getFonte()` adicionada para capturar URL completa
- ✅ Lógica atualizada para enviar apenas campos preenchidos
- ✅ Ordem dos campos ajustada conforme especificação
- ✅ `FONTE` agora envia URL completa em vez da plataforma

### 2. `webhook-handler.min.js` (Versão Production)
- ✅ Minificado com todas as atualizações
- ✅ Otimizado para performance

---

## 🧪 Exemplo de Payload Enviado

### Exemplo 1: Usuário vindo do Google Ads
```json
{
  "email": "cliente@example.com",
  "phone": "(555) 123-4567",
  "name": "John Doe",
  "campaign_name": "Home Additions",
  "page_name": "Home Additions | Wolf Carpenters",
  "FONTE": "https://wolfcarpenters.com/ADU-HOMEADDITION/?utm_source=google&utm_medium=cpc",
  "PLATAFORMA": "GOOGLE",
  "Qualified_question": "Second Story Addition"
}
```

### Exemplo 2: Usuário vindo do Facebook
```json
{
  "email": "cliente@example.com",
  "phone": "(555) 987-6543",
  "name": "Jane Smith",
  "campaign_name": "Home Additions",
  "page_name": "Home Additions | Wolf Carpenters",
  "FONTE": "https://wolfcarpenters.com/ADU-HOMEADDITION/?utm_source=facebook&utm_medium=social",
  "PLATAFORMA": "META",
  "Qualified_question": "Room Addition"
}
```

### Exemplo 3: Tráfego Orgânico
```json
{
  "email": "cliente@example.com",
  "phone": "(555) 456-7890",
  "name": "Bob Johnson",
  "campaign_name": "Home Additions",
  "page_name": "Home Additions | Wolf Carpenters",
  "FONTE": "https://wolfcarpenters.com/ADU-HOMEADDITION/",
  "PLATAFORMA": "ORGANIC",
  "Qualified_question": "Master Suite"
}
```

---

## ✅ Validação

### Campos Sempre Presentes:
- ✅ `campaign_name`
- ✅ `page_name`
- ✅ `FONTE` (URL completa)
- ✅ `PLATAFORMA` (META/GOOGLE/ORGANIC)

### Campos Opcionais:
- ✅ Enviados apenas quando preenchidos
- ✅ Não enviados como `null` ou string vazia
- ✅ Removidos do payload se undefined

---

## 🔧 Manutenção Futura

### Para Adicionar Novos Tipos de Adição:
1. Adicionar nova `<option>` no formulário HTML
2. Adicionar mapeamento em `additionTypeLabels` no webhook-handler.js
3. Recriar versão minificada

### Para Alterar URL do Webhook:
1. Atualizar `WEBHOOK_URL` em webhook-handler.js
2. Recriar versão minificada

---

## 📊 Monitoramento

- Console do navegador exibe log: `"Sending to webhook:"` + payload
- Verificar status no Make.com
- Página de agradecimento confirma envio bem-sucedido

---

## ✨ Melhorias Implementadas

1. ✅ URL completa enviada em `FONTE` (não mais só a plataforma)
2. ✅ Campos opcionais enviados apenas quando preenchidos
3. ✅ Limpeza automática de campos undefined
4. ✅ Detecção inteligente de plataforma
5. ✅ Suporte a múltiplos parâmetros UTM
6. ✅ Código otimizado e minificado

---

**Status:** ✅ Implementado e Pronto para Produção  
**Próximo Passo:** Testar em ambiente de produção com diferentes origens de tráfego
