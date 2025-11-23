import ClientLayout from '@/components/ClientLayout';
import AuthProvider from '@/components/AuthProvider';
import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Renante Marzan | Portfolio & Resume',
  description: 'Professional portfolio, resume, and projects showcase with AI-powered digital twin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
