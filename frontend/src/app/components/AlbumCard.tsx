'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useToast } from '../contexts/ToastContext';

interface AlbumCardProps {
  album: {
    id: number;
    title: string;
    description: string;
    photoCount: number;
    coverImageId?: number;
    coverImagePosition?: string;
    files: {
      id: number;
      fileName: string;
      storagePath: string;
    }[];
  };
  onClick: () => void;
  onDelete: (albumId: number) => void;
  onUpdate: () => void;
  onCoverImageClick: (album: any) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick, onDelete, onUpdate, onCoverImageClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleCoverImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCoverImageClick(album);
  };

  return (
    <div className="relative group">
      <div
        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <Image
          src={`/api/v1/files/content/${
            album.coverImageId
              ? album.files.find(f => f.id === album.coverImageId)?.storagePath
              : album.files[0]?.storagePath
          }`}
          alt={album.title}
          fill
          className="object-cover"
          style={{ objectPosition: album.coverImagePosition || 'center' }}
          onError={(e) => {
            console.error('이미지 로딩 실패:', e);
            e.currentTarget.src = '/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
            <h3 className="text-xl font-bold mb-2">{album.title}</h3>
            <p className="text-sm">{album.photoCount}장의 사진</p>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(album.id);
          }}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button
          onClick={handleCoverImageClick}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AlbumCard; 