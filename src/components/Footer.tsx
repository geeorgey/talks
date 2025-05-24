import Link from 'next/link';
import { Github, Twitter, Linkedin, Globe } from 'lucide-react';

interface FooterProps {
  currentLanguage?: 'ja' | 'en';
}

export default function Footer({ currentLanguage = 'ja' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              {currentLanguage === 'ja' ? 'プレゼンテーション' : 'Presentations'}
            </h3>
            <p className="text-sm text-gray-600">
              {currentLanguage === 'ja'
                ? '吉田丈治のプレゼンテーションスライドポートフォリオサイト'
                : 'YOSHIDA George\'s presentation slides portfolio website'}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/george"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/george"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/username/talks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://lne.st/k"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
                aria-label="Website"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              {currentLanguage === 'ja' ? 'ナビゲーション' : 'Navigation'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  {currentLanguage === 'ja' ? 'ホーム' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/presentations" className="text-gray-600 hover:text-gray-900">
                  {currentLanguage === 'ja' ? 'プレゼンテーション' : 'Presentations'}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-gray-900">
                  {currentLanguage === 'ja' ? '検索' : 'Search'}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                  {currentLanguage === 'ja' ? 'プロフィール' : 'Profile'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              {currentLanguage === 'ja' ? 'カテゴリ' : 'Categories'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/presentations?category=technology" className="text-gray-600 hover:text-gray-900">
                  {currentLanguage === 'ja' ? 'テクノロジー' : 'Technology'}
                </Link>
              </li>
              <li>
                <Link href="/presentations?category=business" className="text-gray-600 hover:text-gray-900">
                  {currentLanguage === 'ja' ? 'ビジネス' : 'Business'}
                </Link>
              </li>
              <li>
                <Link href="/presentations?category=research" className="text-gray-600 hover:text-gray-900">
                  {currentLanguage === 'ja' ? '研究' : 'Research'}
                </Link>
              </li>
              <li>
                <Link href="/presentations?category=education" className="text-gray-600 hover:text-gray-900">
                  {currentLanguage === 'ja' ? '教育' : 'Education'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              {currentLanguage === 'ja' ? 'お問い合わせ' : 'Contact'}
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                {currentLanguage === 'ja' ? '株式会社リバネス' : 'Leave a Nest Co., Ltd.'}
              </p>
              <p>
                {currentLanguage === 'ja' ? '取締役CIO' : 'Director & CIO'}
              </p>
              <p>
                {currentLanguage === 'ja' ? '吉田丈治' : 'YOSHIDA George'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {currentYear} YOSHIDA George. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                {currentLanguage === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                {currentLanguage === 'ja' ? '利用規約' : 'Terms of Use'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}