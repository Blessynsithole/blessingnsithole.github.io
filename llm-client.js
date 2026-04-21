/**
 * LLMClient - A unified client wrapper for open-source LLMs
 * Supports: Ollama (local) and Hugging Face Inference API
 */

class LLMClient {
  constructor() {
    this.provider = null;
    this.config = {
      temperature: 0.7,
      maxTokens: 512,
      timeout: 30000,
      model: null,
      apiKey: null,
      baseUrl: null,
      systemPrompt: 'You are a helpful assistant.',
    };
    this.isInitialized = false;
  }

  /**
   * Initialize the LLM client with configuration
   * @param {Object} config - Configuration object
   * @param {string} config.provider - 'ollama' or 'huggingface'
   * @param {string} config.model - Model name (e.g., 'mistral', 'llama2' for Ollama)
   * @param {string} [config.apiKey] - API key for Hugging Face
   * @param {string} [config.baseUrl] - Base URL for Ollama (default: http://localhost:11434)
   * @param {number} [config.temperature] - Temperature for generation (0-1)
   * @param {number} [config.maxTokens] - Maximum tokens in response
   * @param {number} [config.timeout] - Request timeout in milliseconds
   * @returns {Promise<Object>} Status object
   */
  async initialize(config = {}) {
    try {
      if (!config.provider) {
        return this._createError('Provider is required (ollama or huggingface)');
      }

      if (!['ollama', 'huggingface'].includes(config.provider)) {
        return this._createError(
          'Invalid provider. Supported: ollama, huggingface'
        );
      }

      if (!config.model) {
        return this._createError('Model name is required');
      }

      this.provider = config.provider;
      this.config = {
        ...this.config,
        ...config,
        baseUrl:
          config.baseUrl || 'http://localhost:11434',
      };

      // Validate provider-specific config
      if (this.provider === 'huggingface' && !this.config.apiKey) {
        return this._createError(
          'API key is required for Hugging Face provider'
        );
      }

      // Check availability
      const available = await this.isAvailable();
      if (!available) {
        return this._createError(
          `Cannot connect to ${this.provider}. Please check your configuration.`
        );
      }

      this.isInitialized = true;
      return {
        success: true,
        message: `Initialized ${this.provider} with model: ${this.config.model}`,
        provider: this.provider,
        model: this.config.model,
      };
    } catch (error) {
      return this._createError(`Initialization failed: ${error.message}`);
    }
  }

  /**
   * Check if the LLM provider is accessible
   * @returns {Promise<boolean>} True if available
   */
  async isAvailable() {
    try {
      if (this.provider === 'ollama') {
        return await this._checkOllamaAvailability();
      } else if (this.provider === 'huggingface') {
        return await this._checkHuggingFaceAvailability();
      }
      return false;
    } catch (error) {
      console.error('Availability check error:', error);
      return false;
    }
  }

