'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Linkedin, Facebook } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background dark:from-dark-background dark:via-dark-accent dark:to-dark-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">Get In Touch</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-4">
            Let's connect! Send me a message or talk to my digital twin
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card mb-8">
              <h2 className="text-2xl font-bold text-highlight dark:text-dark-highlight mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-accent dark:bg-dark-accent flex-shrink-0">
                    <Mail className="text-highlight dark:text-dark-highlight" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Email</h3>
                    <a href="mailto:renantemarzan11@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-highlight dark:hover:text-dark-highlight transition-colors break-all">
                      renantemarzan11@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-accent dark:bg-dark-accent flex-shrink-0">
                    <Phone className="text-highlight dark:text-dark-highlight" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Phone</h3>
                    <a href="tel:+639662253398" className="text-gray-600 dark:text-gray-400 hover:text-highlight dark:hover:text-dark-highlight transition-colors">
                      +63 9662253398
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Connect With Me</h3>
                  <div className="flex items-center gap-4">
                    <a 
                      href="https://www.linkedin.com/in/renante-marzan-5245b639a/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-accent dark:bg-dark-accent hover:bg-highlight hover:dark:bg-dark-highlight transition-all duration-200 group flex items-center justify-center"
                      title="LinkedIn Profile"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="text-highlight dark:text-dark-highlight group-hover:text-white" size={28} />
                    </a>
                    <a 
                      href="https://www.facebook.com/renante.marzan.12" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-accent dark:bg-dark-accent hover:bg-highlight hover:dark:bg-dark-highlight transition-all duration-200 group flex items-center justify-center"
                      title="Facebook Profile"
                      aria-label="Facebook Profile"
                    >
                      <Facebook className="text-highlight dark:text-dark-highlight group-hover:text-white" size={28} />
                    </a>
                  </div>
                </div>
              </div>
            </div>


          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card">
              <h2 className="text-2xl font-bold text-highlight dark:text-dark-highlight mb-6">
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary inline-flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
