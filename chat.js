/**
 * Chat Page Logic
 * Handles the dedicated chat page functionality
 */

import { portfolioContext } from './portfolio-context.js';
import { LLMClient } from './llm-client.js';
import { analytics } from './analytics.js';

class ChatPageManager {
  constructor() {
    this.llmClient = new LLMClient();
    this.isInitialized = false;
    this.currentSession = {
      startTime: Date.now(),
      messageCount: 0,
    };
  }

  async initialize() {
    const setupInstructions = document.getElementById('setupInstructions');
    const chatArea = document.getElementById('chatArea');
    const loadingState = document.getElementById('loadingState');
    const checkConnectionBtn = document.getElementById('checkConnectionBtn');

    // Try to detect LLM availability
    const isAvailable = await this.detectLLMAvailability();

    if (isAvailable) {
      // Initialize LLM client
      const config = await this.getLLMConfig();
      const initResult = await this.llmClient.initialize(config);

      if (initResult.success) {
        loadingState.classList.add('hidden');
        chatArea.classList.remove('hidden');
        setupInstructions.classList.add('hidden');
        this.setupChatInterface();
        this.isInitialized = true;

        // Track page view
        analytics.trackEvent('chat_page_loaded', { llm_provider: config.provider });
      } else {
        this.showSetupInstructions(setupInstructions);
      }
    } else {
      this.showSetupInstructions(setupInstructions);
    }

    // Setup check connection button
    checkConnectionBtn.addEventListener('click', () => this.checkConnection());
  }

  async detectLLMAvailability() {
    // Try Ollama first (local)
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        return true;
      }
    } catch (e) {
      // Ollama not available
    }

    // Try HuggingFace (requires API key from localStorage)
    const hfKey = localStorage.getItem('hf_api_key');
    if (hfKey) {
      return true;
    }

    return false;
  }

  async getLLMConfig() {
    // Check Ollama first
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        const model = models.length > 0 ? models[0].name : 'mistral';

        return {
          provider: 'ollama',
          model: model,
          baseUrl: 'http://localhost:11434',
          temperature: 0.7,
          maxTokens: 512,
        };
      }
    } catch (e) {
      // Continue to HF
    }

    // Use HuggingFace if API key exists
    const hfKey = localStorage.getItem('hf_api_key');
    if (hfKey) {
      return {
        provider: 'huggingface',
        model: 'mistralai/Mistral-7B-Instruct-v0.1',
        apiKey: hfKey,
        temperature: 0.7,
        maxTokens: 512,
      };
    }

    throw new Error('No LLM provider available');
  }

  showSetupInstructions(element) {
    element.classList.remove('hidden');
    document.getElementById('chatArea').classList.add('hidden');
    document.getElementById('loadingState').classList.add('hidden');
  }

  async checkConnection() {
    const btn = document.getElementById('checkConnectionBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

    try {
      const config = await this.getLLMConfig();
      const result = await this.llmClient.initialize(config);

      if (result.success) {
        // Reload page
        location.reload();
      } else {
        alert(
          'Connection failed: ' + result.error +
          '\n\nPlease check that Ollama is running or enter your Hugging Face API key.'
        );
      }
    } catch (error) {
      alert(
        'No LLM provider found.\n\n' +
        'Please:\n' +
        '1. Install and run Ollama locally, OR\n' +
        '2. Enter your Hugging Face API key'
      );
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plug"></i> Check Connection';
  }

  setupChatInterface() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const suggestedPrompts = document.querySelectorAll('.prompt-card');

    // Add welcome message
    this.addMessage(
      'Hi! I\'m Blessing\'s AI assistant. Ask me anything about Blessing, their skills, projects, or general questions!',
      'ai'
    );

    // Send button listener
    sendBtn.addEventListener('click', () => this.handleSendMessage(userInput));

    // Enter key in textarea
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage(userInput);
      }
    });

    // Suggested prompts
    suggestedPrompts.forEach((card) => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt');
        userInput.value = prompt;
        userInput.focus();
      });
    });
  }

  async handleSendMessage(inputElement) {
    const message = inputElement.value.trim();
    if (!message || this.llmClient.isAwaitingResponse) {
      return;
    }

    // Add user message
    this.addMessage(message, 'user');
    inputElement.value = '';
    inputElement.style.height = 'auto';

    // Track message
    this.currentSession.messageCount++;
    analytics.trackEvent('message_sent', {
      message_length: message.length,
      session_duration: Date.now() - this.currentSession.startTime,
    });

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Build system prompt with portfolio context
      const systemPrompt = this.buildSystemPrompt();

      // Get AI response
      const response = await this.llmClient.generateResponse(message, systemPrompt);

      if (response.success) {
        this.addMessage(response.text, 'ai');
      } else {
        this.addMessage(
          `Sorry, I encountered an error: ${response.error}. Please try again.`,
          'ai'
        );
      }
    } catch (error) {
      this.addMessage(
        `Error: ${error.message}. Please check that your LLM provider is running.`,
        'ai'
      );
    } finally {
      this.removeTypingIndicator();
    }
  }

  buildSystemPrompt() {
    const portfolio = portfolioContext.systemPromptContext || 
      `You are Blessing's AI assistant. ${portfolioContext.personal?.description}. 
      Blessing is a ${portfolioContext.personal?.title} based in ${portfolioContext.personal?.location || 'an exciting location'}.
      
      Key Information About Blessing:
      - Skills: ${portfolioContext.skills?.development?.join(', ') || 'Web development, AI integration'}
      - Experience: ${portfolioContext.experience?.summary || '1+ years frontend, 3+ years project management'}
      - Current Focus: ${portfolioContext.education?.current?.specializations?.join(', ') || 'Web dev, AI, app development'}
      
      When asked about Blessing, provide accurate information from this context. For general questions, be helpful and friendly.`;

    return portfolio;
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

    messageDiv.appendChild(contentDiv);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-timestamp';
    timeDiv.textContent = time;
    messageDiv.appendChild(timeDiv);

    chatMessages.appendChild(messageDiv);

    // Auto-scroll to bottom
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 0);
  }

  formatMessage(text) {
    let formatted = text;

    // Escape HTML
    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Format markdown-like syntax
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');

    // Format URLs
    formatted = formatted.replace(
      /https?:\/\/[^\s]+/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
    );

    return formatted;
  }

  showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator-container';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typingDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  removeTypingIndicator() {
    const typingDiv = document.getElementById('typingIndicator');
    if (typingDiv) {
      typingDiv.remove();
    }
  }
}

// Initialize chat page when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const chatManager = new ChatPageManager();
  await chatManager.initialize();
});
