/**
 * Widget Initializer
 * Initializes the chat widget on all pages (except dedicated chat page)
 */

import { ChatWidget } from './chat-widget.js';
import { LLMClient } from './llm-client.js';
import { portfolioContext } from './portfolio-context.js';
import { analytics } from './analytics.js';

class WidgetInitializer {
  static async initialize() {
    // Don't show widget on chat page itself
    if (window.location.pathname.includes('chat.html')) {
      return;
    }

    // Try to detect LLM availability
    const isAvailable = await this.detectLLMAvailability();
    if (!isAvailable) {
      return; // Don't show widget if no LLM available
    }

    // Initialize LLM client
    const llmClient = new LLMClient();
    const config = await this.getLLMConfig();
    const initResult = await llmClient.initialize(config);

    if (!initResult.success) {
      return; // Silent fail if LLM not available
    }

    // Initialize chat widget
    const widget = new ChatWidget();
    const portfolioContextString = this.buildPortfolioContext();

    widget.initialize({
      llmClient: llmClient,
      portfolioContext: portfolioContextString,
      position: 'bottom-right',
      title: 'Chat with Blessing',
    });

    // Track widget load
    analytics.trackEvent('widget_initialized', { page: window.location.pathname });
  }

  static async detectLLMAvailability() {
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

    const hfKey = localStorage.getItem('hf_api_key');
    if (hfKey) {
      return true;
    }

    return false;
  }

  static async getLLMConfig() {
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

  static buildPortfolioContext() {
    return `About the Portfolio Owner:
    ${portfolioContext.personal?.name}: ${portfolioContext.personal?.description}
    ${portfolioContext.about?.whoIAm}
    
    Skills & Expertise:
    - ${portfolioContext.skills?.development?.join(', ')}
    
    Experience:
    ${portfolioContext.experience?.summary}
    
    Education & Specializations:
    ${portfolioContext.education?.current?.specializations?.join(', ')}
    
    Current Focus: ${portfolioContext.about?.focus}
    
    Contact: GitHub (${portfolioContext.socialLinks?.github}), LinkedIn (${portfolioContext.socialLinks?.linkedin})`;
  }
}

// Initialize widget when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    WidgetInitializer.initialize().catch(console.error);
  });
}
