import { Index } from '@upstash/vector';

// Lazy initialization of Upstash Vector client to avoid build-time issues
let _vectorIndex: Index | null = null;

function getVectorIndex(): Index {
  if (!_vectorIndex) {
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    
    if (!url || !token) {
      throw new Error('UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN environment variables are required');
    }
    
    _vectorIndex = new Index({ url, token });
  }
  return _vectorIndex;
}

// Export a proxy that calls getVectorIndex() when accessed
export const vectorIndex = new Proxy({} as Index, {
  get(target, prop) {
    const index = getVectorIndex();
    const value = (index as any)[prop];
    return typeof value === 'function' ? value.bind(index) : value;
  }
});

// Enhanced embedding generation for RAG system
export async function generateRAGEmbedding(text: string): Promise<number[]> {
  const dimension = 1536;
  const vector = new Array(dimension).fill(0);
  
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);
  const uniqueWords = new Set(words);
  
  // Feature 1: Word diversity score
  vector[0] = uniqueWords.size / words.length;
  
  // Feature 2-100: Character n-gram features (1-3 character sequences)
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i < normalizedText.length - n; i++) {
      const ngram = normalizedText.slice(i, i + n);
      const hash = ngram.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0);
      const idx = Math.abs(hash) % (dimension - 100) + 100;
      vector[idx] += 1 / (normalizedText.length - n + 1);
    }
  }
  
  // Feature: Word position weighting (earlier words weighted more)
  words.forEach((word, idx) => {
    const positionWeight = 1 - (idx / words.length);
    const hash = word.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const vectorIdx = Math.abs(hash) % dimension;
    vector[vectorIdx] += positionWeight / words.length;
  });
  
  // Feature: Word frequency distribution
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  wordFreq.forEach((freq, word) => {
    const hash = word.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const idx = Math.abs(hash) % dimension;
    vector[idx] += (freq / words.length) * 0.5;
  });
  
  // Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => magnitude > 0 ? val / magnitude : 0);
}

// Simple vector creation function (creates a deterministic vector from text)
// In production, you should use OpenAI embeddings or similar
function createSimpleVector(text: string): number[] {
  const dimension = 1536; // Standard embedding dimension
  const vector = new Array(dimension).fill(0);
  
  // Create a simple hash-based vector
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (charCode * i) % dimension;
    vector[index] += charCode / 1000;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => magnitude > 0 ? val / magnitude : 0);
}

// Data types for vector storage
export interface ResumeItem {
  id: string;
  section: string;
  title: string;
  description: string;
  dateRange: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string;
  githubLink: string;
  demoLink: string | null;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  [key: string]: any;
}

export interface AiMemory {
  id: string;
  topic: string;
  content: string;
  lastInteraction: string;
  [key: string]: any;
}

