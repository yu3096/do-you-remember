import React, { useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSwipe } from '@/hooks/useSwipe';
import { Modal } from './Modal';
import { Loading } from './Loading';

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 가이드 오버레이 자동 숨김
  React.useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePrevious = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      setTimeout(() => setIsAnimating(false), 300);
    });
  }, [isAnimating, images.length]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedIndex((current) => (current === images.length - 1 ? 0 : current + 1));
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      setTimeout(() => setIsAnimating(false), 300);
    });
  }, [isAnimating, images.length]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageClick = useCallback(() => {
    setIsZoomed(true);
  }, []);

  const handleZoomClose = useCallback(() => {
    setIsZoomed(false);
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  // 이미지 슬라이더 스타일 메모이제이션
  const sliderStyle = useMemo(() => ({
    transform: `translate3d(-${selectedIndex * 100}%, 0, 0)`,
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }), [selectedIndex]);

  // 이미지 컨테이너 스타일 메모이제이션
  const imageContainerStyle = useMemo(() => ({
    transform: `translate3d(${selectedIndex * 100}%, 0, 0)`,
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }), [selectedIndex]);

  // 프로그레스 바 스타일
  const progressStyle = useMemo(() => ({
    width: `${((selectedIndex + 1) / images.length) * 100}%`,
    transition: 'width 0.3s ease-out',
  }), [selectedIndex, images.length]);

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 프로그레스 바 */}
      <div className="absolute top-0 left-0 h-1 w-full bg-black/10 z-10">
        <div className="h-full bg-white" style={progressStyle} />
      </div>

      {/* 이미지 슬라이더 */}
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full"
        {...swipeHandlers}
        style={{
          perspective: '1000px',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        <div
          className="relative h-full w-full"
          style={sliderStyle}
        >
          {images.map((image, index) => (
            <div
              key={image.src}
              ref={el => imageRefs.current[index] = el}
              className="absolute left-0 top-0 h-full w-full cursor-zoom-in"
              style={imageContainerStyle}
              onClick={handleImageClick}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                quality={index === selectedIndex ? 90 : 60}
                onLoad={handleImageLoad}
              />
              {isLoading && index === selectedIndex && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loading className="w-8 h-8" />
                </div>
              )}
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

      {/* 줌 아이콘 */}
      <div className="absolute top-4 right-4 z-10">
        <MagnifyingGlassIcon className="w-6 h-6 text-white drop-shadow-lg" />
      </div>

      {/* 스와이프 가이드 오버레이 */}
      {showGuide && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="text-white text-center">
            <p className="text-lg font-medium mb-2">이미지를 스와이프하세요</p>
            <p className="text-sm opacity-80">또는 화살표 버튼을 사용하세요</p>
          </div>
        </div>
      )}

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
              backfaceVisibility: 'hidden',
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="96px"
              quality={60}
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

      {/* 줌 모달 */}
      <Modal
        isOpen={isZoomed}
        onClose={handleZoomClose}
        className="max-w-7xl w-full h-full bg-black"
      >
        <div className="relative w-full h-full">
          <Image
            src={images[selectedIndex].src}
            alt={images[selectedIndex].alt}
            fill
            className="object-contain"
            quality={100}
            priority
          />
          <button
            onClick={handleZoomClose}
            className="absolute top-4 right-4 text-white bg-black/20 p-2 rounded-full hover:bg-black/40 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Modal>
    </div>
  );
}; 