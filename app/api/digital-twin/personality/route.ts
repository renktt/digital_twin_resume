import { NextRequest, NextResponse } from 'next/server';
import { vectorIndex } from '@/lib/vector';

// Default Digital Twin personality configuration
const DEFAULT_PERSONALITY = {
  name: 'Renante',
  tone: 'professional yet approachable',
  style: 'clear, concise, and technically accurate',
  expertise: 'Full-stack development, AI/ML, modern web technologies, cloud architecture',
  approach: 'Helpful, adaptive, and contextually aware',
  traits: {
    enthusiasm: 0.7,
    formality: 0.5,
    technicality: 0.8,
    humor: 0.4,
    empathy: 0.8,
  },
  conversationStyle: {
    greetingStyle: 'warm and welcoming',
    questionHandling: 'thorough with examples',
    errorHandling: 'patient and educational',
    closingStyle: 'encouraging and supportive',
  },
  knowledgeAreas: [
    'Next.js & React',
    'TypeScript & JavaScript',
    'AI & Machine Learning',
    'Cloud & DevOps',
    'Database Design',
    'API Development',
    'UI/UX Design',
  ],
  updatedAt: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    // Retrieve personality from vector database
    const results = await vectorIndex.range({
      cursor: '0',
      limit: 100,
      includeMetadata: true,
    });

    const personalityData = results.vectors?.find(
      (v: any) => v.metadata?.type === 'personality'
    );

    if (personalityData?.metadata) {
      return NextResponse.json({
        success: true,
        personality: personalityData.metadata,
      });
    }

    // Return default if not found
    return NextResponse.json({
      success: true,
      personality: DEFAULT_PERSONALITY,
      isDefault: true,
    });
  } catch (error) {
    console.error('Error fetching personality:', error);
    return NextResponse.json({
      success: true,
      personality: DEFAULT_PERSONALITY,
      isDefault: true,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personality } = body;

    if (!personality || typeof personality !== 'object') {
      return NextResponse.json(
        { error: 'Personality object is required' },
        { status: 400 }
      );
    }

    const updatedPersonality = {
      ...DEFAULT_PERSONALITY,
      ...personality,
      type: 'personality',
      updatedAt: new Date().toISOString(),
    };

    // Create a simple embedding for personality
    const personalityText = JSON.stringify(updatedPersonality);
    const dimension = 1536;
    const vector = new Array(dimension).fill(0);
    
    // Simple hash-based vector
    for (let i = 0; i < personalityText.length; i++) {
      const charCode = personalityText.charCodeAt(i);
      const index = (charCode * i) % dimension;
      vector[index] += charCode / 1000;
    }
    
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalizedVector = vector.map(val => magnitude > 0 ? val / magnitude : 0);

    // Upsert personality to vector database
    await vectorIndex.upsert({
      id: 'digital-twin-personality',
      vector: normalizedVector,
      metadata: updatedPersonality,
    });

    return NextResponse.json({
      success: true,
      message: 'Personality updated successfully',
      personality: updatedPersonality,
    });
  } catch (error) {
    console.error('Error updating personality:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update personality', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
