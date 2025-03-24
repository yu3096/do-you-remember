import React from 'react';
import Image, { ImageProps } from 'next/image';
import { useInView } from 'react-intersection-observer';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  lowResSrc?: string;
  aspectRatio?: number;
  preload?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  lowResSrc,
  aspectRatio = 16 / 9,
  preload = false,
  className = '',
  ...props
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '50px 0px',
  });

  const containerStyle = aspectRatio
    ? {
        position: 'relative',
        paddingBottom: `${(1 / aspectRatio) * 100}%`,
      }
    : undefined;

  return (
    <div
      ref={ref}
      className={`overflow-hidden bg-secondary-100 ${className}`}
      style={containerStyle}
    >
      {(inView || preload) && (
        <Image
          src={src}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            lowResSrc ? 'opacity-0' : ''
          }`}
          onLoadingComplete={(img) => {
            img.classList.remove('opacity-0');
          }}
          {...props}
        />
      )}
      {lowResSrc && (
        <Image
          src={lowResSrc}
          className="absolute inset-0 h-full w-full object-cover blur-sm"
          {...props}
        />
      )}
    </div>
  );
}; 