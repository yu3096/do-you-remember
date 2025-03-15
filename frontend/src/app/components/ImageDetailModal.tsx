import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Tag {
  id: number;
  name: string;
}

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
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`/api/tags/${file.id}`);
        if (!response.ok) throw new Error('Failed to fetch tags');
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    const fetchAllTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Failed to fetch all tags');
        const data = await response.json();
        setAllTags(data);
      } catch (error) {
        console.error('Error fetching all tags:', error);
      }
    };

    fetchTags();
    fetchAllTags();
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

  useEffect(() => {
    const updateImageSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 뷰포트의 80%를 목표 크기로 설정
        const targetWidth = viewportWidth * 0.8;
        const targetHeight = viewportHeight * 0.8;
        
        // 이미지의 원본 비율 유지
        const imageRatio = imageSize.width / imageSize.height;
        const containerRatio = targetWidth / targetHeight;
        
        let width, height;
        if (imageRatio > containerRatio) {
          // 이미지가 더 넓은 경우
          width = targetWidth;
          height = targetWidth / imageRatio;
        } else {
          // 이미지가 더 높은 경우
          height = targetHeight;
          width = targetHeight * imageRatio;
        }
        
        setScale(Math.min(width / imageSize.width, height / imageSize.height));
      }
    };

    const img = new window.Image();
    img.src = `/api/files/${file.storagePath}`;
    img.onload = () => {
      setImageSize({
        width: img.width,
        height: img.height
      });
    };

    // 초기 크기 설정 및 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', updateImageSize);
    updateImageSize();

    return () => {
      window.removeEventListener('resize', updateImageSize);
    };
  }, [file.storagePath, imageSize.width, imageSize.height]);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Adding tag:', newTag.trim(), 'to attachment:', file.id);
      const response = await fetch(`/api/tags/${file.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify([newTag.trim()]),
      });

      const responseText = await response.text();
      console.log('Server response:', responseText);

      if (!response.ok) {
        throw new Error(responseText || '태그 추가에 실패했습니다');
      }

      // 태그 목록 새로고침
      const tagsResponse = await fetch(`/api/tags/${file.id}`);
      const tagsResponseText = await tagsResponse.text();
      console.log('Tags response:', tagsResponseText);

      if (!tagsResponse.ok) {
        throw new Error(tagsResponseText || '태그 목록 갱신에 실패했습니다');
      }

      const updatedTags = JSON.parse(tagsResponseText);
      console.log('Updated tags:', updatedTags);
      setTags(updatedTags);
      setNewTag('');
    } catch (error) {
      console.error('Error adding tag:', error);
      setError(error instanceof Error ? error.message : '태그 추가 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tags/${file.id}/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('태그 삭제에 실패했습니다');

      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Error removing tag:', error);
      setError(error instanceof Error ? error.message : '태그 삭제 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="absolute top-4 right-16 z-10 w-64">
          <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2">태그</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="새 태그 입력"
                  className="flex-1 bg-black bg-opacity-50 text-white text-sm px-3 py-1.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={handleAddTag}
                  className={`${
                    isLoading 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 flex items-center`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin mr-1">⌛</span>
                  ) : null}
                  추가
                </button>
              </div>
              {error && (
                <div className="text-red-400 text-xs px-2 py-1 bg-red-900 bg-opacity-25 rounded">
                  {error}
                </div>
              )}
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {tags.map(tag => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center ${
                      isLoading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white text-xs px-2 py-1 rounded-lg transition-colors duration-200`}
                  >
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1.5 hover:text-red-300 focus:outline-none"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <span className="text-gray-400 text-xs">아직 태그가 없습니다</span>
                )}
              </div>
            </div>
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
          className="relative w-full h-full flex items-center justify-center"
        >
          <div className="relative flex items-center justify-center p-4">
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