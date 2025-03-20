import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FileInfo } from '@/types/file';

interface Tag {
  id: number;
  name: string;
}

interface ImageDetailModalProps {
  file: {
    id: number;
    fileName: string;
    fileType?: string;
    contentType?: string;
    fileSize?: number;
    size?: number;
    createdAt?: string;
    uploadDate?: string;
    storagePath: string;
    metadata?: {
      [key: string]: any;
    };
  };
  onClose: () => void;
  onUpdate?: (updatedFile: any) => void;
}

const ImageDetailModal = ({ file, onClose, onUpdate }: ImageDetailModalProps) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exifData, setExifData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isTagLoading, setIsTagLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setIsTagLoading(true);
      try {
        const response = await fetch(`/api/v1/files/${file.id}/tags`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || '태그를 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsTagLoading(false);
      }
    };

    const fetchExifData = async () => {
      try {
        const response = await fetch(`/api/v1/files/${file.id}/metadata`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'EXIF 데이터를 불러오는데 실패했습니다');
        }
        const data = await response.json();
        if (Object.keys(data).length === 0) {
          setExifData(null);
        } else {
          setExifData(data);
        }
      } catch (error) {
        console.error('Error fetching EXIF data:', error);
        setExifData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
    fetchExifData();
  }, [file.id]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Adding tag to file:', file.id);
      const response = await fetch(`/api/v1/files/${file.id}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTag.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || '태그 추가에 실패했습니다');
      }

      const updatedTags = await fetch(`/api/v1/files/${file.id}/tags`).then(res => res.json());
      setTags(updatedTags);
      setNewTag('');
      
      if (onUpdate) {
        onUpdate({ ...file, tags: updatedTags });
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      setError(error instanceof Error ? error.message : '태그 추가 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      const response = await fetch(`/api/v1/files/${file.id}/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || '태그 삭제에 실패했습니다');
      }

      const updatedTags = tags.filter(tag => tag.id !== tagId);
      setTags(updatedTags);
      
      if (onUpdate) {
        onUpdate({ ...file, tags: updatedTags });
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      setError(error instanceof Error ? error.message : '태그 삭제 중 오류가 발생했습니다');
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/v1/files/${file.id}/content`;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenOriginal = () => {
    window.open(`/api/v1/files/${file.id}/content`, '_blank');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 이미지 표시 영역 */}
        <div className="relative w-full h-full flex items-center justify-center">
          {imageError ? (
            <div className="text-center text-white">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>이미지를 불러올 수 없습니다.</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={`/api/v1/files/${file.id}/content`}
                alt={file.fileName}
                fill
                className="object-contain"
                onError={handleImageError}
                unoptimized
              />
            </div>
          )}
        </div>

        {/* 상세 정보 패널 */}
        <div className={`absolute right-0 top-0 bottom-0 w-[400px] bg-white transition-transform duration-300 transform ${showDetails ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* 파일 정보 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{file.fileName}</h3>
              <div className="text-sm text-gray-600">
                <p>크기: {((file.fileSize || file.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                <p>형식: {(file.fileType || file.contentType || '').split('/').pop()?.toUpperCase() || '알 수 없음'}</p>
                <p>업로드: {new Date(file.createdAt || file.uploadDate || '').toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>

            {/* EXIF 데이터 섹션 */}
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : exifData ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">촬영 정보</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {Object.entries(exifData).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <p key={key}>
                        {key}: {value.toString()}
                      </p>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                이미지에 EXIF 데이터가 없습니다.
              </div>
            )}

            {/* 태그 섹션 */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">태그</h4>
              {isTagLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="새 태그 추가"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={isLoading}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {tag.name}
                        <button
                          onClick={() => handleRemoveTag(tag.id)}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 상세 정보 토글 버튼 */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
        >
          <svg
            className={`w-6 h-6 transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImageDetailModal; 