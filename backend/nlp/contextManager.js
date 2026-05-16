// In-memory Context Manager (For production, consider using Redis)
class ContextManager {
  constructor() {
    this.contexts = new Map();
  }

  getContext(sessionId) {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        state: 'IDLE', // e.g., 'AWAITING_ORDER_CONFIRMATION', 'AWAITING_SIZE'
        data: {}, // Extracted entities or ongoing order data
      });
    }
    return this.contexts.get(sessionId);
  }

  updateContext(sessionId, newContextData) {
    const currentContext = this.getContext(sessionId);
    this.contexts.set(sessionId, {
      ...currentContext,
      ...newContextData,
      data: { ...currentContext.data, ...(newContextData.data || {}) },
    });
  }

  clearContext(sessionId) {
    this.contexts.delete(sessionId);
  }
}

export const contextManager = new ContextManager();
