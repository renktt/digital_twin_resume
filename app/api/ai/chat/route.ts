import { NextResponse } from 'next/server';
import { RENANTE_PROFILE } from '@/lib/digital-twin-personality';
import { vectorHelpers } from '@/lib/vector';
import { generateRAGResponse, storeConversationForRAG, retrieveRelevantContext } from '@/lib/rag-system';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// RAG-powered response generator with semantic search
async function generateContextualResponse(message: string, context?: string, conversationHistory?: any[], sessionId?: string): Promise<{ response: string; sources: any[]; retrievalInfo: string }> {
  try {
    // Use RAG system for intelligent retrieval and generation
    const ragResponse = await generateRAGResponse(
      message,
      sessionId || 'default',
      {
        includeConversationHistory: true,
        maxTokens: 800,
        temperature: 0.7,
      }
    );
    
    return {
      response: ragResponse.answer,
      sources: ragResponse.sources,
      retrievalInfo: ragResponse.context,
    };
  } catch (error) {
    console.error('RAG system error:', error);
    
    // Fallback to basic response if RAG fails
    return {
      response: `I apologize, but I'm having trouble accessing my knowledge base at the moment. I'm ${RENANTE_PROFILE.name}'s Digital Twin, and I'd be happy to answer questions about skills, projects, experience, or how to get in touch. Please try asking again.`,
      sources: [],
      retrievalInfo: 'Error in retrieval',
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context, sessionId, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate RAG-powered response with semantic search
    const currentSessionId = sessionId || 'default';
    const ragResult = await generateContextualResponse(message, context, conversationHistory, currentSessionId);

    // Store conversation in Vector memory for future RAG retrieval
    try {
      const retrievalContext = await retrieveRelevantContext(message, currentSessionId);
      await storeConversationForRAG(
        currentSessionId,
        message,
        ragResult.response,
        retrievalContext
      );
    } catch (memoryError) {
      console.log('Memory storage error:', memoryError);
    }

    return NextResponse.json({
      response: ragResult.response,
      sources: ragResult.sources,
      retrievalInfo: ragResult.retrievalInfo,
      conversationId: currentSessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
