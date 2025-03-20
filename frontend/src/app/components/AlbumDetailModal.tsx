import React, { useState, useEffect } from 'react';
import { Album, FileInfo } from '../types/album';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface AlbumDetailModalProps {
  album: Album;
  onClose: () => void;
}

export default function AlbumDetailModal({ album, onClose }: AlbumDetailModalProps) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleFileClick = (file: FileInfo, index: number) => {
    setSelectedFile(file);
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedFile(album.files[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < album.files.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedFile(album.files[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFile) return;

      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        setSelectedFile(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, currentIndex]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{album.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{album.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {album.files.map((file, index) => (
            <div
              key={file.id}
              className="relative aspect-square group cursor-pointer"
              onClick={() => handleFileClick(file, index)}
            >
              <img
                src={`/api/v1/files/content/${file.storagePath}`}
                alt={file.originalFileName}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-sm">
                    {format(new Date(file.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={handlePrevious}
                className={`absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
                  currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={currentIndex === 0}
              >
                <ChevronLeftIcon className="w-8 h-8 text-white" />
              </button>
              <img
                src={`/api/v1/files/content/${selectedFile.storagePath}`}
                alt={selectedFile.originalFileName}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={handleNext}
                className={`absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
                  currentIndex === album.files.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={currentIndex === album.files.length - 1}
              >
                <ChevronRightIcon className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="w-8 h-8 text-white" />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                {currentIndex + 1} / {album.files.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 