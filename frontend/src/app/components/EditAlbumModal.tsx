import React, { useState, useEffect } from 'react';
import { Album, FileInfo } from '../types/album';

interface EditAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  onSave: (albumId: number, title: string, description: string, fileIds: number[]) => Promise<void>;
}

export default function EditAlbumModal({ isOpen, onClose, album, onSave }: EditAlbumModalProps) {
  const [title, setTitle] = useState(album.title);
  const [description, setDescription] = useState(album.description || '');
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>(album.files);
  const [allFiles, setAllFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchAllFiles();
    }
  }, [isOpen]);

  const fetchAllFiles = async () => {
    try {
      const response = await fetch('/api/v1/files/list');
      if (!response.ok) {
        throw new Error('파일 목록을 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setAllFiles(data);
    } catch (error) {
      console.error('파일 목록을 가져오는 중 오류가 발생했습니다:', error);
    }
  };

  const handleFileToggle = (file: FileInfo) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleSave = async () => {
    try {
      await onSave(
        album.id,
        title,
        description,
        selectedFiles.map(file => file.id)
      );
      onClose();
    } catch (error) {
      console.error('앨범 저장 중 오류가 발생했습니다:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">앨범 편집</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            사진 선택
          </label>
          <div className="grid grid-cols-4 gap-4">
            {allFiles.map((file) => (
              <div
                key={file.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden ${
                  selectedFiles.some(f => f.id === file.id)
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
                onClick={() => handleFileToggle(file)}
              >
                <img
                  src={`/api/v1/files/${file.id}`}
                  alt={file.originalFileName}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
} 