/**
 * Example script to ingest resume and portfolio data into the RAG system
 * Run with: npx tsx scripts/ingest-resume-data.ts
 */

async function ingestData() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const documents = [
    // Personal Information
    {
      id: 'bio-intro',
      text: `Renante Mangubat is a Full-Stack Developer and AI Engineer specializing in building modern web applications with React, Next.js, and AI integration. Based in the Philippines, passionate about creating innovative solutions using cutting-edge technologies.`,
      metadata: {
        type: 'bio',
        category: 'personal',
      }
    },

    // Technical Skills
    {
      id: 'skills-frontend',
      text: `Frontend expertise: React, Next.js 14, TypeScript, JavaScript, Tailwind CSS, Framer Motion, responsive design, modern UI/UX principles, component-based architecture`,
      metadata: {
        type: 'skills',
        category: 'frontend',
      }
    },
    {
      id: 'skills-backend',
      text: `Backend skills: Node.js, Next.js API Routes, RESTful APIs, authentication with NextAuth.js, database design, server-side rendering, API integration`,
      metadata: {
        type: 'skills',
        category: 'backend',
      }
    },
    {
      id: 'skills-ai',
      text: `AI/ML capabilities: RAG systems, vector databases, Groq API integration, OpenAI integration, LangChain, prompt engineering, embedding generation, semantic search`,
      metadata: {
        type: 'skills',
        category: 'ai',
      }
    },
    {
      id: 'skills-database',
      text: `Database technologies: Upstash Vector, PostgreSQL, MongoDB, Redis, Prisma ORM, database optimization, vector similarity search`,
      metadata: {
        type: 'skills',
        category: 'database',
      }
    },
    {
      id: 'skills-tools',
      text: `Development tools: Git, GitHub, VS Code, npm, Vercel deployment, Docker, CI/CD pipelines, testing frameworks`,
      metadata: {
        type: 'skills',
        category: 'tools',
      }
    },

    // Projects
    {
      id: 'project-portfolio',
      text: `AI-Powered Portfolio Website: Built with Next.js 14, featuring an intelligent chatbot using Groq API and RAG system with Upstash Vector. Includes voice chat capabilities, digital twin AI, dark mode, responsive design, and dynamic content management.`,
      metadata: {
        type: 'project',
        category: 'featured',
        tech: 'Next.js, Groq, Upstash Vector, TypeScript',
      }
    },

    // Experience
    {
      id: 'experience-fullstack',
      text: `Full-Stack Development: Extensive experience building scalable web applications using modern frameworks. Proficient in both frontend and backend development, with focus on performance optimization and user experience.`,
      metadata: {
        type: 'experience',
        category: 'professional',
      }
    },
    {
      id: 'experience-ai',
      text: `AI Integration: Specialized in integrating AI capabilities into web applications. Experience with LLMs, vector databases, RAG systems, and conversational AI. Built multiple AI-powered features including chatbots and voice assistants.`,
      metadata: {
        type: 'experience',
        category: 'professional',
      }
    },

    // Expertise Areas
    {
      id: 'expertise-modern-web',
      text: `Modern Web Development: Expert in building production-ready applications with Next.js App Router, Server Components, Server Actions, streaming, and edge computing. Focus on performance, SEO, and developer experience.`,
      metadata: {
        type: 'expertise',
        category: 'technical',
      }
    },
    {
      id: 'expertise-rag',
      text: `RAG Systems: Deep knowledge of Retrieval-Augmented Generation systems. Experience with document chunking, embedding generation, semantic search, context injection, and vector database optimization for AI applications.`,
      metadata: {
        type: 'expertise',
        category: 'technical',
      }
    },
  ];

  try {
    console.log('🚀 Starting data ingestion...');
    console.log(`📊 Ingesting ${documents.length} documents`);

    const response = await fetch(`${baseUrl}/api/rag/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents,
        source: 'resume-portfolio',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Ingestion complete!');
    console.log(`📈 Results:`, result);
    console.log(`✨ Total chunks created: ${result.results?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error ingesting data:', error);
    process.exit(1);
  }
}

// Run the ingestion
ingestData()
  .then(() => {
    console.log('\n🎉 All done! Your RAG system is ready.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
