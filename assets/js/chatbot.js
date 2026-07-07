/**
 * Adomantra AI Chatbot
 * Powered by Groq API — strictly scoped to adomantra.com content
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────── */
  const GROQ_API_KEY = ''; // Provide your Groq API Key here
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL = 'llama-3.3-70b-versatile';
  const SYSTEM_PROMPT = `You are the official AI assistant for Adomantra (adomantra.com) — an award-winning digital advertising agency based in New Delhi, India.

Your role: Answer and request for what may i help your and from your side question asked by client should be small and natural tone and not always talk about adomantra's only questions related to Adomantra's services, team, achievements, contact info, and digital marketing topics they specialise in and dont use "**".

Key facts about Adomantra:
- Full name: Adomantra Digital India Pvt Ltd
- Website: https://www.adomantra.com/
- Address: 3rd Floor, Tower-1, Plot No. 48, Rama Rd, Industrial Area, Najafgarh Road Industrial Area, New Delhi – 110015
- Email: connect@adomantra.com | info@adomantra.com
- Phone: +91-9650706427
- Social: Facebook, Instagram, LinkedIn, Twitter (@adomantra1)
- Rating: 4.4 stars from 52 reviews
- Founded: 13+ years ago (ISO-certified)
- Working hours: Mon–Fri, 09:30 AM – 6:30 PM IST

Core services:
1. Programmatic Advertising & CTV Advertising
2. Performance Marketing (PPC, Google Ads, Meta Ads)
3. SEO Services (organic search growth)
4. Social Media Marketing & Optimization (SMO)
5. Display & Rich Media Advertising
6. DV360 & Amazon DSP Campaigns
7. UI/UX Design & Web Development
8. Branding & Creative Design
9. Digital Strategy & Consulting

Key stats:
- 500+ Happy Clients
- 20+ Industry Verticals
- 400+ Active Campaigns
- 100B+ Monthly Impressions
- 800M+ Monthly Clicks
- 1B+ Monthly Video Views

Team:
- Mohit — Graphics Designer & Video Editor
- Deepak — SEO Expert & Digital Marketing Expert
- Annie — Content Writer
- Harshita — Creative Content & Social Media
- Shubham — Programmatic Manager
- Naman — Media Buyer
- Nupur — SEO Expert & Digital Marketing Expert
- Simran — Media Buyer

FAQ:
Q1: What does Adomantra specialize in?
A: Adomantra specializes in performance marketing, programmatic advertising, SEO, social media marketing, and creative digital campaigns.

Q2: How can I contact Adomantra?
A: Email connect@adomantra.com or info@adomantra.com, or call +91-9650706427. Office hours: Mon–Fri, 09:30 AM – 6:30 PM IST.

Q3: Where is Adomantra located?
A: 3rd Floor, Tower-1, Plot No. 48, Rama Rd, Industrial Area, Najafgarh Road, New Delhi – 110015.

Q4: Does Adomantra handle large-scale campaigns?
A: Yes — 400+ active campaigns across Google, Meta, DV360, and Amazon DSP with 100B+ monthly impressions.

Q5: What makes Adomantra different?
A: Data-driven strategy + advanced ad-tech + creative execution = measurable business growth for 500+ clients.

Q6: Can Adomantra help with SEO and web development?
A: Yes, they offer full SEO services, UI/UX design, and web development to improve both rankings and user experience.

Rules:
- Keep answers SHORT (2–4 sentences max).
- Only answer Adomantra or digital-marketing related queries.
- Be friendly, professional, and brand-aligned.
- For contact/sales queries direct users to contact@adomantra.com or the Contact page.`;

  /* ─────────────────────────────────────────
     1. INJECT CSS
  ───────────────────────────────────────── */
  const style = document.createElement('style');
  style.id = 'adomantra-chatbot-css';
  style.textContent = `
  /* ── Variables ── */
  #ado-chatbot-root {
    --ado-white: var(--neutral-100);
    --ado-black: var(--neutral-800);
    --ado-accent: var(--primary-color);
    --ado-gray-light: #f4f4f5;
    --ado-gray-border: #e4e4e7;
    --ado-text-muted: #71717a;
    --ado-green: #22c55e;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* ── FAB Button ── */
  #ado-chat-fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 99999;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--primary-color);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 28px rgba(0,0,0,0.22);
    color: #fff;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    outline: none;
  }
  #ado-chat-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 36px rgba(0,0,0,0.3);
  }
  #ado-chat-fab i {
    font-size: 22px;
    position: absolute;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  #ado-chat-fab .ado-icon-chat  { opacity: 1; transform: rotate(0deg) scale(1); }
  #ado-chat-fab .ado-icon-close { opacity: 0; transform: rotate(-90deg) scale(0.6); }
  #ado-chat-fab.open .ado-icon-chat  { opacity: 0; transform: rotate(90deg) scale(0.6); }
  #ado-chat-fab.open .ado-icon-close { opacity: 1; transform: rotate(0deg) scale(1); }

  /* Pulse ring */
  #ado-chat-fab::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 2px solid rgba(17,17,17,0.3);
    animation: ado-pulse 2.4s ease-out infinite;
    pointer-events: none;
  }
  @keyframes ado-pulse {
    0%   { transform: scale(1);   opacity: 0.7; }
    70%  { transform: scale(1.45); opacity: 0; }
    100% { transform: scale(1.45); opacity: 0; }
  }

  /* ── Chat Window ── */
  #ado-chat-window {
    position: fixed;
    bottom: 102px;
    right: 28px;
    z-index: 99998;
    width: 380px;
    max-height: 600px;
    height: 80vh;
    border-radius: 16px;
    background: var(--ado-white);
    border: 1px solid var(--ado-gray-border);
    box-shadow: 0px 7.77px 16px 0px rgba(0, 0, 0, 0.05), 0px 3px 3px 0px rgba(0, 0, 0, 0.1), 0px -8px 0px 0px rgba(0, 0, 0, 0.05) inset, 0px 0px 0px 0px rgba(255, 255, 255, 0.6) inset;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translateY(16px) scale(0.97);
    transform-origin: bottom right;
    transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.34,1.2,0.64,1);
  }
  #ado-chat-window.visible {
    opacity: 1;
    pointer-events: all;
    transform: translateY(0) scale(1);
  }

  /* Header */
  .ado-chat-header {
    padding: 14px 18px;
    border-bottom: 1px solid var(--ado-gray-border);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    background: var(--ado-white);
  }
  .ado-chat-header-avatar {
    width: 38px;
    height: 38px;
    background: var(--ado-gray-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    color: var(--ado-black);
    flex-shrink: 0;
  }
  .ado-chat-header-info { flex: 1; min-width: 0; }
  .ado-chat-header-info h4 {
    margin: 0;
    font-size: 17px;
    font-weight: 500;
    color: var(--ado-black);
    line-height: 1.3;
  }
  .ado-chat-header-info span {
    font-size: 11.5px;
    color: var(--ado-text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 1px;
  }
  .ado-online-dot {
    width: 7px;
    height: 7px;
    background: var(--ado-green);
    border-radius: 50%;
    display: inline-block;
    animation: ado-blink 1.8s ease infinite;
  }
  @keyframes ado-blink { 0%,100%{opacity:1} 50%{opacity:0.35} }

  /* Messages scroll area */
  .ado-chat-messages {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #d4d4d8 transparent;
  }
  .ado-chat-messages::-webkit-scrollbar { width: 4px; }
  .ado-chat-messages::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }

  /* Welcome area */
  .ado-welcome-area { padding: 18px; }
  .ado-welcome-area h3 {
    margin: 0 0 4px;
    font-size: 17px;
    font-weight: 400;
    color: var(--ado-black);
  }
  .ado-welcome-area > p {
    font-size: 13px;
    color: var(--ado-text-muted);
    margin: 0 0 16px;
  }

  /* Feature cards grid */
  .ado-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 18px;
  }
  .ado-feature-item {
    padding: 12px;
    border: 1px solid var(--ado-gray-border);
    border-radius: 10px;
    cursor: pointer;
    background: var(--ado-white);
    text-align: left;
    transition: border-color 0.18s, background 0.18s;
  }
  .ado-feature-item:hover {
    border-color: var(--ado-black);
    background: var(--ado-gray-light);
  }
  .ado-feature-item i {
    display: block;
    margin-bottom: 6px;
    font-size: 16px;
    color: var(--ado-black);
  }
  .ado-feature-item span {
    font-size: 12px;
    font-weight: 600;
    color: var(--ado-black);
    display: block;
  }

  /* Suggested questions */
  .ado-section-title {
    font-size: 10.5px;
    font-weight: 700;
    color: var(--ado-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin: 0 0 8px;
  }
  .ado-question-prompt {
    width: 100%;
    text-align: left;
    padding: 10px 13px;
    background: var(--ado-gray-light);
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 13px;
    color: var(--ado-black);
    margin-bottom: 7px;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s;
    font-family: inherit;
  }
  .ado-question-prompt:hover {
    background: var(--ado-white);
    border-color: var(--ado-black);
  }

  /* Chat conversation bubbles */
  .ado-conversation { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }

  .ado-msg {
    display: flex;
    gap: 8px;
    animation: ado-msg-in 0.28s cubic-bezier(0.34,1.2,0.64,1) both;
  }
  @keyframes ado-msg-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .ado-msg.user { flex-direction: row-reverse; align-items: flex-end; }

  .ado-bot-mini {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--ado-gray-light);
    border: 1px solid var(--ado-gray-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--ado-black);
    flex-shrink: 0;
  }

  .ado-bubble {
    max-width: 80%;
    padding: 10px 13px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.55;
    word-break: break-word;
    font-family: inherit;
  }
  .ado-msg.bot  .ado-bubble {
    background: var(--ado-gray-light);
    color: var(--ado-black);
    border-bottom-left-radius: 3px;
  }
  .ado-msg.user .ado-bubble {
    background: var(--ado-black);
    color: #fff;
    border-bottom-right-radius: 3px;
  }

  /* Typing indicator */
  .ado-typing-dots {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 11px 14px;
    background: var(--ado-gray-light);
    border-radius: 14px;
    border-bottom-left-radius: 3px;
    width: fit-content;
  }
  .ado-typing-dots span {
    width: 6px;
    height: 6px;
    background: #a1a1aa;
    border-radius: 50%;
    animation: ado-bounce 1.2s ease infinite;
  }
  .ado-typing-dots span:nth-child(2) { animation-delay: 0.18s; }
  .ado-typing-dots span:nth-child(3) { animation-delay: 0.36s; }
  @keyframes ado-bounce {
    0%,80%,100% { transform: translateY(0); }
    40% { transform: translateY(-5px); }
  }

  /* Input area */
  .ado-chat-input-area {
    padding: 12px 14px;
    border-top: 1px solid var(--ado-gray-border);
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: var(--ado-white);
    flex-shrink: 0;
  }
  #ado-chat-input {
    flex: 1;
    border: 1px solid var(--ado-gray-border);
    border-radius: 10px;
    padding: 9px 12px;
    font-size: 13.5px;
    font-family: inherit;
    resize: none;
    outline: none;
    line-height: 1.45;
    max-height: 90px;
    min-height: 38px;
    background: var(--ado-gray-light);
    color: var(--ado-black);
    transition: border-color 0.18s, background 0.18s;
  }
  #ado-chat-input:focus {
    border-color: var(--ado-black);
    background: var(--ado-white);
  }
  #ado-chat-input::placeholder { color: #a1a1aa; }

  #ado-chat-send {
    background: var(--ado-black);
    color: #fff;
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
    transition: opacity 0.18s, transform 0.18s;
  }
  #ado-chat-send:hover   { opacity: 0.82; transform: scale(1.05); }
  #ado-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* Footer */
  .ado-chat-footer {
    text-align: center;
    padding: 7px;
    font-size: 10.5px;
    color: var(--ado-text-muted);
    border-top: 1px solid var(--ado-gray-border);
    flex-shrink: 0;
    background: var(--ado-white);
  }
  .ado-chat-footer a {
    color: var(--ado-black);
    text-decoration: none;
    font-weight: 600;
  }
  .ado-chat-footer a:hover { text-decoration: underline; }

  /* Mobile */
  @media (max-width: 440px) {
    #ado-chat-window { bottom: 96px; }
    #ado-chat-fab    { right: 18px; bottom: 22px; }
  }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────
     2. INJECT HTML  (single injection only)
  ───────────────────────────────────────── */
  const root = document.createElement('div');
  root.id = 'ado-chatbot-root';
  root.innerHTML = `
    <!-- FAB -->
    <button id="ado-chat-fab" aria-label="Open Adomantra AI Assistant">
      <i class="fa-solid fa-comment-dots ado-icon-chat"></i>
      <i class="fa-solid fa-xmark ado-icon-close"></i>
    </button>

    <!-- Chat Window -->
    <div id="ado-chat-window" role="dialog" aria-label="Adomantra AI Assistant">

      <!-- Header -->
      <div class="ado-chat-header">
        <div class="ado-chat-header-avatar">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="ado-chat-header-info">
          <h4>Adomantra Assistant</h4>
          <span><span class="ado-online-dot"></span> Active Now</span>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="ado-chat-messages" id="ado-chat-messages">

        <!-- Welcome / Home view -->
        <div class="ado-welcome-area" id="ado-welcome-area">
          <h3>Hi! How can we help? 👋</h3>
          <p>Choose a category or ask your own question below.</p>

          <div class="ado-features-grid">
            <button class="ado-feature-item" data-q="What services does Adomantra offer?">
              <i class="fa-solid fa-briefcase"></i>
              <span>Services</span>
            </button>
            <button class="ado-feature-item" data-q="What is CTV advertising?">
              <i class="fa-solid fa-tv"></i>
              <span>CTV Ads</span>
            </button>
            <button class="ado-feature-item" data-q="Tell me about Adomantra achievements and stats.">
              <i class="fa-solid fa-trophy"></i>
              <span>Success</span>
            </button>
            <button class="ado-feature-item" data-q="How can I contact Adomantra?">
              <i class="fa-solid fa-headset"></i>
              <span>Support</span>
            </button>
          </div>

          <div class="ado-section-title">Common Questions</div>
          <button class="ado-question-prompt" data-q="What services does Adomantra offer?">What services do you offer?</button>
          <button class="ado-question-prompt" data-q="How can I start a digital marketing campaign with Adomantra?">How do I start a campaign?</button>
          <button class="ado-question-prompt" data-q="What technology and platforms does Adomantra use?">Tell me about your technology.</button>
        </div>

        <!-- Conversation messages injected here -->
        <div class="ado-conversation" id="ado-conversation"></div>

      </div>

      <!-- Input -->
      <div class="ado-chat-input-area">
        <textarea id="ado-chat-input" placeholder="Ask anything about Adomantra…" rows="1"></textarea>
        <button id="ado-chat-send" aria-label="Send">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>

      <div class="ado-chat-footer">
        Powered by <a href="https://www.adomantra.com/" target="_blank" rel="noopener">Adomantra</a> &amp; Groq AI
      </div>
    </div>
  `;
  document.body.appendChild(root);

  /* ─────────────────────────────────────────
     3. REFERENCES
  ───────────────────────────────────────── */
  const fab = document.getElementById('ado-chat-fab');
  const chatWindow = document.getElementById('ado-chat-window');
  const msgArea = document.getElementById('ado-chat-messages');
  const conversation = document.getElementById('ado-conversation');
  const welcomeArea = document.getElementById('ado-welcome-area');
  const inputEl = document.getElementById('ado-chat-input');
  const sendBtn = document.getElementById('ado-chat-send');

  const history = [];
  let isOpen = false;
  let isLoading = false;

  /* ─────────────────────────────────────────
     4. TOGGLE
  ───────────────────────────────────────── */
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    fab.classList.toggle('open', isOpen);
    chatWindow.classList.toggle('visible', isOpen);
    if (isOpen) inputEl.focus();
  });

  /* ─────────────────────────────────────────
     5. QUICK-QUESTION HANDLERS (event delegation)
  ───────────────────────────────────────── */
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-q]');
    if (btn && btn.dataset.q) {
      sendMessage(btn.dataset.q);
    }
  });

  /* ─────────────────────────────────────────
     6. RENDER HELPERS
  ───────────────────────────────────────── */
  function addMessage(role, text) {
    // Hide welcome on first real message
    if (welcomeArea && conversation.children.length === 0) {
      welcomeArea.style.display = 'none';
    }

    const msg = document.createElement('div');
    msg.className = `ado-msg ${role}`;

    const avatar = role === 'bot'
      ? `<div class="ado-bot-mini"><i class="fa-solid fa-robot"></i></div>`
      : '';

    msg.innerHTML = `
      ${avatar}
      <div class="ado-bubble">${escapeHtml(text)}</div>
    `;
    conversation.appendChild(msg);
    scrollToBottom();
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'ado-msg bot';
    row.id = 'ado-typing-indicator';
    row.innerHTML = `
      <div class="ado-bot-mini"><i class="fa-solid fa-robot"></i></div>
      <div class="ado-typing-dots"><span></span><span></span><span></span></div>
    `;
    conversation.appendChild(row);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('ado-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  /* ─────────────────────────────────────────
     7. SEND MESSAGE
  ───────────────────────────────────────── */
  async function sendMessage(userText) {
    userText = (userText || '').trim();
    if (!userText || isLoading) return;

    isLoading = true;
    sendBtn.disabled = true;

    addMessage('user', userText);
    history.push({ role: 'user', content: userText });

    inputEl.value = '';
    inputEl.style.height = 'auto';

    showTyping();

    if (!GROQ_API_KEY) {
      setTimeout(() => {
        removeTyping();
        addMessage('bot', '⚠️ Chatbot API key is not configured. Please add your Groq API Key to assets/js/chatbot.js to start chatting!');
        isLoading = false;
        sendBtn.disabled = false;
        inputEl.focus();
      }, 600);
      return;
    }

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.slice(-10)
          ],
          max_tokens: 200,
          temperature: 0.6,
          stream: false
        })
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim()
        || "Sorry, I couldn't get a response. Please try again.";

      removeTyping();
      addMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });

    } catch (err) {
      removeTyping();
      addMessage('bot', '⚠️ Something went wrong. Please check your connection and try again.');
      console.error('[Adomantra Chatbot]', err);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  /* ─────────────────────────────────────────
     8. INPUT EVENT LISTENERS
  ───────────────────────────────────────── */
  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  // Auto-grow textarea
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + 'px';
  });

})();
