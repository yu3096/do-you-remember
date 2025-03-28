import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Album, FileInfo } from '../types/album';

interface SelectAlbumCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  onSelect: (fileId: number, position: string) => Promise<void>;
}

export default function SelectAlbumCoverModal({ isOpen, onClose, album, onSelect }: SelectAlbumCoverModalProps) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 드래그 동작 방지
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    e.preventDefault(); // 기본 드래그 동작 방지

    const rect = imageRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    // 이미지 영역을 벗어나지 않도록 제한
    const maxX = rect.width;
    const maxY = rect.height;
    
    // 위치를 백분율로 변환 (0-100)
    const xPercent = Math.max(0, Math.min(100, (newX / maxX) * 100));
    const yPercent = Math.max(0, Math.min(100, (newY / maxY) * 100));
    
    setPosition({
      x: xPercent,
      y: yPercent
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 드래그 동작 방지
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp as any);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp as any);
    };
  }, [isDragging, startPos]);

  const handleSelect = () => {
    if (selectedFile) {
      const positionString = `${position.x}% ${position.y}%`;
      onSelect(selectedFile.id, positionString);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">앨범 커버 이미지 선택</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 이미지 선택 영역 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">이미지 선택</h3>
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {album.files.map((file) => (
                <div
                  key={file.id}
                  className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 ${
                    selectedFile?.id === file.id ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <img
                    src={`/api/v1/files/content/${file.storagePath}`}
                    alt={file.originalFileName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 이미지 위치 조정 영역 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">이미지 위치 조정</h3>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {selectedFile ? (
                <>
                  <img
                    ref={imageRef}
                    src={`/api/v1/files/content/${selectedFile.storagePath}`}
                    alt={selectedFile.originalFileName}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `${position.x}% ${position.y}%` }}
                    onMouseDown={handleMouseDown}
                  />
                  <div
                    className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-move"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={handleMouseDown}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  이미지를 선택해주세요
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedFile}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 