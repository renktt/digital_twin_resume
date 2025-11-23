# Portfolio & Resume System with AI Digital Twin

A comprehensive Next.js application featuring a professional portfolio, resume system, and an AI-powered digital twin with voice and chat capabilities.

## 🎨 Design System

**Color Palette:**
- Background: `#F5F5F0`
- Accent: `#E6D8C3`
- Secondary: `#C2A68C`
- Highlight: `#5D866C`

**Typography:** Poppins

**Features:**
- Smooth animations and transitions
- Fully responsive design (desktop, tablet, mobile)
- Dark mode support
- Accessible UI components

## ✨ Features

### 1. **About Me Page**
- Personal introduction and bio
- AI greeting powered by OpenAI
- Voice interaction capability
- Responsive layout with avatar section

### 2. **Resume Page**
- Dynamic resume data from MySQL
- Timeline/card layout for:
  - Education
  - Skills
  - Experience
  - Certifications
- PDF download functionality
- Voice AI explanations of qualifications

### 3. **Projects Page**
- Grid layout showcasing projects
- Tech stack badges
- GitHub and demo links
- "Ask My Twin" feature for each project
- Interactive voice explanations

### 4. **Contact Page**
- Contact form with validation
- Message storage in MySQL
- "Talk to My Twin" voice feature
- Contact information display
- Real-time form submission

### 5. **AI Digital Twin (Voice & Chat)**
- Powered by OpenAI API
- Natural language voice interaction
- Context-aware responses
- Waveform visualization
- Speech recognition and synthesis
- Personality: Friendly, informative, professional

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom Theme
- **Database:** MySQL
- **ORM:** Prisma
- **AI:** OpenAI API
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **PDF Generation:** jsPDF

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MySQL database instance
- OpenAI API key

### Step 1: Install Dependencies

