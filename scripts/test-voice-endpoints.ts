/**
 * Test script to verify all Voice Chat API endpoints
 * Run with: npx tsx scripts/test-voice-endpoints.ts
 */

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing Voice Chat Digital Twin API Endpoints\n');

  // Test 1: RAG Upsert
  console.log('1️⃣ Testing RAG Upsert Endpoint...');
  try {
    const response = await fetch(`${baseUrl}/api/rag/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: [
          {
            id: 'test-doc',
            text: 'This is a test document for the RAG system.',
            metadata: { type: 'test' }
          }
        ],
        source: 'test'
      })
    });
    const data = await response.json();
    console.log(response.ok ? '✅ RAG Upsert: PASSED' : '❌ RAG Upsert: FAILED');
    console.log('Response:', data);
  } catch (error) {
    console.log('❌ RAG Upsert: ERROR', error);
  }

  console.log('\n2️⃣ Testing RAG Search Endpoint...');
  try {
    const response = await fetch(`${baseUrl}/api/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'test document',
        topK: 5
      })
    });
    const data = await response.json();
    console.log(response.ok ? '✅ RAG Search: PASSED' : '❌ RAG Search: FAILED');
    console.log(`Results found: ${data.resultCount || 0}`);
  } catch (error) {
    console.log('❌ RAG Search: ERROR', error);
  }

  console.log('\n3️⃣ Testing Digital Twin Personality Endpoint...');
  try {
    const response = await fetch(`${baseUrl}/api/digital-twin/personality`, {
      method: 'GET',
    });
    const data = await response.json();
    console.log(response.ok ? '✅ Personality GET: PASSED' : '❌ Personality GET: FAILED');
    console.log('Personality loaded:', data.personality?.name || 'Default');
  } catch (error) {
    console.log('❌ Personality GET: ERROR', error);
  }

  console.log('\n4️⃣ Testing LLM Endpoint (without RAG)...');
  try {
    const response = await fetch(`${baseUrl}/api/voice/llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, tell me about yourself',
        sessionId: 'test-session',
        conversationHistory: []
      })
    });
    const data = await response.json();
    console.log(response.ok ? '✅ LLM Endpoint: PASSED' : '❌ LLM Endpoint: FAILED');
    console.log('Response preview:', data.response?.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ LLM Endpoint: ERROR', error);
  }

  console.log('\n✅ Endpoint Testing Complete!\n');
  console.log('📝 Notes:');
  console.log('- STT endpoint requires audio file (test manually in browser)');
  console.log('- Make sure server is running (npm run dev)');
  console.log('- Verify GROQ_API_KEY and UPSTASH credentials in .env.local');
}

testEndpoints()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
