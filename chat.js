/**
 * Chat Page Logic — Powered by Google Gemini API
 *
 * ⚙️  SETUP: Replace the placeholder below with your actual Gemini API key.
 *    Get a free key at: https://aistudio.google.com/apikey
 *
 *    The free tier gives you:
 *    - 15 requests per minute
 *    - 1,500 requests per day
 *    - 1 million tokens per day
 *    — More than enough for a portfolio chatbot!
 */

import { portfolioContext } from './portfolio-context.js';

// ============================================================
//  🔑  PASTE YOUR GEMINI API KEY HERE
// ============================================================
const GEMINI_API_KEY = 'AQ.Ab8RN6LqNW8ZTAQO8sjFIG8MJGf7J36bp0YQSxQ7GcAe9g9wTQ';
// ============================================================

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export function generateLocalChatResponse(userMessage, portfolio = portfolioContext) {
  const message = (userMessage || '').toLowerCase();
  const { personal, about, education, experience, expertise, skills, projects, contact } = portfolio;

  if (!message) {
    return `Hi! I’m ${personal.name}'s portfolio assistant. I can answer questions about their background, skills, projects, and contact details.`;
  }

  if (/hello|hi|hey|welcome/.test(message)) {
    return `Hi! I’m ${personal.name}'s portfolio assistant. I can help with their background, skills, projects, and how to get in touch.`;
  }

  if (/about|who are you|who is|introduce|background/.test(message)) {
    return `${about.whoIAm} ${about.philosophy}`;
  }

  if (/skill|skills|expertise|technology|stack|programming/.test(message)) {
    const topSkills = skills.development.slice(0, 3).map((skill) => `${skill.name} (${skill.proficiency})`).join(', ');
    return `${personal.name} is strong in ${topSkills}, plus networking, Linux administration, and AI integration.`;
  }

  if (/project|projects|portfolio|worked on|built/.test(message)) {
    const featured = projects.slice(0, 3).map((project) => `${project.name} (${project.type})`).join(', ');
    return `${personal.name} has worked on projects such as ${featured}.`;
  }

  if (/contact|email|linkedin|github|reach|connect/.test(message)) {
    return `You can reach ${personal.name} at ${contact.email}. Their GitHub is ${contact.github} and LinkedIn is ${contact.linkedin}.`;
  }

  if (/education|study|university|degree|school/.test(message)) {
    return `${personal.name} is currently studying ${education.current.degree} at ${education.current.institution}.`;
  }

  if (/experience|job|work|career/.test(message)) {
    return `${experience.summary}. Their focus includes Frontend Web Development and Project Management.`;
  }

  if (/help|what can you do|capabilities/.test(message)) {
    return `I can answer questions about ${personal.name}'s background, skills, projects, education, experience, and contact details.`;
  }

  return `I can help with ${personal.name}'s background, skills, projects, education, experience, and contact details. Try asking about their current studies, portfolio projects, or how to reach them.`;
}

class ChatPageManager {
  constructor() {
    this.conversationHistory = []; // Tracks the full chat session for context
    this.isWaiting = false;
  }

  initialize() {
    this.setupUI();
    this.showWelcomeMessage();
  }

  setupUI() {
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const promptCards = document.querySelectorAll('.prompt-card');

    // Send on button click
    sendBtn.addEventListener('click', () => this.handleSend());

    // Send on Enter (Shift+Enter = new line)
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
      userInput.style.height = 'auto';
      userInput.style.height = Math.min(userInput.scrollHeight, 160) + 'px';
    });

    // Suggested prompt cards
    promptCards.forEach((card) => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt');
        userInput.value = prompt;
        userInput.focus();
        userInput.dispatchEvent(new Event('input'));
        this.handleSend();
      });
    });
  }

  showWelcomeMessage() {
    this.addMessage(
      "Hi there! 👋 I'm Blessing's AI assistant. Ask me anything — about Blessing's skills, projects, background, or how to get in touch!",
      'ai'
    );
  }

  async handleSend() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();

    if (!message || this.isWaiting) return;

    // Display user message
    this.addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';

    // Add to conversation history
    this.conversationHistory.push({ role: 'user', parts: [{ text: message }] });

    // Show typing indicator
    this.isWaiting = true;
    this.showTypingIndicator();

    try {
      const responseText = await this.callGeminiAPI(message);
      this.removeTypingIndicator();

      // Add AI response to history
      this.conversationHistory.push({ role: 'model', parts: [{ text: responseText }] });

      this.addMessage(responseText, 'ai');
    } catch (error) {
      this.removeTypingIndicator();
      console.error('Gemini API error:', error);
      this.addMessage(generateLocalChatResponse(message), 'ai');
    } finally {
      this.isWaiting = false;
    }
  }

  async callGeminiAPI(userMessage) {
    const systemPrompt = portfolioContext.systemPromptContext;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: this.conversationHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.9,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return text;
  }

  addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = this.formatMessage(text);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-timestamp';
    timeDiv.textContent = time;

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to latest message
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 0);
  }

  formatMessage(text) {
    // Escape HTML entities first
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convert markdown-style formatting
    formatted = formatted
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline code: `code`
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bullet points: lines starting with - or *
      .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
      // Numbered lists: lines starting with 1. 2. etc
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Markdown links: [text](url)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Plain URLs
      .replace(/(?<![">])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return formatted;
  }

  showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator-container';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  removeTypingIndicator() {
    const typingDiv = document.getElementById('typingIndicator');
    if (typingDiv) typingDiv.remove();
  }
}

// Boot the chat when the page is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const manager = new ChatPageManager();
    manager.initialize();
  });
}
