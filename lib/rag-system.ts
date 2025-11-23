/**
 * Digital Twin RAG (Retrieval-Augmented Generation) System
 * 
 * This system combines:
 * - Upstash Vector for semantic search and retrieval
 * - Groq AI for fast, intelligent response generation
 * - Context-aware conversation with memory
 */

import { vectorHelpers } from './vector';
import { generateGroqResponse, GROQ_MODELS } from './groq';
import { RENANTE_PROFILE } from './digital-twin-personality';

interface RAGContext {
  resumeData: any[];
  projectsData: any[];
  relevantMemories: any[];
  conversationHistory: any[];
}

interface RAGResponse {
  answer: string;
  sources: Array<{
    type: 'resume' | 'project' | 'memory';
    title: string;
    content: string;
    relevance: number;
  }>;
  context: string;
}

/**
 * Enhanced RAG retrieval using semantic search
 */
export async function retrieveRelevantContext(query: string, sessionId?: string): Promise<RAGContext> {
  try {
    // Use semantic search to find the most relevant information
    const searchResults = await vectorHelpers.semanticSearch(query, 15);
    
    // Separate results by type
    const resumeData: any[] = [];
    const projectsData: any[] = [];
    const relevantMemories: any[] = [];
    
    for (const result of searchResults) {
      const metadata = result.metadata as any;
      
      if (metadata.type === 'resume') {
        resumeData.push({
          ...metadata,
          relevance: result.score || 0,
        });
      } else if (metadata.type === 'project') {
        projectsData.push({
          ...metadata,
          relevance: result.score || 0,
        });
      } else if (metadata.topic) {
        // This is AI memory
        relevantMemories.push({
          ...metadata,
          relevance: result.score || 0,
        });
      }
    }
    
    // Get conversation history if sessionId provided
    let conversationHistory: any[] = [];
    if (sessionId) {
      const messages = await vectorHelpers.getChatMessages(sessionId);
      conversationHistory = messages.slice(-5); // Last 5 messages for context
    }
    
    return {
      resumeData,
      projectsData,
      relevantMemories,
      conversationHistory,
    };
  } catch (error) {
    console.error('Error retrieving context:', error);
    return {
      resumeData: [],
      projectsData: [],
      relevantMemories: [],
      conversationHistory: [],
    };
  }
}

/**
 * Build context-rich system prompt for RAG
 */
