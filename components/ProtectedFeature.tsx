'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, LogIn } from 'lucide-react';

interface ProtectedFeatureProps {
  children: ReactNode;
  featureName?: string;
}

export default function ProtectedFeature({ 
  children, 
  featureName = 'this feature' 
}: ProtectedFeatureProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight dark:border-dark-highlight"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 bg-accent/50 dark:bg-dark-accent/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600"
      >
        <div className="p-6 bg-highlight/10 dark:bg-dark-highlight/10 rounded-full mb-4">
          <Lock size={48} className="text-highlight dark:text-dark-highlight" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 text-center">
          Sign In Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
          To access {featureName}, please sign in with your Google account. It only takes a second!
        </p>
        <button
          onClick={() => router.push(`/auth/signin?callbackUrl=${window.location.pathname}`)}
          className="flex items-center gap-3 bg-highlight dark:bg-dark-highlight hover:opacity-90 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg"
        >
          <LogIn size={20} />
          Sign In with Google
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center max-w-sm">
          Your privacy is protected. We only use your account for authentication.
        </p>
      </motion.div>
    );
  }

  return <>{children}</>;
}