\`\`\`powershell
npm install
\`\`\`

### Step 2: Setup Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/portfolio_db"

# OpenAI Configuration
OPENAI_API_KEY="your_openai_api_key_here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

**For Production (PlanetScale/Railway):**
\`\`\`env
DATABASE_URL="mysql://user:pass@host:port/dbname?sslaccept=strict"
\`\`\`

### Step 3: Setup Database

\`\`\`powershell
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# (Optional) Open Prisma Studio to manage data
npm run prisma:studio
\`\`\`

### Step 4: Seed Initial Data (Optional)

You can add initial data through Prisma Studio or create a seed script. Example data:

**Resume:**
\`\`\`sql
INSERT INTO resume (section, title, description, date_range, \`order\`) VALUES
('Education', 'BSIT-4 | Saint Paul University Philippines', 'Majoring in Website Development, Currently taking Full Stack Development', '2021 - 2025', 1),
('Skills', 'Web Development', 'HTML, CSS, JavaScript, TypeScript, React, Next.js', 'Current', 1),
('Skills', 'Backend Development', 'Node.js, Express, Prisma, MySQL, PostgreSQL', 'Current', 2),
('Skills', 'Tools & Technologies', 'Git, Docker, Vercel, AWS, AI/ML Integration', 'Current', 3);
\`\`\`

**Projects:**
\`\`\`sql
INSERT INTO projects (title, description, tech_stack, github_link, demo_link, featured) VALUES
('Portfolio Website', 'Personal portfolio with AI digital twin integration', 'Next.js, TypeScript, Tailwind CSS, OpenAI', 'https://github.com/username/portfolio', 'https://example.com', true),
('E-Commerce Platform', 'Full-stack e-commerce solution with payment integration', 'Next.js, Prisma, MySQL, Stripe', 'https://github.com/username/ecommerce', null, true);
\`\`\`

**Courses:**
\`\`\`sql
INSERT INTO courses (title, description, progress, completed, duration, level) VALUES
('Full Stack Web Development', 'Complete web development from frontend to backend', 75, false, '40 hours', 'Intermediate'),
('React Advanced Patterns', 'Advanced React patterns and best practices', 100, true, '20 hours', 'Advanced'),
('Database Design', 'Learn to design efficient database schemas', 50, false, '15 hours', 'Intermediate');
\`\`\`

### Step 5: Run Development Server

\`\`\`powershell
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
portfolio-resume-lms/
├── app/
│   ├── api/
│   │   ├── voice-ai/
│   │   │   └── route.ts          # OpenAI integration
│   │   ├── resume/
│   │   │   └── route.ts          # Resume API
│   │   ├── projects/
│   │   │   └── route.ts          # Projects API
│   │   ├── lms/
│   │   │   ├── courses/route.ts  # Courses API
│   │   │   ├── progress/route.ts # Progress tracking
│   │   │   └── complete/route.ts # Course completion
│   │   └── contact/
│   │       └── route.ts          # Contact form API
│   ├── resume/
│   │   └── page.tsx              # Resume page
│   ├── projects/
│   │   └── page.tsx              # Projects page
│   ├── lms/
│   │   └── page.tsx              # LMS page
│   ├── contact/
│   │   └── page.tsx              # Contact page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # About Me (home) page
├── components/
│   ├── Navigation.tsx            # Navigation bar
│   ├── VoiceAI.tsx              # Voice AI component
│   └── PageTransition.tsx       # Page transitions
├── contexts/
│   └── ThemeContext.tsx         # Dark mode context
├── lib/
│   └── db.ts                    # Prisma client
├── prisma/
│   └── schema.prisma            # Database schema
├── styles/
│   ├── theme.ts                 # Theme constants
│   └── globals.css              # Global styles
├── .env.local.example           # Environment template
├── next.config.js               # Next.js config
├── tailwind.config.js           # Tailwind config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
\`\`\`

## 🎯 Usage Guide

### Voice AI Interaction

The Voice AI digital twin is available on every page:

1. Click the voice button (e.g., "Talk to My Twin")
2. Grant microphone permissions when prompted
3. Speak your question naturally
4. The AI will respond with voice and text

**Voice Commands Examples:**
- "Tell me about your education"
- "What projects have you worked on?"
- "Explain your skills"
- "What courses are you taking?"

### Dark Mode

Toggle dark mode using the moon/sun icon in the navigation bar. Preference is saved to localStorage.

### Adding Content

**Via Prisma Studio:**
\`\`\`powershell
npm run prisma:studio
\`\`\`

**Via API Routes:**
Send POST requests to the respective endpoints with required data.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Options

**PlanetScale (Recommended):**
- Free MySQL database
- Built-in connection pooling
- Easy branching

**Railway:**
- Simple MySQL setup
- Pay-as-you-go pricing

**Connection String Format:**
\`\`\`
mysql://user:password@host:port/database?sslaccept=strict
\`\`\`

### Environment Variables on Vercel

Add these in your Vercel project settings:
- \`DATABASE_URL\`
- \`OPENAI_API_KEY\`
- \`NEXT_PUBLIC_APP_URL\`

## 📊 Database Schema

### Tables

- **resume**: Education, skills, experience, certifications
- **projects**: Portfolio projects with links and tech stacks
- **courses**: LMS courses with progress tracking
- **user_progress**: Individual course progress (multi-user ready)
- **contact_messages**: Contact form submissions
- **quizzes**: Quiz definitions (ready for implementation)
- **quiz_questions**: Quiz questions and answers

## 🎨 Customization

### Colors

Edit `styles/theme.ts`:
\`\`\`typescript
export const colors = {
  background: "#F5F5F0",
  accent: "#E6D8C3",
  secondary: "#C2A68C",
  highlight: "#5D866C",
};
\`\`\`

### AI Personality

Edit `app/api/voice-ai/route.ts` to customize the AI's personality and responses.

### Content

Update personal information in:
- \`app/page.tsx\` (About Me)
- Database tables (via Prisma Studio)

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Validate all user inputs on the server side
- Use HTTPS in production
- Implement rate limiting for API routes (recommended)

## 📝 Available Scripts

\`\`\`powershell
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
\`\`\`

## 🤝 Contributing

Feel free to fork this project and customize it for your own use!

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙋‍♂️ Author

**Renante Misador Marzan**
- BSIT-4 Student
- Saint Paul University Philippines
- Major: Website Development
- Current: Full Stack Development

---

Built with ❤️ using Next.js, MySQL, and OpenAI