  /**
   * Check Ollama availability
   * @private
   */
  async _checkOllamaAvailability() {
    try {
      const response = await this._fetchWithTimeout(
        `${this.config.baseUrl}/api/tags`,
        {
          method: 'GET',
        },
        5000
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const modelExists = data.models?.some(
        (m) => m.name === this.config.model || m.name === `${this.config.model}:latest`
      );

      return modelExists || data.models?.length > 0;
    } catch (error) {
      console.error('Ollama availability check failed:', error);
      return false;
    }
  }

  /**
   * Check Hugging Face API availability
   * @private
   */
  async _checkHuggingFaceAvailability() {
    try {
      const response = await this._fetchWithTimeout(
        `https://huggingface.co/api/models/${this.config.model}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
        5000
      );

      return response.ok;
    } catch (error) {
      console.error('Hugging Face availability check failed:', error);
      return false;
    }
  }

  /**
   * Send a message and get a response (alias for generateResponse)
   * @param {string} prompt - User message
   * @param {string} [systemPrompt] - Optional custom system prompt
   * @returns {Promise<Object>} Response object
   */
  async sendMessage(prompt, systemPrompt = null) {
    return this.generateResponse(prompt, systemPrompt);
  }

  /**
   * Generate an AI response
   * @param {string} userMessage - The user's message
   * @param {string} [systemPrompt] - Optional custom system prompt
   * @returns {Promise<Object>} Response object with text or error
   */
  async generateResponse(userMessage, systemPrompt = null) {
    if (!this.isInitialized) {
      return this._createError(
        'LLM client not initialized. Call initialize() first.'
      );
    }

    if (!userMessage || userMessage.trim() === '') {
      return this._createError('User message cannot be empty');
    }

    try {
      const finalSystemPrompt = systemPrompt || this.config.systemPrompt;

      if (this.provider === 'ollama') {
        return await this._generateWithOllama(userMessage, finalSystemPrompt);
      } else if (this.provider === 'huggingface') {
        return await this._generateWithHuggingFace(
          userMessage,
          finalSystemPrompt
        );
      }

      return this._createError('Invalid provider');
    } catch (error) {
      return this._createError(`Generation failed: ${error.message}`);
    }
  }

  /**
   * Generate response using Ollama
   * @private
   */
  async _generateWithOllama(userMessage, systemPrompt) {
    try {
      const payload = {
        model: this.config.model,
        prompt: `${systemPrompt}\n\nUser: ${userMessage}`,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      };

      const response = await this._fetchWithTimeout(
        `${this.config.baseUrl}/api/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        this.config.timeout
      );

      if (!response.ok) {
        const errorText = await response.text();
        return this._createError(
          `Ollama error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        text: data.response || '',
        model: this.config.model,
        provider: 'ollama',
        tokens: data.eval_count || 0,
      };
    } catch (error) {
      return this._createError(`Ollama request failed: ${error.message}`);
    }
  }

  /**
   * Generate response using Hugging Face Inference API
   * @private
   */
  async _generateWithHuggingFace(userMessage, systemPrompt) {
    try {
      const payload = {
        inputs: `${systemPrompt}\n\nUser: ${userMessage}`,
        parameters: {
          max_new_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          return_full_text: false,
        },
      };

      const response = await this._fetchWithTimeout(
        `https://api-inference.huggingface.co/models/${this.config.model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        this.config.timeout
      );

      if (!response.ok) {
        const errorText = await response.text();
        return this._createError(
          `Hugging Face error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      // Handle different response formats
      let responseText = '';
      if (Array.isArray(data)) {
        responseText = data[0]?.generated_text || '';
      } else if (data.generated_text) {
        responseText = data.generated_text;
      } else if (data.error) {
        return this._createError(`Hugging Face API error: ${data.error}`);
      }

      return {
        success: true,
        text: responseText,
        model: this.config.model,
        provider: 'huggingface',
      };
    } catch (error) {
      return this._createError(
        `Hugging Face request failed: ${error.message}`
      );
    }
  }

  /**
   * Fetch with timeout
   * @private
   */
  _fetchWithTimeout(url, options = {}, timeout = 30000) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timeout')),
          timeout
        )
      ),
    ]);
  }

  /**
   * Create a standardized error object
   * @private
   */
  _createError(message) {
    return {
      success: false,
      error: message,
      text: null,
    };
  }

  /**
   * Get current configuration (excluding sensitive data)
   * @returns {Object} Safe configuration object
   */
  getConfig() {
    return {
      provider: this.provider,
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      timeout: this.config.timeout,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Update configuration settings
   * @param {Object} updates - Configuration updates
   * @returns {Object} Updated configuration
   */
  updateConfig(updates = {}) {
    if (typeof updates.temperature === 'number') {
      this.config.temperature = Math.min(1, Math.max(0, updates.temperature));
    }
    if (typeof updates.maxTokens === 'number') {
      this.config.maxTokens = Math.max(1, updates.maxTokens);
    }
    if (typeof updates.timeout === 'number') {
      this.config.timeout = Math.max(1000, updates.timeout);
    }
    if (typeof updates.systemPrompt === 'string') {
      this.config.systemPrompt = updates.systemPrompt;
    }

    return this.getConfig();
  }

  /**
   * Reset client to uninitialized state
   */
  reset() {
    this.provider = null;
    this.isInitialized = false;
    this.config = {
      temperature: 0.7,
      maxTokens: 512,
      timeout: 30000,
      model: null,
      apiKey: null,
      baseUrl: null,
      systemPrompt: 'You are a helpful assistant.',
    };
  }
}

// Export for use in modules or as global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LLMClient;
}

export { LLMClient };