function buildRAGSystemPrompt(context: RAGContext): string {
  const { resumeData, projectsData, relevantMemories } = context;
  
  let prompt = `You are ${RENANTE_PROFILE.name}'s AI Digital Twin - an advanced RAG-powered assistant.

ABOUT ME:
- ${RENANTE_PROFILE.title}
- Specialization: ${RENANTE_PROFILE.specialization}
- Email: ${RENANTE_PROFILE.email}
- Phone: ${RENANTE_PROFILE.phone}
- LinkedIn: ${RENANTE_PROFILE.linkedin}
- Passionate about: ${RENANTE_PROFILE.interests.join(', ')}
- Currently: ${RENANTE_PROFILE.currentFocus.join(', ')}

TECHNICAL SKILLS:
- Frontend: ${RENANTE_PROFILE.skills.frontend.join(', ')}
- Backend: ${RENANTE_PROFILE.skills.backend.join(', ')}
- Database: ${RENANTE_PROFILE.skills.database.join(', ')}
- AI/ML: ${RENANTE_PROFILE.skills.ai.join(', ')}
- Tools: ${RENANTE_PROFILE.skills.tools.join(', ')}

IMPORTANT INSTRUCTIONS:
- Answer questions using BOTH the retrieved context below AND the general information above
- Be conversational, friendly, and professional
- Cite specific projects or experiences when relevant
- Speak in first person as ${RENANTE_PROFILE.name}
- Keep responses concise but informative (2-4 paragraphs)
- If asked about contact info, provide the email and phone above

`;

  // Add relevant resume data
  if (resumeData.length > 0) {
    prompt += `\n=== RELEVANT BACKGROUND & SKILLS ===\n`;
    resumeData.forEach((item, idx) => {
      prompt += `\n[${idx + 1}] ${item.section.toUpperCase()} - ${item.title}`;
      prompt += `\n   ${item.description}`;
      if (item.dateRange) prompt += `\n   Period: ${item.dateRange}`;
      prompt += `\n   Relevance: ${(item.relevance * 100).toFixed(1)}%\n`;
    });
  }
  
  // Add relevant projects
  if (projectsData.length > 0) {
    prompt += `\n=== RELEVANT PROJECTS ===\n`;
    projectsData.forEach((project, idx) => {
      prompt += `\n[${idx + 1}] ${project.title}`;
      prompt += `\n   Description: ${project.description}`;
      prompt += `\n   Tech Stack: ${project.techStack}`;
      if (project.featured) prompt += `\n   ⭐ Featured Project`;
      prompt += `\n   Relevance: ${(project.relevance * 100).toFixed(1)}%\n`;
    });
  }
  
  // Add relevant past conversations
  if (relevantMemories.length > 0) {
    prompt += `\n=== RELEVANT PAST DISCUSSIONS ===\n`;
    relevantMemories.slice(0, 3).forEach((memory, idx) => {
      prompt += `\n[${idx + 1}] Topic: ${memory.topic}`;
      prompt += `\n   ${memory.content.substring(0, 200)}...`;
      prompt += `\n   Relevance: ${(memory.relevance * 100).toFixed(1)}%\n`;
    });
  }
  
  prompt += `\n=== RESPONSE GUIDELINES ===
- Use the retrieved context above to provide accurate, specific answers
- Reference specific projects, skills, or experiences when relevant
- If asked about something not in the context, politely say so
- Be enthusiastic about the projects and skills mentioned
- Maintain a professional yet friendly tone
- Keep responses concise but informative (2-4 paragraphs max)
`;
  
  return prompt;
}

/**
 * Generate RAG-powered response with source attribution
 */
export async function generateRAGResponse(
  query: string,
  sessionId?: string,
  options?: {
    includeConversationHistory?: boolean;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<RAGResponse> {
  try {
    // Step 1: Retrieve relevant context using semantic search
    const context = await retrieveRelevantContext(query, sessionId);
    
    // Step 2: Build enhanced system prompt with retrieved context
    const systemPrompt = buildRAGSystemPrompt(context);
    
    // Step 3: Build conversation messages
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add conversation history if available
    if (options?.includeConversationHistory && context.conversationHistory.length > 0) {
      context.conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }
    
    // Add current user query
    messages.push({
      role: 'user',
      content: query,
    });
    
    // Step 4: Generate response with Groq AI
    const answer = await generateGroqResponse({
      messages,
      model: GROQ_MODELS.LLAMA_3_70B,
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens || 800,
    });
    
    // Step 5: Build source attribution
    const sources = [
      ...context.resumeData.map(item => ({
        type: 'resume' as const,
        title: `${item.section}: ${item.title}`,
        content: item.description,
        relevance: item.relevance,
      })),
      ...context.projectsData.map(project => ({
        type: 'project' as const,
        title: project.title,
        content: project.description,
        relevance: project.relevance,
      })),
    ].sort((a, b) => b.relevance - a.relevance).slice(0, 5);
    
    return {
      answer,
      sources,
      context: `Retrieved ${context.resumeData.length} resume items, ${context.projectsData.length} projects, ${context.relevantMemories.length} memories`,
    };
  } catch (error) {
    console.error('RAG generation error:', error);
    throw error;
  }
}

/**
 * Voice-optimized RAG response (shorter, more conversational)
 */
export async function generateVoiceRAGResponse(query: string, sessionId?: string): Promise<string> {
  try {
    // Retrieve context
    const context = await retrieveRelevantContext(query, sessionId);
    
    // Build voice-optimized prompt (much shorter)
    let prompt = `You are ${RENANTE_PROFILE.name}, a ${RENANTE_PROFILE.title}. Answer briefly for voice output (2-3 sentences max).\n\n`;
    
    // Add only the most relevant items (top 3)
    if (context.resumeData.length > 0) {
      const top = context.resumeData[0];
      prompt += `Relevant: ${top.title} - ${top.description.substring(0, 150)}...\n`;
    }
    
    if (context.projectsData.length > 0) {
      const top = context.projectsData[0];
      prompt += `Project: ${top.title} - ${top.description.substring(0, 150)}...\n`;
    }
    
    // Generate concise response
    const response = await generateGroqResponse({
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: query },
      ],
      model: GROQ_MODELS.LLAMA_3_8B, // Faster for voice
      temperature: 0.7,
      maxTokens: 150,
    });
    
    // Clean for speech
    return response
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\n\n+/g, '. ')
      .replace(/\n/g, '. ')
      .trim();
  } catch (error) {
    console.error('Voice RAG error:', error);
    return `I'm ${RENANTE_PROFILE.name}. I'd be happy to answer your questions about my skills and projects.`;
  }
}

