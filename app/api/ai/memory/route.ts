import { vectorHelpers } from '@/lib/vector';
import { NextResponse } from 'next/server';

// GET - Retrieve conversation history for a session
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get recent chat messages
    const allMessages = await vectorHelpers.getChatMessages(sessionId);
    const messages = allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .reverse(); // Oldest first for display

    // Get AI memory context
    const allMemory = await vectorHelpers.getAiMemory(sessionId);
    const memory = allMemory
      .sort((a, b) => new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime())
      .slice(0, 5);

    return NextResponse.json({
      messages,
      memory,
    });
  } catch (error) {
    console.error('Error fetching memory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory' },
      { status: 500 }
    );
  }
}

// POST - Store new interaction in memory
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      sessionId,
      conversationType,
      message,
      response,
      context,
      role,
      content
    } = body;

    // Store in AI memory for context tracking
    if (message && response) {
      await vectorHelpers.addAiMemory(sessionId, {
        topic: conversationType || 'general',
        content: `User: ${message}\nAssistant: ${response}${context ? '\nContext: ' + JSON.stringify(context) : ''}`,
      });
    }

    // Store in chat messages for conversation history
    if (role && content) {
      await vectorHelpers.addChatMessage(sessionId, {
        role,
        content,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing memory:', error);
    return NextResponse.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    );
  }
}

// DELETE - Clear session memory (optional, for privacy)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await vectorHelpers.clearChatMessages(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting memory:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    );
  }
}
