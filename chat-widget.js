/**
 * ChatWidget - Reusable Floating Chat Widget Component
 * A standalone floating chat interface that can be integrated across any web page
 * without requiring page reloads or complex setup.
 */

class ChatWidget {
  constructor() {
    this.isOpen = false;
    this.isMinimized = false;
    this.messages = [];
    this.config = {
      llmClient: null,
      portfolioContext: '',
      position: 'bottom-right',
      theme: 'light',
      title: 'Chat Assistant',
    };
    this.elements = {};
    this.isAwaitingResponse = false;
  }

  /**
   * Initialize the chat widget with configuration and LLM client
   * @param {Object} config - Configuration object
   * @param {Object} config.llmClient - LLM client instance with send() method
   * @param {string} config.portfolioContext - Context about portfolio/business
   * @param {string} config.position - Widget position (bottom-right, bottom-left, top-right, top-left)
   * @param {string} config.theme - Color theme (light, dark)
   * @param {string} config.title - Widget title
   */
  initialize(config = {}) {
    this.config = { ...this.config, ...config };
    this.createWidgetDOM();
    this.attachEventListeners();
    this.injectStyles();
    return this;
  }

  /**
   * Create the widget DOM structure
   */
  createWidgetDOM() {
    // Container wrapper
    const container = document.createElement('div');
    container.id = 'chat-widget-container';
    container.setAttribute('data-position', this.config.position);
    container.innerHTML = `
      <div class="chat-widget-wrapper">
        <!-- Chat Window -->
        <div class="chat-widget-window" id="chatWindow">
          <!-- Header -->
          <div class="chat-widget-header">
            <div class="chat-widget-title">${this.config.title}</div>
            <div class="chat-widget-controls">
              <button class="chat-widget-btn chat-minimize-btn" id="minimizeBtn" title="Minimize">
                <span class="chat-icon">−</span>
              </button>
              <button class="chat-widget-btn chat-close-btn" id="closeBtn" title="Close">
                <span class="chat-icon">×</span>
              </button>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="chat-widget-messages" id="messagesContainer">
            <div class="chat-welcome-message">
              <div class="chat-message-content">
                <p>👋 Hi! I'm here to help. Feel free to ask me anything about the portfolio or services.</p>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div class="chat-typing-indicator" id="typingIndicator" style="display: none;">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>

          <!-- Input Area -->
          <div class="chat-widget-input-area">
            <input
              type="text"
              class="chat-widget-input"
              id="messageInput"
              placeholder="Type a message..."
              maxlength="1000"
            />
            <button class="chat-widget-btn chat-send-btn" id="sendBtn" title="Send">
              <span class="chat-icon">→</span>
            </button>
          </div>

          <!-- Footer Actions -->
          <div class="chat-widget-footer">
            <button class="chat-widget-btn chat-clear-btn" id="clearBtn" title="Clear chat history">
              🗑️ Clear
            </button>
          </div>
        </div>

        <!-- Toggle Button (when closed) -->
        <button class="chat-widget-toggle" id="toggleBtn" title="Open chat">
          💬
        </button>
      </div>
    `;

    document.body.appendChild(container);

    // Cache DOM elements
    this.elements = {
      container: container,
      window: document.getElementById('chatWindow'),
      messagesContainer: document.getElementById('messagesContainer'),
      messageInput: document.getElementById('messageInput'),
      sendBtn: document.getElementById('sendBtn'),
      closeBtn: document.getElementById('closeBtn'),
      minimizeBtn: document.getElementById('minimizeBtn'),
      clearBtn: document.getElementById('clearBtn'),
      toggleBtn: document.getElementById('toggleBtn'),
      typingIndicator: document.getElementById('typingIndicator'),
    };

    // Initially hide the chat window
    this.elements.window.style.display = 'none';
  }

  /**
   * Attach event listeners to widget elements
   */
  attachEventListeners() {
    this.elements.sendBtn.addEventListener('click', () => this.handleSendMessage());
    this.elements.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    this.elements.closeBtn.addEventListener('click', () => this.toggleWidget());
    this.elements.minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    this.elements.clearBtn.addEventListener('click', () => this.clearChat());
    this.elements.toggleBtn.addEventListener('click', () => this.toggleWidget());

    // Auto-focus input when widget opens
    this.elements.window.addEventListener('focusin', () => {
      this.elements.messageInput.focus();
    });
  }

