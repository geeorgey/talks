'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Globe } from 'lucide-react';
import { getBasePath } from '@/lib/utils';

interface HeaderProps {
  currentLanguage?: 'ja' | 'en';
  onLanguageChange?: (lang: 'ja' | 'en') => void;
}

export default function Header({ currentLanguage = 'ja', onLanguageChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const basePath = getBasePath();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigation = [
    { name: 'ホーム', nameEn: 'Home', href: '/' },
    { name: 'プレゼンテーション', nameEn: 'Presentations', href: '/presentations' },
    { name: '検索', nameEn: 'Search', href: '/search' },
    { name: 'プロフィール', nameEn: 'Profile', href: '/profile' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">YG</span>
            </div>
            <span className="font-semibold text-gray-900">
              {currentLanguage === 'ja' ? 'プレゼンテーション' : 'Presentations'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {currentLanguage === 'ja' ? item.name : item.nameEn}
              </Link>
            ))}
          </nav>

          {/* Language Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            {onLanguageChange && (
              <button
                onClick={() => onLanguageChange(currentLanguage === 'ja' ? 'en' : 'ja')}
                className="btn-ghost"
                aria-label="Toggle language"
              >
                <Globe className="w-4 h-4" />
                <span className="ml-1 text-sm">
                  {currentLanguage === 'ja' ? 'EN' : 'JA'}
                </span>
              </button>
            )}

            {/* Search Button */}
            <Link href="/search" className="btn-ghost md:hidden">
              <Search className="w-4 h-4" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden btn-ghost"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {currentLanguage === 'ja' ? item.name : item.nameEn}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}