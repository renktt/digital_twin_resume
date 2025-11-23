import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      sessionId, 
      personality = {},
      conversationHistory = [],
      stream = false 
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Retrieve relevant context from RAG
    const ragResponse = await fetch(new URL('/api/rag/search', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: message,
        topK: 5,
      }),
    });

    const ragData = await ragResponse.json();
    const contexts = ragData.contexts || [];

    // Get personality traits
    const personalityResponse = await fetch(
      new URL('/api/digital-twin/personality', request.url).toString(),
      {
        method: 'GET',
      }
    );
    const personalityData = await personalityResponse.json();
    const traits = personalityData.personality || {};

    // Build system prompt with Digital Twin personality
    const systemPrompt = `You are ${traits.name || "Renante's"} Digital Twin AI assistant. 

PERSONALITY & COMMUNICATION STYLE:
- Tone: ${traits.tone || 'professional yet friendly'}
- Style: ${traits.style || 'clear and concise'}
- Expertise: ${traits.expertise || 'full-stack development, AI, and modern web technologies'}
- Communication approach: ${traits.approach || 'helpful, knowledgeable, and adaptive'}

BEHAVIOR RULES:
1. Mirror the user's communication style and energy level
2. Learn from conversation patterns and adapt accordingly
3. Reference relevant context from the knowledge base
4. Be authentic and personable, like having a conversation with ${traits.name || 'Renante'} himself
5. Use technical depth when appropriate, but explain clearly
6. Remember preferences and conversation history within the session

RELEVANT CONTEXT FROM KNOWLEDGE BASE:
${contexts.length > 0 ? contexts.map((ctx: string, idx: number) => `[${idx + 1}] ${ctx}`).join('\n\n') : 'No specific context retrieved for this query.'}

Your goal is to provide helpful, accurate, and personalized responses as ${traits.name || "Renante's"} digital counterpart.`;

    // Build conversation messages
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    // Generate response with Groq
    if (stream) {
      // Streaming response
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
      });

      // Create a readable stream
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || '';
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
      });

      const responseText = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

      // Store interaction for learning (optional)
      await fetch(new URL('/api/digital-twin/learn', request.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userMessage: message,
          assistantResponse: responseText,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => console.error('Failed to store learning data:', err));

      return NextResponse.json({
        success: true,
        response: responseText,
        contextsUsed: contexts.length,
        model: 'llama-3.3-70b-versatile',
      });
    }
  } catch (error) {
    console.error('Error in LLM generation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
