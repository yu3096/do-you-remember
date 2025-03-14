import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface File {
  id: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

interface ImageDetailModalProps {
  file: File;
  onClose: () => void;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ file, onClose }) => {
  const [rotation, setRotation] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = `/api/files/${file.storagePath}`;
    img.onload = () => {
      setImageSize({
        width: img.width,
        height: img.height
      });
      
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const widthRatio = containerWidth / img.width;
        const heightRatio = containerHeight / img.height;
        
        let initialScale;
        if (img.width > img.height) {
          initialScale = widthRatio;
        } else {
          initialScale = heightRatio;
        }
        
        setScale(initialScale);
      }
    };
  }, [file.storagePath]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/files/${file.storagePath}`;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleOpenOriginal = () => {
    window.open(`/api/files/${file.storagePath}`, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">{file.fileName}</p>
            <p className="text-xs opacity-80">{formatFileSize(file.fileSize)}</p>
            <p className="text-xs opacity-80">{file.fileType.split('/')[1].toUpperCase()}</p>
          </div>
        </div>

        <button
          className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full z-10 transition-all duration-200"
          onClick={onClose}
        >
          ✕
        </button>

        <div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={`/api/files/${file.storagePath}`}
              alt={file.fileName}
              width={imageSize.width}
              height={imageSize.height}
              className="object-contain select-none"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`,
                transition: 'transform 0.2s ease',
              }}
              priority
              quality={100}
            />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
          <button
            className="text-white p-3 rounded-full transition-all duration-200"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
            onClick={handleRotateLeft}
          >
            ↺
          </button>
          <button
            className="text-white p-3 rounded-full transition-all duration-200"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
            onClick={handleRotateRight}
          >
            ↻
          </button>
          <button
            className="text-white px-4 py-2 rounded-lg transition-all duration-200"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
            onClick={handleOpenOriginal}
          >
            원본 보기
          </button>
          <button
            className="text-white px-4 py-2 rounded-lg transition-all duration-200"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
            onClick={handleDownload}
          >
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailModal; 