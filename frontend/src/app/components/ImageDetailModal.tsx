import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Tag {
  id: number;
  name: string;
}

interface ExifData {
  make: string;
  model: string;
  dateTime: string;
  exposureTime: string;
  fNumber: string;
  isoSpeedRatings: string;
  focalLength: string;
  latitude: number;
  longitude: number;
  imageWidth: number;
  imageHeight: number;
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
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [showDetails, setShowDetails] = useState(true);
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

    const fetchExifData = async () => {
      try {
        const response = await fetch(`/api/files/${file.id}/exif`);
        if (response.ok) {
          const data = await response.json();
          setExifData(data);
        }
      } catch (error) {
        console.error('EXIF 데이터 가져오기 실패:', error);
      }
    };

    fetchTags();
    fetchAllTags();
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
      <div className="relative w-full h-full flex">
        {/* 왼쪽: 이미지 영역 */}
        <div className={`flex-1 flex items-center justify-center p-4 ${showDetails ? 'pr-[400px]' : ''}`}>
          <div className="relative flex flex-col items-center">
            <div ref={containerRef} className="relative">
              <Image
                src={`/api/files/${file.storagePath}`}
                alt={file.fileName}
                width={imageSize.width}
                height={imageSize.height}
                style={{
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                className="rounded-lg shadow-lg transition-transform duration-200"
              />
            </div>
            
            {/* 이미지 조작 버튼 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <button
                onClick={handleRotateLeft}
                className="px-3 py-1 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="왼쪽으로 회전"
              >
                ↺
              </button>
              <button
                onClick={handleRotateRight}
                className="px-3 py-1 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="오른쪽으로 회전"
              >
                ↻
              </button>
              <div className="w-px bg-white/20 mx-1" />
              <button
                onClick={handleDownload}
                className="px-3 py-1 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="다운로드"
              >
                ↓
              </button>
              <button
                onClick={handleOpenOriginal}
                className="px-3 py-1 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="원본 보기"
              >
                ⤢
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽: 메타데이터 영역 */}
        <div className={`absolute right-0 top-0 bottom-0 w-[400px] bg-white transition-transform duration-300 transform ${showDetails ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* 파일 정보 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{file.fileName}</h3>
              <div className="text-sm text-gray-600">
                <p>크기: {formatFileSize(file.fileSize)}</p>
                <p>형식: {file.fileType.split('/')[1].toUpperCase()}</p>
              </div>
            </div>

            {/* EXIF 데이터 섹션 */}
            {exifData && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">촬영 정보</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {exifData.make && exifData.model && (
                    <p>카메라: {exifData.make} {exifData.model}</p>
                  )}
                  {exifData.dateTime && (
                    <p>촬영 일시: {new Date(exifData.dateTime).toLocaleString()}</p>
                  )}
                  {exifData.exposureTime && (
                    <p>노출 시간: {exifData.exposureTime}초</p>
                  )}
                  {exifData.fNumber && (
                    <p>조리개: f/{exifData.fNumber}</p>
                  )}
                  {exifData.isoSpeedRatings && (
                    <p>ISO: {exifData.isoSpeedRatings}</p>
                  )}
                  {exifData.focalLength && (
                    <p>초점 거리: {exifData.focalLength}mm</p>
                  )}
                  {exifData.imageWidth && exifData.imageHeight && (
                    <p>해상도: {exifData.imageWidth} × {exifData.imageHeight}</p>
                  )}
                  {exifData.latitude && exifData.longitude && (
                    <div>
                      <p>위치:</p>
                      <a
                        href={`https://www.google.com/maps?q=${exifData.latitude},${exifData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        지도에서 보기
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 태그 섹션 */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">태그</h4>
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
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
            </div>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
        >
          ×
        </button>

        {/* 상세정보 토글 버튼 */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="absolute top-4 right-16 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
          title={showDetails ? "상세정보 숨기기" : "상세정보 보기"}
        >
          {showDetails ? "→" : "←"}
        </button>
      </div>
    </div>
  );
};

export default ImageDetailModal; 