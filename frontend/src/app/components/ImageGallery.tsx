import React from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((imagePath, index) => (
        <div key={index} className="relative aspect-square">
          <Image
            src={imagePath}
            alt={`Gallery image ${index + 1}`}
            fill
            className="object-cover rounded-lg hover:opacity-90 transition-opacity"
          />
        </div>
      ))}
      {images.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          업로드된 이미지가 없습니다.
        </div>
      )}
    </div>
  );
} 