  /**
   * Handle sending a message
   */
  handleSendMessage() {
    const text = this.elements.messageInput.value.trim();
    if (!text || this.isAwaitingResponse) return;

    this.sendMessage(text);
  }

  /**
   * Send a message (process user input and get AI response)
   * @param {string} text - User message text
   */
  async sendMessage(text) {
    if (!text.trim()) return;

    // Add user message
    this.addMessage(text, 'user');
    this.elements.messageInput.value = '';

    // Show typing indicator
    this.showTypingIndicator(true);
    this.isAwaitingResponse = true;

    try {
      // Get AI response
      let aiResponse = '';

      if (this.config.llmClient && typeof this.config.llmClient.send === 'function') {
        aiResponse = await this.config.llmClient.send(text, this.config.portfolioContext);
      } else {
        // Fallback response if no LLM client configured
        aiResponse = this.generateFallbackResponse(text);
      }

      this.showTypingIndicator(false);
      this.addMessage(aiResponse, 'ai');
    } catch (error) {
      this.showTypingIndicator(false);
      this.addMessage(
        '❌ Sorry, I encountered an error processing your message. Please try again.',
        'ai'
      );
      console.error('Chat widget error:', error);
    } finally {
      this.isAwaitingResponse = false;
      this.elements.messageInput.focus();
    }
  }

  /**
   * Add a message to the chat
   * @param {string} text - Message text
   * @param {string} sender - 'user' or 'ai'
   */
  addMessage(text, sender) {
    const message = {
      text,
      sender,
      timestamp: new Date(),
      id: `msg-${Date.now()}`,
    };

    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
  }

