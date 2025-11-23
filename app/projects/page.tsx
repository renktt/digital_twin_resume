'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error('API did not return an array:', data);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background dark:from-dark-background dark:via-dark-accent dark:to-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Projects</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-4">
            Explore my portfolio of web development and full-stack projects
          </p>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-400">Loading projects...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card hover:scale-105 transition-transform duration-300"
              >
                {project.imageUrl && (
                  <div className="w-full h-48 bg-gradient-to-br from-highlight to-secondary dark:from-dark-highlight dark:to-secondary rounded-lg mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {project.title.charAt(0)}
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.split(',').map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-accent dark:bg-dark-secondary text-sm rounded-full text-gray-700 dark:text-gray-200"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-highlight text-white rounded-lg hover:bg-opacity-90 transition-custom"
                      >
                        <Github size={20} />
                      </a>
                    )}
                    {project.demoLink && (
                      <a
                        href={project.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-highlight text-white rounded-lg hover:bg-opacity-90 transition-custom"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-sm btn-secondary"
                  >
                    Ask My Twin
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl mx-auto mb-12"
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="mb-4 text-gray-600 dark:text-gray-400 hover:text-highlight dark:hover:text-dark-highlight"
            >
              ← Back to projects
            </button>
            <h3 className="text-2xl font-bold text-center text-highlight dark:text-dark-highlight mb-4">
              {selectedProject.title}
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {selectedProject.description}
            </p>
            <div className="mb-6">
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
          </motion.div>
        )}


      </div>
    </div>
  );
}
