import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../Toast';

jest.useFakeTimers();

describe('Toast', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders with title and message', () => {
    render(
      <Toast
        isVisible={true}
        title="테스트 제목"
        message="테스트 메시지"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    render(
      <Toast
        isVisible={true}
        title="테스트"
        onClose={handleClose}
      />
    );

    await userEvent.click(screen.getByRole('button'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('auto closes after duration', () => {
    const handleClose = jest.fn();
    render(
      <Toast
        isVisible={true}
        title="테스트"
        onClose={handleClose}
        duration={3000}
      />
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies different styles based on type', () => {
    const { rerender } = render(
      <Toast
        isVisible={true}
        title="테스트"
        type="success"
        onClose={() => {}}
      />
    );

    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');

    rerender(
      <Toast
        isVisible={true}
        title="테스트"
        type="error"
        onClose={() => {}}
      />
    );

    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  it('does not auto close when duration is 0', () => {
    const handleClose = jest.fn();
    render(
      <Toast
        isVisible={true}
        title="테스트"
        onClose={handleClose}
        duration={0}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(handleClose).not.toHaveBeenCalled();
  });
}); 