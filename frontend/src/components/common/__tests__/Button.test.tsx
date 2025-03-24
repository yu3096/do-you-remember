import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>테스트 버튼</Button>);
    expect(screen.getByText('테스트 버튼')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    
    fireEvent.click(screen.getByText('클릭'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>로딩 중</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('로딩 중')).toBeInTheDocument();
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary-100');

    rerender(<Button variant="outline">버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-primary-600');
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">작은 버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<Button size="lg">큰 버튼</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('applies fullWidth class when specified', () => {
    render(<Button fullWidth>전체 너비</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
}); 