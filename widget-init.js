/**
 * Widget Initializer — Powered by Google Gemini API
 * Initializes the floating chat widget on all pages (except dedicated chat page)
 *
 * ⚙️  SETUP: Replace the placeholder below with your actual Gemini API key.
 *    Get a free key at: https://aistudio.google.com/apikey
 */

import { ChatWidget } from './chat-widget.js';
import { portfolioContext } from './portfolio-context.js';
import { analytics } from './analytics.js';

// ============================================================
//  🔑  PASTE YOUR GEMINI API KEY HERE
// ============================================================
const GEMINI_API_KEY = 'AQ.Ab8RN6LqNW8ZTAQO8sjFIG8MJGf7J36bp0YQSxQ7GcAe9g9wTQ';
// ============================================================

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function buildLocalWidgetResponse(userInput) {
  const message = (userInput || '').toLowerCase();
  const { personal, about, education, experience, skills, projects, contact } = portfolioContext;

  if (!message) {
    return `Hi! I’m ${personal.name}'s portfolio assistant and I can answer questions about their skills, projects, and contact details.`;
  }

  if (/hello|hi|hey|welcome/.test(message)) {
    return `Hi! I can help with ${personal.name}'s background, skills, projects, and contact details.`;
  }

  if (/about|who is|introduce|background/.test(message)) {
    return `${about.whoIAm} ${about.philosophy}`;
  }

  if (/skill|skills|expertise|technology|stack/.test(message)) {
    const topSkills = skills.development.slice(0, 3).map((skill) => `${skill.name} (${skill.proficiency})`).join(', ');
    return `${personal.name} is strong in ${topSkills}, plus networking, Linux administration, and AI integration.`;
  }

  if (/project|projects|worked on|built/.test(message)) {
    const featured = projects.slice(0, 3).map((project) => `${project.name} (${project.type})`).join(', ');
    return `${personal.name} has worked on projects such as ${featured}.`;
  }

  if (/contact|email|linkedin|github|reach|connect/.test(message)) {
    return `You can reach ${personal.name} at ${contact.email}. Their GitHub is ${contact.github} and LinkedIn is ${contact.linkedin}.`;
  }

  if (/education|study|university|degree/.test(message)) {
    return `${personal.name} is studying ${education.current.degree} at ${education.current.institution}.`;
  }

  return `I can help with ${personal.name}'s background, skills, projects, education, and contact details. Try asking about their current studies, recent projects, or how to connect.`;
}

class WidgetInitializer {
  static async initialize() {
    // Don't show widget on chat page itself
    if (window.location.pathname.includes('chat.html')) {
      return;
    }

    // Prepare conversation history specific to the widget session
    const conversationHistory = [];

    // Create a mock llmClient that complies with what ChatWidget expects (calling a .send() method)
    const llmClient = {
      send: async (text) => {
        // If API key is not configured, return a friendly prompt
        if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
          return "⚠️ The chatbot isn't configured yet — the API key needs to be added. In the meantime, feel free to reach out to Blessing directly at **blessynsithole@gmail.com** or connect on LinkedIn!";
        }

        // Add user message to history
        conversationHistory.push({ role: 'user', parts: [{ text }] });

        try {
          const requestBody = {
            systemInstruction: {
              parts: [{ text: portfolioContext.systemPromptContext }],
            },
            contents: conversationHistory,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          };

          const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `API error ${response.status}`);
          }

          const data = await response.json();
          const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!responseText) {
            throw new Error('Empty response from Gemini');
          }

          // Add AI response to history
          conversationHistory.push({ role: 'model', parts: [{ text: responseText }] });
          return responseText;

        } catch (error) {
          console.error('Widget chat error:', error);
          // Remove last user message from history so retry works cleanly
          conversationHistory.pop();
          return buildLocalWidgetResponse(text);
        }
      }
    };

    // Initialize chat widget
    const widget = new ChatWidget();
    widget.initialize({
      llmClient: llmClient,
      portfolioContext: portfolioContext.systemPromptContext,
      position: 'bottom-right',
      title: 'Chat with Blessing',
    });

    // Track widget load
    analytics.trackEvent('widget_initialized', { page: window.location.pathname });
  }
}

// Initialize widget when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    WidgetInitializer.initialize().catch(console.error);
  });
}
