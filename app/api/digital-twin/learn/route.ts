import { NextRequest, NextResponse } from 'next/server';
import { vectorIndex } from '@/lib/vector';

interface LearningData {
  sessionId: string;
  userMessage: string;
  assistantResponse: string;
  timestamp: string;
  userTone?: string;
  topicCategory?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LearningData = await request.json();
    const { sessionId, userMessage, assistantResponse, timestamp } = body;

    if (!sessionId || !userMessage || !assistantResponse) {
      return NextResponse.json(
        { error: 'sessionId, userMessage, and assistantResponse are required' },
        { status: 400 }
      );
    }

    // Analyze user's communication style
    const userTone = analyzeUserTone(userMessage);
    const topicCategory = categorizeMessage(userMessage);

    const learningEntry = {
      id: `learning-${sessionId}-${Date.now()}`,
      sessionId,
      userMessage,
      assistantResponse,
      timestamp,
      userTone,
      topicCategory,
      type: 'learning',
    };

    // Create embedding
    const text = `${userMessage} ${assistantResponse}`;
    const dimension = 1536;
    const vector = new Array(dimension).fill(0);
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * i) % dimension;
      vector[index] += charCode / 1000;
    }
    
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalizedVector = vector.map(val => magnitude > 0 ? val / magnitude : 0);

    // Store learning data
    await vectorIndex.upsert({
      id: learningEntry.id,
      vector: normalizedVector,
      metadata: learningEntry,
    });

    // Update personality based on learning (adaptive behavior)
    await updatePersonalityFromLearning(userTone, topicCategory);

    return NextResponse.json({
      success: true,
      message: 'Learning data stored successfully',
      analysis: {
        userTone,
        topicCategory,
      },
    });
  } catch (error) {
    console.error('Error storing learning data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store learning data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Analyze user's communication tone
function analyzeUserTone(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('please') || lowerMessage.includes('thank')) {
    return 'polite';
  }
  if (lowerMessage.includes('!') && message.length < 50) {
    return 'excited';
  }
  if (lowerMessage.includes('?')) {
    return 'inquisitive';
  }
  if (lowerMessage.match(/\b(error|issue|problem|bug)\b/)) {
    return 'concerned';
  }
  if (message.length > 200) {
    return 'detailed';
  }
  
  return 'neutral';
}

// Categorize message topic
function categorizeMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  const categories: Record<string, string[]> = {
    'technical': ['code', 'api', 'function', 'error', 'debug', 'implement'],
    'career': ['job', 'experience', 'skills', 'resume', 'work'],
    'projects': ['project', 'portfolio', 'built', 'created', 'developed'],
    'personal': ['you', 'your', 'about', 'tell me'],
    'help': ['how', 'what', 'why', 'can you', 'help'],
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}

// Update personality traits based on learning
async function updatePersonalityFromLearning(
  userTone: string,
  topicCategory: string
): Promise<void> {
  try {
    // This is a simplified version - in production, you'd want more sophisticated adaptation
    // For now, we'll just log the learning for future personality adjustments
    console.log('Learning update:', { userTone, topicCategory });
  } catch (error) {
    console.error('Error updating personality from learning:', error);
  }
}
