/**
 * Analytics Module - Anonymous Usage Tracking
 * Tracks user interactions without storing personal data or chat history
 */

class Analytics {
  constructor() {
    this.storageKey = 'portfolio_chat_analytics';
    this.events = [];
    this.loadEvents();
  }

  /**
   * Track an event
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data (optional)
   */
  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      data: data,
    };

    this.events.push(event);
    this.saveEvents();

    // Optional: Send to analytics service (commented out for privacy)
    // this.sendToAnalytics(event);
  }

  /**
   * Track a page view
   * @param {string} page - Page name or URL
   */
  trackPageView(page) {
    this.trackEvent('page_view', {
      page: page,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  }

  /**
   * Track chat message
   * @param {string} messageType - 'user' or 'ai'
   * @param {number} messageLength - Length of message (not content)
   */
  trackChatMessage(messageType, messageLength) {
    this.trackEvent('chat_message', {
      type: messageType,
      length: messageLength,
    });
  }

  /**
   * Get aggregate statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const stats = {
      totalEvents: this.events.length,
      totalMessages: this.events.filter((e) => e.name === 'message_sent').length,
      avgSessionDuration: 0,
      pageViews: this.events.filter((e) => e.name === 'page_view').length,
    };

    const sessionEvents = this.events.filter((e) => e.name === 'message_sent');
    if (sessionEvents.length > 0) {
      const durations = sessionEvents.map((e) => e.data.session_duration || 0);
      stats.avgSessionDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;
    }

    return stats;
  }

  /**
   * Clear all stored analytics
   */
  clearAnalytics() {
    this.events = [];
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Export analytics as JSON
   * @returns {Object} Analytics data
   */
  exportData() {
    return {
      exportDate: new Date().toISOString(),
      statistics: this.getStatistics(),
      events: this.events,
    };
  }

  // Private methods
  saveEvents() {
    try {
      // Keep only last 100 events to avoid storage bloat
      const recentEvents = this.events.slice(-100);
      localStorage.setItem(this.storageKey, JSON.stringify(recentEvents));
    } catch (e) {
      console.warn('Failed to save analytics:', e);
    }
  }

  loadEvents() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.events = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load analytics:', e);
      this.events = [];
    }
  }

  /**
   * Optional: Send events to analytics service
   * (Commented out to maintain privacy - users can enable if desired)
   */
  async sendToAnalytics(event) {
    // Example: Send to a privacy-respecting analytics service
    // Requires user opt-in
    /*
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (e) {
      console.warn('Failed to send analytics:', e);
    }
    */
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Track page view on load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    analytics.trackPageView(pageName);
  });
}
