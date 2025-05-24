'use client';

import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');

  const handleLanguageChange = (lang: 'ja' | 'en') => {
    setCurrentLanguage(lang);
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', lang);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer currentLanguage={currentLanguage} />
    </div>
  );
}