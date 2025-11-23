'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Briefcase, GraduationCap, Award, Code } from 'lucide-react';
import jsPDF from 'jspdf';

interface ResumeItem {
  id: number;
  section: string;
  title: string;
  description: string;
  dateRange: string;
}

export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setResumeData(data);
      } else {
        console.error('API did not return an array:', data);
        setResumeData([]);
      }
    } catch (error) {
      console.error('Error fetching resume data:', error);
      setResumeData([]);
    } finally {
      setLoading(false);
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

    const sections = ['Education', 'Skills', 'Experience', 'Certifications'];
    sections.forEach(section => {
      const items = resumeData.filter(item => item.section === section);
      if (items.length > 0) {
        doc.setFontSize(16);
        doc.text(section, 20, yPos);
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

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'Education': return <GraduationCap size={24} />;
      case 'Skills': return <Code size={24} />;
      case 'Experience': return <Briefcase size={24} />;
      case 'Certifications': return <Award size={24} />;
      default: return null;
    }
  };

  const groupedData = resumeData.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, ResumeItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background dark:from-dark-background dark:via-dark-accent dark:to-dark-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title mb-6">Resume</h1>
          <button
            onClick={downloadResume}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Download Resume (PDF)</span>
          </button>
        </motion.div>

        {/* Resume Content */}
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-12 mb-12">
            {Object.keys(groupedData).map((section, idx) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="text-highlight dark:text-dark-highlight">
                    {getSectionIcon(section)}
                  </div>
                  <h2 className="text-3xl font-bold text-highlight dark:text-dark-highlight">
                    {section}
                  </h2>
                </div>

                <div className="space-y-4">
                  {groupedData[section].map((item) => (
                    <div key={item.id} className="card">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                          {item.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {item.dateRange}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}


      </div>
    </div>
  );
}
