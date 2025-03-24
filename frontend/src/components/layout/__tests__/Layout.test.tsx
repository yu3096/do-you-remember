import React from 'react';
import { render, screen } from '@testing-library/react';
import { Layout } from '../Layout';

// Mock the next/navigation hook
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Layout', () => {
  it('renders header and footer', () => {
    render(
      <Layout>
        <div>테스트 콘텐츠</div>
      </Layout>
    );

    // Header 확인
    expect(screen.getByText('Do you remember?')).toBeInTheDocument();
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('추억')).toBeInTheDocument();
    expect(screen.getByText('설정')).toBeInTheDocument();

    // Footer 확인
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('개인정보처리방침')).toBeInTheDocument();
    expect(screen.getByText('이용약관')).toBeInTheDocument();

    // Content 확인
    expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
  });

  it('applies correct layout classes', () => {
    render(
      <Layout>
        <div>테스트</div>
      </Layout>
    );

    expect(screen.getByTestId('layout-root')).toHaveClass('flex', 'min-h-screen', 'flex-col', 'bg-secondary-50');
    expect(screen.getByRole('main')).toHaveClass('flex-1');
  });
}); 