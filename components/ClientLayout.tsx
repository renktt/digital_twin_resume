'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';
import ChatBot from '@/components/ChatBot';
import ProtectedFeature from '@/components/ProtectedFeature';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <Navigation />
      <main>
        {children}
      </main>
      <ProtectedFeature featureName="the AI Chatbot">
        <ChatBot />
      </ProtectedFeature>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#5D866C',
            color: '#fff',
          },
        }}
      />
    </ThemeProvider>
  );
}
