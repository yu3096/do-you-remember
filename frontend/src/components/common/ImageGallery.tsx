import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSwipe } from '@/hooks/useSwipe';

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedIndex((current) => (current === images.length - 1 ? 0 : current + 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 이미지 슬라이더 */}
      <div
        className="relative aspect-[4/3] w-full"
        {...swipeHandlers}
        style={{
          perspective: '1000px',
          willChange: 'transform',
        }}
      >
        <div
          className="relative h-full w-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${selectedIndex * 100}%)`,
            willChange: 'transform',
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.src}
              className="absolute left-0 top-0 h-full w-full"
              style={{
                transform: `translateX(${index * 100}%)`,
                willChange: 'transform',
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={handlePrevious}
          disabled={isAnimating}
          className="transform rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-50 sm:p-3"
          aria-label="이전 이미지"
          style={{ willChange: 'transform' }}
        >
          <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="transform rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-50 sm:p-3"
          aria-label="다음 이미지"
          style={{ willChange: 'transform' }}
        >
          <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* 썸네일 그리드 */}
      <div className="mt-4 hidden gap-2 overflow-x-auto px-4 sm:flex">
        {images.map((image, index) => (
          <button
            key={image.src}
            onClick={() => !isAnimating && setSelectedIndex(index)}
            disabled={isAnimating}
            className="transform-gpu relative aspect-[4/3] w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:scale-105 sm:w-24"
            style={{
              borderColor: index === selectedIndex ? 'var(--primary-500)' : 'transparent',
              willChange: 'transform, border-color',
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>

      {/* 모바일 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => !isAnimating && setSelectedIndex(index)}
            disabled={isAnimating}
            className="transform-gpu transition-all"
            style={{
              width: index === selectedIndex ? '1rem' : '0.375rem',
              height: '0.375rem',
              borderRadius: '9999px',
              backgroundColor: index === selectedIndex ? 'white' : 'rgba(255, 255, 255, 0.6)',
              willChange: 'width, background-color',
            }}
            aria-label={`${index + 1}번째 이미지로 이동`}
          />
        ))}
      </div>
    </div>
  );
}; 