'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, User, LogOut, LogIn } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Home', href: '#hero' },
  { name: 'About', href: '#about' },
  { name: 'Resume', href: '#resume' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Intersection Observer for active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: [0.5, 0.75, 1.0], rootMargin: '-80px 0px -20% 0px' }
    );

    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const scrollToSection = (href: string, external?: boolean) => {
    if (external) {
      window.location.href = href;
      setIsOpen(false);
      return;
    }
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-accent/95 backdrop-blur-lg shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }} className="flex items-center space-x-2 cursor-pointer">
            <span className="text-2xl font-bold text-highlight dark:text-dark-highlight">
              RM
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item: any) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.href, item.external); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                  activeSection === item.href.replace('#', '')
                    ? 'bg-highlight text-white dark:bg-dark-highlight'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-accent dark:hover:bg-dark-secondary'
                }`}
              >
                {item.name}
              </a>
            ))}
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="ml-4 p-2 rounded-lg bg-accent dark:bg-dark-secondary text-highlight dark:text-dark-highlight hover:bg-secondary dark:hover:bg-dark-accent transition-custom"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            )}

            {/* User Menu */}
            {mounted && (
              <div className="relative ml-2 user-menu-container">
                {session ? (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-accent dark:bg-dark-secondary hover:bg-secondary dark:hover:bg-dark-accent transition-custom"
                      aria-label="User menu"
                    >
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || 'User'}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User size={20} className="text-highlight dark:text-dark-highlight" />
                      )}
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-secondary rounded-lg shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' });
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-dark-accent flex items-center space-x-2"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-highlight dark:bg-dark-highlight text-white hover:opacity-90 transition-custom"
                  >
                    <LogIn size={18} />
                    <span className="font-medium">Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-accent dark:bg-dark-secondary text-highlight dark:text-dark-highlight"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-accent dark:hover:bg-dark-secondary transition-custom"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-dark-accent shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item: any) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.href, item.external); }}
                className={`block px-3 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                  activeSection === item.href.replace('#', '')
                    ? 'bg-highlight text-white dark:bg-dark-highlight'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-accent dark:hover:bg-dark-secondary'
                }`}
              >
                {item.name}
              </a>
            ))}
            
            {/* Mobile User Section */}
            {mounted && (
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                {session ? (
                  <>
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        {session.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt={session.user.name || 'User'}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-highlight dark:bg-dark-highlight flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-accent dark:hover:bg-dark-accent rounded-lg flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      router.push('/auth/signin');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-highlight dark:bg-dark-highlight text-white hover:opacity-90 transition-custom"
                  >
                    <LogIn size={18} />
                    <span className="font-medium">Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
