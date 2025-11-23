'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-white to-accent dark:from-dark-primary dark:via-dark-secondary dark:to-dark-accent flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-block p-4 bg-highlight/10 dark:bg-dark-highlight/10 rounded-full mb-4"
            >
              <LogIn size={48} className="text-highlight dark:text-dark-highlight" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access the AI Chat and Voice features
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-dark-primary border-2 border-gray-300 dark:border-gray-600 hover:border-highlight dark:hover:border-dark-highlight text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                className="text-blue-500"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                className="text-green-500"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                className="text-yellow-500"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                className="text-red-500"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-secondary text-gray-500">
                Why sign in?
              </span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-highlight/20 dark:bg-dark-highlight/20 flex items-center justify-center mt-0.5">
                <span className="text-highlight dark:text-dark-highlight text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Access AI Chatbot
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Chat with Renante's digital twin powered by Groq AI
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-highlight/20 dark:bg-dark-highlight/20 flex items-center justify-center mt-0.5">
                <span className="text-highlight dark:text-dark-highlight text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Voice Conversations
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Talk naturally with voice recognition and responses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-highlight/20 dark:bg-dark-highlight/20 flex items-center justify-center mt-0.5">
                <span className="text-highlight dark:text-dark-highlight text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Personalized Experience
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your conversations are saved for continuity
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-highlight dark:hover:text-dark-highlight transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        {/* Privacy Notice */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          We only use your Google account for authentication. Your data is secure and never shared.
        </p>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary via-white to-accent dark:from-dark-primary dark:via-dark-secondary dark:to-dark-accent flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight dark:border-dark-highlight"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