// Helper functions for vector database operations
export const vectorHelpers = {
  // Resume data operations
  async getResume(): Promise<ResumeItem[]> {
    try {
      // Use range to scan all vectors and filter for resume entries
      const allData = await vectorIndex.range({ cursor: '0', limit: 1000, includeMetadata: true });
      
      if (!allData || !allData.vectors || allData.vectors.length === 0) {
        return [];
      }
      
      const resumeItems = allData.vectors
        .filter(v => v && v.metadata && (v.metadata as any).section)
        .map(v => v!.metadata as ResumeItem)
        .sort((a, b) => a.order - b.order);
      
      return resumeItems;
    } catch (error) {
      console.error('Error fetching resume:', error);
      return [];
    }
  },

  async addResumeItem(item: Omit<ResumeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResumeItem> {
    const newItem = {
      ...item,
      id: `resume-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ResumeItem;

    const text = `${newItem.section} ${newItem.title} ${newItem.description} ${newItem.dateRange}`;
    const vector = createSimpleVector(text);
    
    await vectorIndex.upsert({
      id: newItem.id,
      vector,
      metadata: newItem,
    });

    return newItem;
  },

  async updateResumeItem(id: string, updates: Partial<ResumeItem>): Promise<void> {
    const items = await this.getResume();
    const item = items.find(i => i.id === id);
    
    if (!item) {
      throw new Error(`Resume item ${id} not found`);
    }

    const updatedItem = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const text = `${updatedItem.section} ${updatedItem.title} ${updatedItem.description} ${updatedItem.dateRange}`;
    const vector = createSimpleVector(text);
    
    await vectorIndex.upsert({
      id: updatedItem.id,
      vector,
      metadata: updatedItem,
    });
  },

  async deleteResumeItem(id: string): Promise<void> {
    await vectorIndex.delete(id);
  },

  // Projects data operations
  async getProjects(): Promise<Project[]> {
    try {
      // Use range to scan all vectors and filter for project entries
      const allData = await vectorIndex.range({ cursor: '0', limit: 1000, includeMetadata: true });
      
      if (!allData || !allData.vectors || allData.vectors.length === 0) {
        return [];
      }
      
      const projects = allData.vectors
        .filter(v => v && v.metadata && (v.metadata as any).title && (v.metadata as any).techStack)
        .map(v => v!.metadata as Project)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject = {
      ...project,
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Project;

    const text = `${newProject.title} ${newProject.description} ${newProject.techStack}`;
    const vector = createSimpleVector(text);
    
    await vectorIndex.upsert({
      id: newProject.id,
      vector,
      metadata: newProject,
    });

    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find(p => p.id === id);
    
    if (!project) {
      throw new Error(`Project ${id} not found`);
    }

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const text = `${updatedProject.title} ${updatedProject.description} ${updatedProject.techStack}`;
    const vector = createSimpleVector(text);
    
    await vectorIndex.upsert({
      id: updatedProject.id,
      vector,
      metadata: updatedProject,
    });
  },

  async deleteProject(id: string): Promise<void> {
    await vectorIndex.delete(id);
  },

  // Contact messages
  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const allData = await vectorIndex.range({ cursor: '0', limit: 1000, includeMetadata: true });
      
      if (!allData || !allData.vectors || allData.vectors.length === 0) {
        return [];
      }
      
      const messages = allData.vectors
        .filter(v => v && v.metadata && (v.metadata as any).name && (v.metadata as any).email)
        .map(v => v!.metadata as ContactMessage)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return messages;
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return [];
    }
  },

  async addContactMessage(message: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>): Promise<ContactMessage> {
    const newMessage = {
      ...message,
      id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString(),
    } as ContactMessage;

    const text = `contact message from ${newMessage.name} ${newMessage.email}: ${newMessage.message}`;
    const vector = createSimpleVector(text);
    
    await vectorIndex.upsert({
      id: newMessage.id,
      vector,
      metadata: newMessage,
    });

    return newMessage;
  },

  // AI Memory operations
  async getAiMemory(sessionId: string): Promise<AiMemory[]> {
    try {
      const allData = await vectorIndex.range({ cursor: '0', limit: 1000, includeMetadata: true });
      
      if (!allData || !allData.vectors || allData.vectors.length === 0) {
        return [];
      }
      
      const memories = allData.vectors
        .filter(v => v && v.metadata && (v.metadata as any).topic && (v.metadata as any).id?.includes(sessionId))
        .map(v => v!.metadata as AiMemory)
        .sort((a, b) => new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime());
      
      return memories;
    } catch (error) {
      console.error('Error fetching AI memory:', error);
      return [];
    }
  },

  async addAiMemory(sessionId: string, memory: { topic: string; content: string }): Promise<AiMemory> {
    const newMemory: AiMemory = {
      id: `memory-${sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      topic: memory.topic,
      content: memory.content,
      lastInteraction: new Date().toISOString(),
    };

    const text = `ai memory session ${sessionId} topic ${newMemory.topic}: ${newMemory.content}`;
    const vector = createSimpleVector(text);
    
    await vectorIndex.upsert({
      id: newMemory.id,
      vector,
      metadata: newMemory,
    });

    return newMemory;
  },

  // Chat messages operations
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const allData = await vectorIndex.range({ cursor: '0', limit: 1000, includeMetadata: true });
      
      if (!allData || !allData.vectors || allData.vectors.length === 0) {
        return [];
      }
      
      const messages = allData.vectors
        .filter(v => v && v.metadata && (v.metadata as any).role && (v.metadata as any).id?.includes(sessionId))
        .map(v => v!.metadata as ChatMessage)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      return messages;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  },

  async addChatMessage(sessionId: string, message: { role: 'user' | 'assistant'; content: string }): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: `chat-${sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
    };

    const text = `chat session ${sessionId} ${newMessage.role}: ${newMessage.content}`;
    const vector = createSimpleVector(text);
    
    await vectorIndex.upsert({
      id: newMessage.id,
      vector,
      metadata: newMessage,
    });

    return newMessage;
  },

  async clearChatMessages(sessionId: string): Promise<void> {
    const messages = await this.getChatMessages(sessionId);
    const deletePromises = messages.map(m => this.deleteChatMessage(m.id));
    await Promise.all(deletePromises);
  },

  async deleteChatMessage(id: string): Promise<void> {
    await vectorIndex.delete(id);
  },

  // Semantic search across all data
  async semanticSearch(query: string, topK: number = 10) {
    try {
      // Since our vector index doesn't have an embedding model configured,
      // we'll fetch all data and do keyword-based matching in memory
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      
      // Fetch all data types
      const [resume, projects] = await Promise.all([
        this.getResume(),
        this.getProjects(),
      ]);
      
      // Add type marker to metadata
      const allItems = [
        ...resume.map(item => ({
          id: item.id,
          metadata: { ...item, type: 'resume' as const },
          text: `${item.section} ${item.title} ${item.description} ${item.dateRange}`.toLowerCase(),
        })),
        ...projects.map(item => ({
          id: item.id,
          metadata: { ...item, type: 'project' as const },
          text: `${item.title} ${item.description} ${item.techStack}`.toLowerCase(),
        })),
      ];
      
      // Score each item based on keyword matches
      const scoredItems = allItems.map(item => {
        let score = 0;
        
        // Check for exact query match (highest score)
        if (item.text.includes(queryLower)) {
          score += 10;
        }
        
        // Check for individual word matches
        queryWords.forEach(word => {
          if (item.text.includes(word)) {
            score += 2;
          }
        });
        
        // Boost score for section matches in resume items
        if (item.metadata.type === 'resume') {
          const section = (item.metadata as any).section?.toLowerCase();
          if (queryLower.includes(section)) {
            score += 5;
          }
        }
        
        // Normalize score to 0-1 range
        const normalizedScore = Math.min(score / 20, 1);
        
        return {
          id: item.id,
          score: normalizedScore,
          metadata: item.metadata,
        };
      });
      
      // Filter items with score > 0 and sort by score
      const results = scoredItems
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
      
      // If no results found, return all items with lower scores for broader context
      if (results.length === 0) {
        console.log('No direct matches found, returning general context');
        return allItems.map(item => ({
          id: item.id,
          score: 0.1,
          metadata: item.metadata,
        })).slice(0, topK);
      }
      
      return results;
    } catch (error) {
      console.error('Error in semantic search:', error);
      return [];
    }
  },
};
