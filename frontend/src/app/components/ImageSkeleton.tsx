import React from 'react';

interface ImageSkeletonProps {
  aspectRatio?: 'square' | 'video' | 'auto';
  className?: string;
}

export default function ImageSkeleton({ 
  aspectRatio = 'square',
  className = ''
}: ImageSkeletonProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  };

  return (
    <div className={`${aspectRatioClasses[aspectRatio]} ${className} bg-gray-200 animate-pulse rounded-lg`}>
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
} 