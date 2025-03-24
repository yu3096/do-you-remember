import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-secondary-200 bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col items-center space-y-2 sm:items-start">
            <Link 
              href="/"
              className="text-lg font-semibold text-primary-600 hover:text-primary-700"
            >
              Do you remember?
            </Link>
            <p className="text-center text-sm text-secondary-500 sm:text-left">
              © {new Date().getFullYear()} Do you remember? All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a
              href="https://github.com/yourusername/do-you-remember"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary-500 hover:text-secondary-700"
            >
              GitHub
            </a>
            <Link
              href="/privacy"
              className="text-sm text-secondary-500 hover:text-secondary-700"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/terms"
              className="text-sm text-secondary-500 hover:text-secondary-700"
            >
              이용약관
            </Link>
          </nav>
        </div>
        <div className="mt-8 hidden border-t border-secondary-200 pt-8 sm:block">
          <p className="text-center text-xs text-secondary-400">
            이 웹사이트는 사용자의 소중한 추억을 안전하게 보관하고 공유하기 위해 만들어졌습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}; 