  /**
   * Render a single message in the DOM
   * @param {Object} message - Message object with text, sender, timestamp, id
   */
  renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${message.sender}`;
    messageEl.id = message.id;

    const formattedText = this.formatMessageContent(message.text);
    const time = message.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    messageEl.innerHTML = `
      <div class="chat-message-wrapper">
        <div class="chat-message-content">${formattedText}</div>
        <div class="chat-message-time">${time}</div>
      </div>
    `;

    this.elements.messagesContainer.appendChild(messageEl);
  }

  /**
   * Format message content (handle markdown, code blocks)
   * @param {string} text - Raw message text
   * @returns {string} - Formatted HTML
   */
  formatMessageContent(text) {
    let html = text;

    // Escape HTML
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Convert code blocks (```language...code...```)
    html = html.replace(
      /```([^\n]*)\n([\s\S]*?)```/g,
      (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
      }
    );

    // Convert inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert bold (**text**)
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

    // Convert italic (*text*)
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

    // Convert line breaks
    html = html.replace(/\n/g, '<br>');

    // Convert URLs to links
    html = html.replace(
      /(https?:\/\/[^\s<>"\)]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    return html;
  }

  /**
   * Generate fallback response when no LLM client is available
   * @param {string} userInput - User's input text
   * @returns {string} - Fallback response
   */
  generateFallbackResponse(userInput) {
    const responses = [
      "That's an interesting question! In a production setup, I'd connect to an AI service to provide a detailed response.",
      'Thanks for reaching out! To enable AI responses, please configure an LLM client during initialization.',
      'I appreciate your inquiry. You can set up the chat widget with an LLM client like OpenAI or Anthropic for intelligent responses.',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Show or hide typing indicator
   * @param {boolean} show - Whether to show the indicator
   */
  showTypingIndicator(show) {
    this.elements.typingIndicator.style.display = show ? 'flex' : 'none';
    if (show) {
      this.scrollToBottom();
    }
  }

  /**
   * Scroll messages container to bottom
   */
  scrollToBottom() {
    setTimeout(() => {
      this.elements.messagesContainer.scrollTop =
        this.elements.messagesContainer.scrollHeight;
    }, 0);
  }

  /**
   * Toggle widget visibility
   */
  toggleWidget() {
    this.isOpen = !this.isOpen;
    const display = this.isOpen ? 'flex' : 'none';
    this.elements.window.style.display = display;
    this.elements.toggleBtn.style.display = this.isOpen ? 'none' : 'flex';

    if (this.isOpen && !this.isMinimized) {
      this.elements.messageInput.focus();
      this.scrollToBottom();
    }
  }

  /**
   * Toggle minimize state
   */
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const messagesArea = this.elements.messagesContainer.parentElement;
    const inputArea = this.elements.window.querySelector('.chat-widget-input-area');
    const footer = this.elements.window.querySelector('.chat-widget-footer');

    if (this.isMinimized) {
      messagesArea.style.display = 'none';
      inputArea.style.display = 'none';
      footer.style.display = 'none';
      this.elements.minimizeBtn.querySelector('.chat-icon').textContent = '+';
    } else {
      messagesArea.style.display = 'block';
      inputArea.style.display = 'flex';
      footer.style.display = 'flex';
      this.elements.minimizeBtn.querySelector('.chat-icon').textContent = '−';
      this.scrollToBottom();
    }
  }

  /**
   * Clear chat history
   */
  clearChat() {
    if (confirm('Are you sure you want to clear chat history?')) {
      this.messages = [];
      this.elements.messagesContainer.innerHTML = `
        <div class="chat-welcome-message">
          <div class="chat-message-content">
            <p>👋 Hi! I'm here to help. Feel free to ask me anything about the portfolio or services.</p>
          </div>
        </div>
      `;
    }
  }

  /**
   * Inject CSS styles into the page
   */
  injectStyles() {
    if (document.getElementById('chat-widget-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'chat-widget-styles';
    styles.textContent = `
      #chat-widget-container {
        --chat-primary: #6366f1;
        --chat-bg: #ffffff;
        --chat-text: #1f2937;
        --chat-border: #e5e7eb;
        --chat-user-bg: #6366f1;
        --chat-user-text: #ffffff;
        --chat-ai-bg: #f3f4f6;
        --chat-ai-text: #1f2937;
        --chat-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        --chat-transition: all 0.3s ease;
      }

      #chat-widget-container[data-theme="dark"] {
        --chat-bg: #1f2937;
        --chat-text: #f9fafb;
        --chat-border: #374151;
        --chat-ai-bg: #374151;
      }

      /* Container and wrapper */
      #chat-widget-container {
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }

      #chat-widget-container[data-position="bottom-right"] {
        bottom: 20px;
        right: 20px;
      }

      #chat-widget-container[data-position="bottom-left"] {
        bottom: 20px;
        left: 20px;
      }

      #chat-widget-container[data-position="top-right"] {
        top: 20px;
        right: 20px;
      }

      #chat-widget-container[data-position="top-left"] {
        top: 20px;
        left: 20px;
      }

      .chat-widget-wrapper {
        position: relative;
        width: 100%;
      }

      /* Chat window */
      .chat-widget-window {
        display: flex;
        flex-direction: column;
        width: 380px;
        height: 600px;
        background: var(--chat-bg);
        border-radius: 12px;
        box-shadow: var(--chat-shadow);
        border: 1px solid var(--chat-border);
        overflow: hidden;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Header */
      .chat-widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: var(--chat-primary);
        color: white;
        border-bottom: 1px solid var(--chat-border);
      }

      .chat-widget-title {
        font-weight: 600;
        font-size: 14px;
      }

      .chat-widget-controls {
        display: flex;
        gap: 8px;
      }

      /* Messages container */
      .chat-widget-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: var(--chat-bg);
      }

      .chat-widget-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chat-widget-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chat-widget-messages::-webkit-scrollbar-thumb {
        background: var(--chat-border);
        border-radius: 3px;
      }

      .chat-widget-messages::-webkit-scrollbar-thumb:hover {
        background: #d1d5db;
      }

      /* Welcome message */
      .chat-welcome-message {
        display: flex;
        justify-content: flex-start;
        animation: fadeIn 0.5s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Messages */
      .chat-message {
        display: flex;
        margin-bottom: 8px;
        animation: messageSlide 0.3s ease-out;
      }

      @keyframes messageSlide {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chat-message.user {
        justify-content: flex-end;
      }

      .chat-message.ai {
        justify-content: flex-start;
      }

      .chat-message-wrapper {
        max-width: 80%;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .chat-message.user .chat-message-wrapper {
        align-items: flex-end;
      }

      .chat-message.ai .chat-message-wrapper {
        align-items: flex-start;
      }

      .chat-message-content {
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
      }

      .chat-message.user .chat-message-content {
        background: var(--chat-user-bg);
        color: var(--chat-user-text);
        border-bottom-right-radius: 2px;
      }

      .chat-message.ai .chat-message-content {
        background: var(--chat-ai-bg);
        color: var(--chat-ai-text);
        border-bottom-left-radius: 2px;
      }

      .chat-message-content strong {
        font-weight: 600;
      }

      .chat-message-content em {
        font-style: italic;
      }

      .chat-message-content code {
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
      }

      .chat-message-content pre {
        background: rgba(0, 0, 0, 0.15);
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 8px 0;
      }

      .chat-message-content pre code {
        background: transparent;
        padding: 0;
        font-size: 12px;
      }

      .chat-message-content a {
        color: var(--chat-primary);
        text-decoration: underline;
      }

      .chat-message-content a:hover {
        opacity: 0.8;
      }

      .chat-message-time {
        font-size: 11px;
        color: #9ca3af;
        padding: 0 4px;
      }

      /* Typing indicator */
      .chat-typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        align-items: center;
        justify-content: flex-start;
      }

      .typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--chat-primary);
        animation: typing 1.4s infinite;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          opacity: 0.3;
          transform: translateY(0);
        }
        30% {
          opacity: 1;
          transform: translateY(-10px);
        }
      }

      /* Input area */
      .chat-widget-input-area {
        display: flex;
        gap: 8px;
        padding: 12px;
        border-top: 1px solid var(--chat-border);
        background: var(--chat-bg);
      }

      .chat-widget-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--chat-border);
        border-radius: 6px;
        font-size: 14px;
        color: var(--chat-text);
        background: var(--chat-bg);
        font-family: inherit;
        outline: none;
        transition: var(--chat-transition);
      }

      .chat-widget-input:focus {
        border-color: var(--chat-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .chat-widget-input::placeholder {
        color: #9ca3af;
      }

      /* Buttons */
      .chat-widget-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 12px;
        background: transparent;
        border: 1px solid var(--chat-border);
        border-radius: 6px;
        cursor: pointer;
        color: var(--chat-text);
        font-size: 14px;
        transition: var(--chat-transition);
        font-weight: 500;
      }

      .chat-widget-btn:hover {
        background: var(--chat-border);
        transform: translateY(-1px);
      }

      .chat-widget-btn:active {
        transform: translateY(0);
      }

      .chat-send-btn {
        background: var(--chat-primary);
        color: white;
        border-color: var(--chat-primary);
        padding: 10px;
      }

      .chat-send-btn:hover {
        background: #4f46e5;
        border-color: #4f46e5;
      }

      .chat-close-btn {
        padding: 6px 8px;
      }

      .chat-minimize-btn {
        padding: 6px 8px;
      }

      .chat-clear-btn {
        width: 100%;
        background: transparent;
        border: none;
        padding: 8px;
        color: #6b7280;
        font-size: 12px;
      }

      .chat-clear-btn:hover {
        background: var(--chat-border);
        color: var(--chat-text);
      }

      /* Toggle button */
      .chat-widget-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        background: var(--chat-primary);
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        color: white;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        transition: var(--chat-transition);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        50% {
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.6);
        }
      }

      .chat-widget-toggle:hover {
        background: #4f46e5;
        transform: scale(1.1);
      }

      .chat-widget-toggle:active {
        transform: scale(0.95);
      }

      /* Footer */
      .chat-widget-footer {
        display: flex;
        padding: 8px 12px;
        border-top: 1px solid var(--chat-border);
        background: var(--chat-bg);
      }

      /* Mobile responsive */
      @media (max-width: 480px) {
        .chat-widget-window {
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          max-height: 100vh;
          border-radius: 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        #chat-widget-container[data-position] {
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }

        .chat-widget-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
        }

        .chat-message-wrapper {
          max-width: 90%;
        }

        .chat-widget-input {
          font-size: 16px;
        }
      }

      /* Accessibility */
      .chat-widget-btn:focus,
      .chat-widget-input:focus {
        outline: 2px solid var(--chat-primary);
        outline-offset: 2px;
      }

      /* Dark theme support */
      @media (prefers-color-scheme: dark) {
        #chat-widget-container {
          --chat-bg: #1f2937;
          --chat-text: #f9fafb;
          --chat-border: #374151;
          --chat-ai-bg: #374151;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Export messages for external use
   * @returns {Array} - Array of messages
   */
  getMessages() {
    return [...this.messages];
  }

  /**
   * Update configuration at runtime
   * @param {Object} newConfig - New configuration object
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Destroy the widget and clean up
   */
  destroy() {
    const container = document.getElementById('chat-widget-container');
    if (container) {
      container.remove();
    }
    this.messages = [];
    this.elements = {};
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatWidget;
}

export { ChatWidget };
