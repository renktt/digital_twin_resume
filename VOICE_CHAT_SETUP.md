# 🔊 Voice Chat Digital Twin RAG System - Setup Guide

Complete setup instructions for the Voice Chat Digital Twin with RAG capabilities using Next.js, Groq API, and Upstash Vector.

## 📋 Prerequisites

- Node.js 18+ installed
- Groq API account and API key
- Upstash Vector database configured
- Modern web browser with microphone support

## 🔑 Environment Variables

Create or update your `.env.local` file with the following:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Upstash Vector Configuration
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token

# NextAuth Configuration (if not already set)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (if not already set)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 🔐 Getting Your API Keys

#### Groq API Key
1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into `.env.local`

#### Upstash Vector
1. Visit [https://console.upstash.com](https://console.upstash.com)
2. Create a new Vector Index
3. Choose dimension: **1536** (to match our embedding size)
4. Copy REST URL and REST TOKEN
5. Paste into `.env.local`

## 📦 Installation

Install required dependencies:

```bash
npm install groq-sdk @upstash/vector
```

All other dependencies should already be installed from your existing project.

## 🗂️ Project Structure

The voice chat system includes these new files:

```
app/
├── api/
│   ├── rag/
│   │   ├── upsert/route.ts      # Document ingestion endpoint
│   │   └── search/route.ts       # Semantic search endpoint
│   ├── voice/
│   │   ├── stt/route.ts         # Speech-to-text (Groq Whisper)
│   │   └── llm/route.ts         # LLM with RAG integration
│   └── digital-twin/
│       ├── personality/route.ts  # Personality management
│       └── learn/route.ts        # Adaptive learning system
└── voice-chat/
    └── page.tsx                  # Voice chat page

components/
└── VoiceChatDigitalTwin.tsx     # Main voice chat component

lib/
├── audioRecorder.ts             # Audio recording utility
├── textToSpeech.ts              # TTS utility
└── vector.ts                    # Enhanced with RAG embedding
```

## 🚀 Running the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access voice chat**:
   - Open browser to `http://localhost:3000/voice-chat`
   - Allow microphone permissions when prompted

## 🎯 How to Use

### Starting Voice Chat

1. Navigate to `/voice-chat`
2. Click **"Start Voice Chat"** button
3. Allow microphone access when prompted
4. The system enters **listening mode** (green indicator)

### Having a Conversation

1. **Speak naturally** - just talk as you would to a person
2. The system **continuously listens** to your speech
3. When you **pause** for 2 seconds, it automatically:
   - Transcribes your speech using Groq Whisper
   - Searches relevant context from RAG database
   - Generates a response using Groq LLM
   - Speaks the response back to you
4. **Automatically returns to listening** after responding

### Stop Commands

Say any of these to end the session:
- "stop"
- "exit"
- "quit"
- "end"
- "goodbye"

Or click the **Stop** button.

### Controls

- **🎤 Start/Stop**: Toggle voice chat on/off
- **🔊 Mute/Unmute**: Disable/enable text-to-speech
- **⚙️ Settings**: Adjust sensitivity and speech rate

## 📚 Ingesting Documents for RAG

Use the RAG upsert API to add your knowledge base:

```javascript
// Example: Ingest resume data
const response = await fetch('/api/rag/upsert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documents: [
      {
        id: 'resume-experience',
        text: `Senior Full-Stack Developer at TechCorp from 2020-2023. 
               Built scalable microservices using Node.js and React. 
               Led team of 5 developers on cloud migration project.`,
        metadata: {
          type: 'experience',
          category: 'work',
        }
      },
      {
        id: 'resume-skills',
        text: `Expert in: React, Next.js, TypeScript, Node.js, 
               Python, AWS, Docker, Kubernetes, PostgreSQL, MongoDB`,
        metadata: {
          type: 'skills',
          category: 'technical',
        }
      }
    ],
    source: 'resume'
  })
});
```

### Bulk Import Script

Create `scripts/ingest-data.ts`:

```typescript
async function ingestResumeData() {
  const documents = [
    // Add all your resume data, projects, etc.
  ];

  const response = await fetch('http://localhost:3000/api/rag/upsert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents, source: 'resume' }),
  });

  const result = await response.json();
  console.log('Ingestion complete:', result);
}

ingestResumeData();
```

Run with: `npx tsx scripts/ingest-data.ts`

## ⚙️ Configuration Options

### Silence Detection

Adjust in Settings panel or component props:

- **Silence Threshold**: 10-50 (lower = more sensitive)
- **Silence Duration**: 1000-5000ms (time before processing)

### Speech Settings

- **Speech Rate**: 0.5-2.0 (speed of TTS)
- **TTS Enable/Disable**: Toggle voice responses

### Personality Customization

Update via API:

```javascript
await fetch('/api/digital-twin/personality', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    personality: {
      name: 'Your Name',
      tone: 'professional and friendly',
      style: 'conversational',
      expertise: 'AI, Web Development, Cloud',
    }
  })
});
```

## 🧬 Digital Twin Features

### Adaptive Learning

The system automatically:
- Analyzes user communication style
- Categorizes conversation topics
- Adapts responses based on user preferences
- Stores interaction patterns for personalization

### RAG Integration

Every conversation turn:
1. User speech → Groq Whisper (transcription)
2. Query → Upstash Vector (semantic search)
3. Context + Query → Groq LLM (response generation)
4. Response → Browser TTS (speech synthesis)

### Conversation Memory

- Maintains last 10 messages in context
- Session-based conversation history
- Learns from each interaction

## 🐛 Troubleshooting

### Microphone Not Working

1. Check browser permissions:
   - Chrome: `chrome://settings/content/microphone`
   - Firefox: `about:preferences#privacy`
2. Ensure HTTPS or localhost (required for microphone)
3. Try different browser

### No Voice Output

1. Check system volume
2. Toggle mute/unmute button
3. Enable TTS in settings
4. Check browser console for errors

### Poor Transcription

1. Increase silence threshold
2. Speak closer to microphone
3. Reduce background noise
4. Check microphone quality

### RAG Not Finding Context

1. Verify documents are ingested:
   ```bash
   curl http://localhost:3000/api/rag/search \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"query":"test","topK":5}'
   ```
2. Check Upstash Vector dashboard
3. Verify embeddings are generated correctly

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `GROQ_API_KEY`
   - `UPSTASH_VECTOR_REST_URL`
   - `UPSTASH_VECTOR_REST_TOKEN`
4. Deploy

**Important**: Update `NEXTAUTH_URL` to your production URL

### Production Considerations

1. **HTTPS Required**: Microphone API requires secure context
2. **CORS**: Configure if frontend and backend are separate
3. **Rate Limiting**: Add rate limits to API endpoints
4. **Monitoring**: Set up error tracking (Sentry, etc.)
5. **Costs**: Monitor Groq API usage and Upstash storage

## 📊 API Endpoints Reference

### RAG System

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/rag/upsert` | POST | Ingest documents with embeddings |
| `/api/rag/search` | POST | Semantic similarity search |

### Voice System

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/voice/stt` | POST | Speech-to-text (Groq Whisper) |
| `/api/voice/llm` | POST | LLM response with RAG context |

### Digital Twin

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/digital-twin/personality` | GET/POST | Manage AI personality |
| `/api/digital-twin/learn` | POST | Store learning data |

## 🎨 Customization

### Styling

The component uses Tailwind CSS with your existing design system:
- `highlight` / `dark-highlight` for primary colors
- `secondary` for accent colors
- `dark-accent` / `dark-background` for dark mode

### Component Integration

Add voice chat to any page:

```tsx
import VoiceChatDigitalTwin from '@/components/VoiceChatDigitalTwin';

export default function MyPage() {
  return (
    <VoiceChatDigitalTwin 
      sessionId="custom-session-id"
      onConversationUpdate={(messages) => {
        // Handle conversation updates
      }}
    />
  );
}
```

## 🔄 Update Existing Data

To re-ingest or update documents:

```bash
# Clear old data (optional)
# Use Upstash Vector dashboard to reset index

# Ingest new data
npm run ingest-data
```

## 📈 Performance Optimization

1. **Chunk Size**: Adjust in `/api/rag/upsert/route.ts` (default: 500 words)
2. **TopK Results**: Modify in search queries (default: 5)
3. **Deduplication**: Threshold in `/api/rag/search/route.ts` (default: 0.9)
4. **Model Selection**: Change Groq model in `/api/voice/llm/route.ts`

## 🎓 Best Practices

1. **Test Locally First**: Always test voice chat locally before deploying
2. **Monitor Usage**: Track Groq API calls and Upstash storage
3. **Backup Data**: Export important conversations regularly
4. **Security**: Never expose API keys in client-side code
5. **User Privacy**: Inform users about data collection

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test API endpoints individually
4. Review Groq API status and quotas

## 🎉 You're Ready!

Your Voice Chat Digital Twin RAG system is now set up and ready to use! Navigate to `/voice-chat` and start talking with your AI-powered digital twin.

---

Built with ❤️ using Next.js, Groq API, and Upstash Vector
