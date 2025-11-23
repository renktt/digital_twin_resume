import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper functions for data storage
export const redisHelpers = {
  // Resume data
  async getResume() {
    const data = await redis.get('resume:items');
    return data || [];
  },

  async setResume(items: any[]) {
    await redis.set('resume:items', items);
  },

  async addResumeItem(item: any) {
    const items: any = await this.getResume();
    const newItem = {
      ...item,
      id: items.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    await this.setResume(items);
    return newItem;
  },

  // Projects data
  async getProjects() {
    const data = await redis.get('projects:items');
    return data || [];
  },

  async setProjects(items: any[]) {
    await redis.set('projects:items', items);
  },

  async addProject(item: any) {
    const items: any = await this.getProjects();
    const newItem = {
      ...item,
      id: items.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    await this.setProjects(items);
    return newItem;
  },

  // Contact messages
  async getContactMessages() {
    const data = await redis.get('contact:messages');
    return data || [];
  },

  async addContactMessage(message: any) {
    const messages: any = await this.getContactMessages();
    const newMessage = {
      ...message,
      id: messages.length + 1,
      read: false,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    await redis.set('contact:messages', messages);
    return newMessage;
  },

  // AI Memory
  async getAiMemory(sessionId: string) {
    const data = await redis.get(`ai:memory:${sessionId}`);
    return data || [];
  },

  async addAiMemory(sessionId: string, memory: any) {
    const memories: any = await this.getAiMemory(sessionId);
    const newMemory = {
      ...memory,
      id: memories.length + 1,
      lastInteraction: new Date().toISOString(),
    };
    memories.push(newMemory);
    await redis.set(`ai:memory:${sessionId}`, memories);
    // Set expiry for 7 days
    await redis.expire(`ai:memory:${sessionId}`, 60 * 60 * 24 * 7);
    return newMemory;
  },

  // Chat messages
  async getChatMessages(sessionId: string) {
    const data = await redis.get(`chat:messages:${sessionId}`);
    return data || [];
  },

  async addChatMessage(sessionId: string, message: any) {
    const messages: any = await this.getChatMessages(sessionId);
    const newMessage = {
      ...message,
      id: messages.length + 1,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    await redis.set(`chat:messages:${sessionId}`, messages);
    // Set expiry for 24 hours
    await redis.expire(`chat:messages:${sessionId}`, 60 * 60 * 24);
    return newMessage;
  },

  async clearChatMessages(sessionId: string) {
    await redis.del(`chat:messages:${sessionId}`);
  },
};
