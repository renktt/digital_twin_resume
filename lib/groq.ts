import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Available Groq models
export const GROQ_MODELS = {
  LLAMA_3_70B: 'llama-3.3-70b-versatile', // Fast, versatile, great for chat (updated from 3.1)
  LLAMA_3_8B: 'llama-3.1-8b-instant', // Ultra fast, instant responses
  MIXTRAL_8X7B: 'mixtral-8x7b-32768', // Large context window
  GEMMA_7B: 'gemma-7b-it', // Google's Gemma model
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateResponseOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Generate AI response using Groq
 */
export async function generateGroqResponse(options: GenerateResponseOptions): Promise<string> {
  const {
    messages,
    model = GROQ_MODELS.LLAMA_3_70B, // Default to 70B for quality
    temperature = 0.7,
    maxTokens = 1024,
    topP = 1,
  } = options;

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: false,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error: any) {
    console.error('Groq API error:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Generate streaming response (for future implementation)
 */
export async function generateGroqStreamingResponse(options: GenerateResponseOptions) {
  const {
    messages,
    model = GROQ_MODELS.LLAMA_3_70B,
    temperature = 0.7,
    maxTokens = 1024,
    topP = 1,
  } = options;

  try {
    const stream = await groq.chat.completions.create({
      messages,
      model,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: true,
    });

    return stream;
  } catch (error: any) {
    console.error('Groq streaming API error:', error);
    throw new Error(`Failed to generate streaming response: ${error.message}`);
  }
}

/**
 * Generate Digital Twin personality response
 */
export async function generateDigitalTwinResponse(
  userMessage: string,
  context: {
    conversationHistory?: ChatMessage[];
    resumeData?: any[];
    projectsData?: any[];
    personalityProfile?: any;
  }
): Promise<string> {
  const { conversationHistory = [], resumeData = [], projectsData = [], personalityProfile } = context;

  // Build context-aware system prompt
  const systemPrompt = buildDigitalTwinSystemPrompt(personalityProfile, resumeData, projectsData);

  // Prepare messages
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-5), // Last 5 messages for context
    { role: 'user', content: userMessage },
  ];

  return generateGroqResponse({
    messages,
    model: GROQ_MODELS.LLAMA_3_70B, // Use 70B for better quality responses
    temperature: 0.8, // Slightly creative for personality
    maxTokens: 1024,
  });
}

/**
 * Build comprehensive system prompt for Digital Twin
 */
function buildDigitalTwinSystemPrompt(
  personalityProfile: any,
  resumeData: any[],
  projectsData: any[]
): string {
  const profile = personalityProfile || {};
  
  let prompt = `You are ${profile.name || 'Renante'}'s AI Digital Twin - an intelligent assistant that represents ${profile.name || 'Renante'} professionally and accurately.

PERSONALITY & ROLE:
- You are a ${profile.title || 'Full-Stack Developer and AI Enthusiast'}
- Specialization: ${profile.specialization || 'Web Development, AI Integration, and Database Systems'}
- Communication style: Professional, friendly, knowledgeable, and enthusiastic about technology
- Always speak in first person as if you ARE ${profile.name || 'Renante'}

CORE INTERESTS:
${profile.interests?.map((interest: string) => `- ${interest}`).join('\n') || '- Web Development\n- AI/ML\n- System Design'}

CURRENT FOCUS:
${profile.currentFocus?.map((focus: string) => `- ${focus}`).join('\n') || '- Building full-stack applications\n- AI integration\n- Modern web technologies'}`;

  // Add skills information
  if (profile.skills) {
    prompt += `\n\nSKILLS & EXPERTISE:`;
    if (profile.skills.frontend?.length > 0) {
      prompt += `\nFrontend: ${profile.skills.frontend.join(', ')}`;
    }
    if (profile.skills.backend?.length > 0) {
      prompt += `\nBackend: ${profile.skills.backend.join(', ')}`;
    }
    if (profile.skills.database?.length > 0) {
      prompt += `\nDatabase: ${profile.skills.database.join(', ')}`;
    }
    if (profile.skills.ai?.length > 0) {
      prompt += `\nAI/ML: ${profile.skills.ai.join(', ')}`;
    }
    if (profile.skills.tools?.length > 0) {
      prompt += `\nTools: ${profile.skills.tools.join(', ')}`;
    }
  }

  // Add resume data
  if (resumeData.length > 0) {
    prompt += `\n\nEDUCATION & EXPERIENCE:`;
    
    const education = resumeData.filter(item => item.section === 'education');
    if (education.length > 0) {
      prompt += `\n\nEducation:`;
      education.forEach(edu => {
        prompt += `\n- ${edu.title} (${edu.dateRange}): ${edu.description}`;
      });
    }

    const experience = resumeData.filter(item => item.section === 'experience');
    if (experience.length > 0) {
      prompt += `\n\nExperience:`;
      experience.forEach(exp => {
        prompt += `\n- ${exp.title} (${exp.dateRange}): ${exp.description}`;
      });
    }

    const skills = resumeData.filter(item => item.section === 'skills');
    if (skills.length > 0) {
      prompt += `\n\nDetailed Skills:`;
      skills.forEach(skill => {
        prompt += `\n- ${skill.title} (${skill.dateRange}): ${skill.description}`;
      });
    }

    const certifications = resumeData.filter(item => item.section === 'certifications');
    if (certifications.length > 0) {
      prompt += `\n\nCertifications:`;
      certifications.forEach(cert => {
        prompt += `\n- ${cert.title} (${cert.dateRange}): ${cert.description}`;
      });
    }
  }

  // Add projects data
  if (projectsData.length > 0) {
    prompt += `\n\nPROJECTS PORTFOLIO (${projectsData.length} projects):`;
    projectsData.slice(0, 5).forEach((project, index) => {
      prompt += `\n\n${index + 1}. ${project.title}`;
      prompt += `\n   Description: ${project.description}`;
      prompt += `\n   Tech Stack: ${project.techStack}`;
      if (project.featured) prompt += `\n   ⭐ Featured Project`;
      if (project.githubLink) prompt += `\n   GitHub: ${project.githubLink}`;
      if (project.demoLink) prompt += `\n   Demo: ${project.demoLink}`;
    });
    if (projectsData.length > 5) {
      prompt += `\n\n...and ${projectsData.length - 5} more projects showcasing various technologies and skills.`;
    }
  }

  prompt += `\n\nRESPONSE GUIDELINES:
- Be conversational and engaging while maintaining professionalism
- Use specific examples from the resume and projects when relevant
- If asked about skills, reference actual projects where you used them
- Keep responses concise but informative (2-4 paragraphs for text, shorter for voice)
- Show enthusiasm about technology and continuous learning
- Direct users to specific portfolio sections when appropriate (Resume page, Projects page, Contact page)
- If you don't have information, be honest and suggest where they can learn more
- Always respond in first person as ${profile.name || 'Renante'}

Remember: You ARE ${profile.name || 'Renante'}'s Digital Twin. Speak naturally and authentically!`;

  return prompt;
}

export { groq };