/**
 * Store conversation in vector database for future RAG retrieval
 */
export async function storeConversationForRAG(
  sessionId: string,
  userMessage: string,
  assistantResponse: string,
  context: RAGContext
): Promise<void> {
  try {
    // Store chat messages
    await vectorHelpers.addChatMessage(sessionId, {
      role: 'user',
      content: userMessage,
    });
    
    await vectorHelpers.addChatMessage(sessionId, {
      role: 'assistant',
      content: assistantResponse,
    });
    
    // Store in AI memory for future RAG retrieval
    const memoryTopic = extractTopicFromQuery(userMessage);
    await vectorHelpers.addAiMemory(sessionId, {
      topic: memoryTopic,
      content: `User asked: ${userMessage}\nI responded: ${assistantResponse}\nContext used: ${context.resumeData.length} resume items, ${context.projectsData.length} projects`,
    });
  } catch (error) {
    console.error('Error storing conversation:', error);
  }
}

/**
 * Extract topic from user query for memory indexing
 */
function extractTopicFromQuery(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('project')) return 'projects';
  if (lowerQuery.includes('skill')) return 'skills';
  if (lowerQuery.includes('experience')) return 'experience';
  if (lowerQuery.includes('education')) return 'education';
  if (lowerQuery.includes('certification')) return 'certifications';
  if (lowerQuery.includes('contact') || lowerQuery.includes('email')) return 'contact';
  if (lowerQuery.includes('work')) return 'work_history';
  if (lowerQuery.includes('technology') || lowerQuery.includes('tech')) return 'technologies';
  
  return 'general';
}

/**
 * Analyze RAG performance and context quality
 */
export async function analyzeRAGQuality(query: string, context: RAGContext): Promise<{
  retrievalQuality: 'excellent' | 'good' | 'fair' | 'poor';
  contextCoverage: number;
  topSources: string[];
  suggestions: string[];
}> {
  const totalRetrieved = context.resumeData.length + context.projectsData.length;
  
  // Calculate quality metrics
  let retrievalQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
  if (totalRetrieved >= 5) retrievalQuality = 'excellent';
  else if (totalRetrieved >= 3) retrievalQuality = 'good';
  else if (totalRetrieved >= 1) retrievalQuality = 'fair';
  
  // Calculate context coverage (how much relevant data we found)
  const avgRelevance = [...context.resumeData, ...context.projectsData]
    .reduce((sum, item) => sum + (item.relevance || 0), 0) / totalRetrieved || 0;
  
  // Get top sources
  const topSources = [
    ...context.resumeData.slice(0, 2).map(r => r.title),
    ...context.projectsData.slice(0, 2).map(p => p.title),
  ];
  
  // Generate suggestions
  const suggestions: string[] = [];
  if (totalRetrieved < 3) {
    suggestions.push('Consider adding more relevant content to your resume/projects');
  }
  if (avgRelevance < 0.5) {
    suggestions.push('Query might be too broad - try being more specific');
  }
  
  return {
    retrievalQuality,
    contextCoverage: avgRelevance * 100,
    topSources,
    suggestions,
  };
}
