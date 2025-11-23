'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, GraduationCap, Code, Heart, Download, 
  Briefcase, Award, ExternalLink, Github,
  Mail, Phone, MapPin, Send, ChevronDown, Linkedin, Facebook,
  Brain, MessageSquare, Sparkles, Zap, Shield, Mic, MessageCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import ChatBot from '@/components/ChatBot';
import VoiceChatDigitalTwin from '@/components/VoiceChatDigitalTwin';
import ProtectedFeature from '@/components/ProtectedFeature';

interface ResumeItem {
  id: number;
  section: string;
  title: string;
  description: string;
  dateRange: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  techStack: string;
  githubLink?: string;
  demoLink?: string;
  imageUrl?: string;
  featured: boolean;
}

// Simple section wrapper without animations
function Section({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <section
      id={id}
      className="w-full flex items-center justify-center py-20"
    >
      <div className="w-full flex items-center justify-center">
        {children}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [resume, setResume] = useState<ResumeItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProjectsLoaded, setIsProjectsLoaded] = useState(false);
  const [chatMode, setChatMode] = useState<'text' | 'voice'>('text');
  const [sessionId] = useState(`session-${Date.now()}`);

  useEffect(() => {
    fetchResumeData();
    
    // Lazy load projects when user approaches that section
    const timer = setTimeout(() => {
      fetchProjects();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fetchResumeData = async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      if (Array.isArray(data)) setResume(data);
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
        setIsProjectsLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const downloadResume = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(22);
    doc.text('Renante Misador Marzan', 105, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(12);
    doc.text('BSIT-4 | Website Development | Full Stack Development', 105, yPos, { align: 'center' });
    yPos += 15;

    const sections = ['education', 'skills', 'experience', 'certifications'];
    sections.forEach(section => {
      const items = resume.filter(item => item.section.toLowerCase() === section);
      if (items.length > 0) {
        doc.setFontSize(16);
        doc.text(section.charAt(0).toUpperCase() + section.slice(1), 20, yPos);
        yPos += 8;

        items.forEach(item => {
          doc.setFontSize(12);
          doc.text(`${item.title} (${item.dateRange})`, 25, yPos);
          yPos += 6;
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(item.description, 160);
          doc.text(lines, 25, yPos);
          yPos += lines.length * 5 + 5;

          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });
        yPos += 5;
      }
    });

    doc.save('Renante_Marzan_Resume.pdf');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedData = resume.reduce((acc: any, item) => {
    // Capitalize first letter of section for display
    const sectionKey = item.section.charAt(0).toUpperCase() + item.section.slice(1);
    if (!acc[sectionKey]) acc[sectionKey] = [];
    acc[sectionKey].push(item);
    return acc;
  }, {} as Record<string, ResumeItem[]>);

  const getSectionIcon = (section: string) => {
    const lowerSection = section.toLowerCase();
    switch (lowerSection) {
      case 'education': return <GraduationCap size={24} />;
      case 'skills': return <Code size={24} />;
      case 'experience': return <Briefcase size={24} />;
      case 'certifications': return <Award size={24} />;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section id="hero" className="w-full min-h-[85vh] flex items-center justify-center bg-background dark:bg-dark-background relative py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="space-y-8">
            {/* Avatar */}
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-highlight to-secondary dark:from-dark-highlight dark:to-secondary flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
              RM
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-highlight dark:text-dark-highlight tracking-tight">
                Renante Misador Marzan
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                <span className="font-semibold text-gray-800 dark:text-gray-200">BSIT-4 Student</span> at Saint Paul University Philippines<br />
                Specializing in <span className="font-semibold text-highlight dark:text-dark-highlight">Website Development</span> & <span className="font-semibold text-highlight dark:text-dark-highlight">Full Stack Development</span>
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  const element = document.getElementById('digital-twin');
                  if (element) {
                    const yOffset = -80;
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="btn-primary inline-flex items-center space-x-2 px-8 py-3.5 text-base font-medium shadow-lg hover:shadow-xl"
              >
                <span>Meet My Digital Twin</span>
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT ME SECTION */}
      <Section id="about">
        <div className="w-full bg-background dark:bg-dark-background py-4">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="section-title text-center mb-12">About Me</h2>

            {/* Bio Card */}
            <div className="card max-w-4xl mx-auto mb-10">
              <div className="flex items-start space-x-5">
                <User className="text-highlight dark:text-dark-highlight flex-shrink-0 mt-1" size={28} />
                <div className="space-y-4">
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    I am passionate about technology, web design, and AI innovation. My goal is to 
                    create innovative solutions that bridge the gap between cutting-edge technology 
                    and user-friendly experiences.
                  </p>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    With expertise in modern web technologies and a strong foundation in full-stack development,
                    I build responsive, scalable applications that solve real-world problems.
                  </p>
                </div>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="card text-center">
                <GraduationCap className="text-highlight dark:text-dark-highlight mx-auto mb-3" size={40} />
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Education</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  BSIT-4 at Saint Paul University Philippines
                </p>
              </div>

              <div className="card text-center">
                <Code className="text-highlight dark:text-dark-highlight mx-auto mb-3" size={40} />
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Specialization</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Website Development & Full Stack
                </p>
              </div>

              <div className="card text-center">
                <Heart className="text-highlight dark:text-dark-highlight mx-auto mb-3" size={40} />
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Passion</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Technology, Web Design & AI Innovation
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* RESUME SECTION */}
      <Section id="resume">
        <div className="w-full bg-background dark:bg-dark-background py-4">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-10">
              <h2 className="section-title mb-6">Resume</h2>
              <button
                onClick={downloadResume}
                className="btn-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Download size={18} />
                <span>Download PDF</span>
              </button>
            </div>

            <div className="space-y-5 mb-8">
              {Object.keys(groupedData).map((section) => (
                <div key={section}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-highlight dark:text-dark-highlight">
                      {getSectionIcon(section)}
                    </div>
                    <h3 className="text-2xl font-bold text-highlight dark:text-dark-highlight">
                      {section}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {groupedData[section].map((item: ResumeItem) => (
                      <div key={item.id} className="card">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {item.title}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                            {item.dateRange}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* PROJECTS SECTION */}
      <Section id="projects">
        <div className="w-full bg-background dark:bg-dark-background py-4">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="section-title text-center mb-12">Projects</h2>

            {selectedProject ? (
              <div className="card max-w-2xl mx-auto">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="mb-4 text-gray-600 dark:text-gray-400 hover:text-highlight"
                >
                  ← Back to projects
                </button>
                <h3 className="text-2xl font-bold text-center text-highlight dark:text-dark-highlight mb-4">
                  {selectedProject.title}
                </h3>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  {selectedProject.description}
                </p>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedProject.techStack.split(',').map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-accent dark:bg-dark-secondary text-sm rounded-full text-gray-700 dark:text-gray-200"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  {selectedProject.githubLink && (
                    <a
                      href={selectedProject.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <Github size={18} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {selectedProject.demoLink && (
                    <a
                      href={selectedProject.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <ExternalLink size={18} />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="card"
                    >
                      <div className="w-full h-28 bg-gradient-to-br from-highlight to-secondary rounded-lg mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                        {project.title.charAt(0)}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm leading-relaxed">
                        {project.description}
                      </p>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack.split(',').slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 bg-accent dark:bg-dark-secondary text-xs rounded-full font-medium text-gray-700 dark:text-gray-300"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex space-x-2">
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-highlight text-white rounded-lg hover:bg-opacity-90 transition-all"
                              title="View on GitHub"
                            >
                              <Github size={16} />
                            </a>
                          )}
                          {project.demoLink && (
                            <a
                              href={project.demoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-highlight text-white rounded-lg hover:bg-opacity-90 transition-all"
                              title="Live Demo"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="p-2 bg-secondary text-gray-800 rounded-lg hover:bg-opacity-90 transition-all"
                            title="View Details"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* DIGITAL TWIN SECTION */}
      <Section id="digital-twin">
        <div className="w-full bg-background dark:bg-dark-background py-16">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-highlight to-secondary dark:from-dark-highlight dark:to-dark-secondary rounded-full shadow-lg">
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="section-title mb-4">Meet My Digital Twin</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Powered by AI, my digital twin can answer questions about my experience, 
                skills, and projects. Choose your preferred way to interact!
              </p>
            </div>

            {/* Mode Selector */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-4 p-2 bg-white dark:bg-dark-accent rounded-2xl shadow-lg">
                <button
                  onClick={() => setChatMode('text')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    chatMode === 'text'
                      ? 'bg-gradient-to-r from-highlight to-secondary dark:from-dark-highlight dark:to-secondary text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-secondary'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Text Chat
                </button>
                <button
                  onClick={() => setChatMode('voice')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    chatMode === 'voice'
                      ? 'bg-gradient-to-r from-highlight to-secondary dark:from-dark-highlight dark:to-secondary text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-secondary'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  Voice Chat
                </button>
              </div>
            </div>

            {/* AI Interface */}
            <div className="max-w-4xl mx-auto mb-12">
              <ProtectedFeature featureName="the AI Digital Twin">
                {chatMode === 'text' ? (
                  <div className="card">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-highlight dark:text-dark-highlight mb-2 flex items-center gap-2">
                        <MessageSquare size={24} />
                        Chat with My Digital Twin
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Ask me anything about my skills, experience, projects, or availability. 
                        I can provide detailed information and help you get to know my work better.
                      </p>
                    </div>
                    <ChatBot 
                      context="Homepage digital twin section. Provide comprehensive information about Renante's professional background, technical skills, projects, and career goals." 
                      inline={true} 
                    />
                  </div>
                ) : (
                  <div>
                    <div className="card mb-6">
                      <h3 className="text-xl font-bold text-highlight dark:text-dark-highlight mb-2 flex items-center gap-2">
                        <Mic size={24} />
                        Voice Chat with My Digital Twin
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Have a natural voice conversation with my AI-powered digital twin. 
                        Just click "Start Voice Chat" and speak naturally - no button pressing needed!
                      </p>
                    </div>
                    <VoiceChatDigitalTwin 
                      sessionId={sessionId}
                      onConversationUpdate={(messages) => {
                        console.log('Conversation updated:', messages);
                      }}
                    />
                  </div>
                )}
              </ProtectedFeature>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card text-center">
                <Sparkles className="w-8 h-8 text-highlight dark:text-dark-highlight mx-auto mb-3" />
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">AI-Powered</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built with Groq AI and RAG technology for accurate responses
                </p>
              </div>
              <div className="card text-center">
                <Zap className="w-8 h-8 text-highlight dark:text-dark-highlight mx-auto mb-3" />
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Real-Time</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get instant responses through text or voice
                </p>
              </div>
              <div className="card text-center">
                <Shield className="w-8 h-8 text-highlight dark:text-dark-highlight mx-auto mb-3" />
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Privacy First</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your conversations are secure and private
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CONTACT SECTION */}
      <Section id="contact">
        <div className="w-full bg-background dark:bg-dark-background py-4">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="section-title text-center mb-12">Get In Touch</h2>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div>
                <div className="card mb-6">
                  <h3 className="text-xl font-bold text-highlight dark:text-dark-highlight mb-6">
                    Contact Information
                  </h3>

                  <div className="space-y-5">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-accent dark:bg-dark-accent">
                        <Mail className="text-highlight dark:text-dark-highlight" size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</p>
                        <a href="mailto:renantemarzan11@gmail.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-highlight dark:hover:text-dark-highlight transition-colors break-all">
                          renantemarzan11@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-accent dark:bg-dark-accent">
                        <Phone className="text-highlight dark:text-dark-highlight" size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</p>
                        <a href="tel:+639662253398" className="text-sm text-gray-600 dark:text-gray-400 hover:text-highlight dark:hover:text-dark-highlight transition-colors">
                          +63 9662253398
                        </a>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Connect With Me</p>
                      <div className="flex items-center space-x-3">
                        <a 
                          href="https://www.linkedin.com/in/renante-marzan-5245b639a/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg bg-accent dark:bg-dark-accent hover:bg-highlight hover:dark:bg-dark-highlight transition-all duration-200 group"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="text-highlight dark:text-dark-highlight group-hover:text-white" size={24} />
                        </a>
                        <a 
                          href="https://www.facebook.com/renante.marzan.12" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg bg-accent dark:bg-dark-accent hover:bg-highlight hover:dark:bg-dark-highlight transition-all duration-200 group"
                          title="Facebook Profile"
                        >
                          <Facebook className="text-highlight dark:text-dark-highlight group-hover:text-white" size={24} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="card">
                <h3 className="text-lg font-semibold text-highlight dark:text-dark-highlight mb-6">
                  Send a Message
                </h3>

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="input-field"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Your message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary inline-flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? <span>Sending...</span> : (
                      <>
                        <Send size={20} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
