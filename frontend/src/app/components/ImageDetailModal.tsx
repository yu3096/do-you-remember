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
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const zoomInterval = useRef<NodeJS.Timeout | null>(null);
  const shrinkInterval = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = `http://localhost:8080/api/files/${file.storagePath}`;
    img.onload = () => {
      setImageSize({
        width: img.width,
        height: img.height
      });
      
      // 이미지 로드 후 화면에 맞게 자동 조정
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const widthRatio = containerWidth / img.width;
        const heightRatio = containerHeight / img.height;
        const initialScale = Math.min(widthRatio, heightRatio) * 0.9; // 90% 크기로 조정
        
        setScale(initialScale);
      }
    };
  }, [file.storagePath]);

  const getMaxTranslate = () => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    
    return {
      x: Math.max(0, (scaledWidth - containerWidth) / 2),
      y: Math.max(0, (scaledHeight - containerHeight) / 2)
    };
  };

  const constrainTranslate = (x: number, y: number) => {
    const maxTranslate = getMaxTranslate();
    return {
      x: Math.max(-maxTranslate.x, Math.min(maxTranslate.x, x)),
      y: Math.max(-maxTranslate.y, Math.min(maxTranslate.y, y))
    };
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `http://localhost:8080/api/files/${file.storagePath}`;
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

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const startZooming = () => {
    setIsZooming(true);
    zoomInterval.current = setInterval(() => {
      setScale((prev) => Math.min(prev + 0.1, 3));
    }, 100);
  };

  const stopZooming = () => {
    setIsZooming(false);
    if (zoomInterval.current) {
      clearInterval(zoomInterval.current);
      zoomInterval.current = null;
    }
  };

  const startShrinking = () => {
    setIsShrinking(true);
    shrinkInterval.current = setInterval(() => {
      setScale((prev) => Math.max(prev - 0.1, 0.5));
    }, 100);
  };

  const stopShrinking = () => {
    setIsShrinking(false);
    if (shrinkInterval.current) {
      clearInterval(shrinkInterval.current);
      shrinkInterval.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const constrained = constrainTranslate(newX, newY);
    setTranslate(constrained);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
    setTranslate(constrainTranslate(translate.x, translate.y));
  };

  const handleOpenOriginal = () => {
    window.open(`http://localhost:8080/api/files/${file.storagePath}`, '_blank');
  };

  useEffect(() => {
    return () => {
      if (zoomInterval.current) clearInterval(zoomInterval.current);
      if (shrinkInterval.current) clearInterval(shrinkInterval.current);
    };
  }, []);

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
          className="relative w-full h-full flex items-center justify-center cursor-move overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={`http://localhost:8080/api/files/${file.storagePath}`}
              alt={file.fileName}
              width={imageSize.width}
              height={imageSize.height}
              className="object-contain select-none"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease',
              }}
              priority
              quality={100}
            />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
          <button
            className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-200"
            onClick={handleRotateLeft}
          >
            ↺
          </button>
          <button
            className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-200"
            onClick={handleRotateRight}
          >
            ↻
          </button>
          <button
            className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-200"
            onClick={handleZoomIn}
            onMouseDown={startZooming}
            onMouseUp={stopZooming}
            onMouseLeave={stopZooming}
          >
            +
          </button>
          <button
            className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-200"
            onClick={handleZoomOut}
            onMouseDown={startShrinking}
            onMouseUp={stopShrinking}
            onMouseLeave={stopShrinking}
          >
            -
          </button>
          <button
            className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200"
            onClick={handleOpenOriginal}
          >
            원본 보기
          </button>
          <button
            className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200"
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