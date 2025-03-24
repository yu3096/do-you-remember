import { useState, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  preventDefault?: boolean;
}

interface TouchHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export const useSwipe = (
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
): TouchHandlers => {
  const { threshold = 50, preventDefault = true } = options;
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
      });
    },
    [preventDefault]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;
      if (preventDefault) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const deltaX = touchStart.x - touch.clientX;
      const deltaY = touchStart.y - touch.clientY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 수평 스와이프
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
            setTouchStart(null);
          } else if (deltaX < 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
            setTouchStart(null);
          }
        }
      } else {
        // 수직 스와이프
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp();
            setTouchStart(null);
          } else if (deltaY < 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown();
            setTouchStart(null);
          }
        }
      }
    },
    [touchStart, threshold, handlers, preventDefault]
  );

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}; 