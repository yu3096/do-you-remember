import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ImageDetailModal from './ImageDetailModal';
import SearchPanel from './SearchPanel';
import { ArrowUpIcon, ArrowDownIcon, PhotoIcon, CalendarIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import CreateAlbum from './CreateAlbum';
import { FileInfo } from '../types/album';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import ImageSkeleton from './ImageSkeleton';

type SortOption = 'name' | 'date' | 'size';
type SortDirection = 'asc' | 'desc';

const FileList: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});
  const [sortField, setSortField] = useState<'fileName' | 'fileSize' | 'createdAt'>('createdAt');
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const { showToast } = useToast();

  const fetchFiles = useCallback(async (searchCriteria?: any) => {
    setIsLoading(true);
    try {
      let url = '/api/v1/files/list';
      if (searchCriteria) {
        url = '/api/v1/files/search/advanced';
        const params = new URLSearchParams();
        Object.entries(searchCriteria).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
        url += '?' + params.toString();
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched files:', data);
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      showToast(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    const handleFileUpload = () => {
      fetchFiles();
    };

    window.addEventListener('fileUploaded', handleFileUpload);
    return () => {
      window.removeEventListener('fileUploaded', handleFileUpload);
    };
  }, [fetchFiles]);

  const handleSearch = (criteria: any) => {
    fetchFiles(criteria);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleSort = (option: SortOption) => {
    if (option === sortOption) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
  };

  const handleTagSelect = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const sortFiles = (filesToSort: FileInfo[]) => {
    return [...filesToSort].sort((a, b) => {
      let comparison = 0;
      switch (sortOption) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const filteredAndSortedFiles = sortFiles(
    selectedTags.length > 0
      ? files.filter(file => 
          selectedTags.every(tag => 
            file.tags?.some(fileTag => fileTag.name === tag)
          )
        )
      : files
  );

  const SortButton = ({ option, label }: { option: SortOption; label: string }) => (
    <button
      onClick={() => handleSort(option)}
      className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all ${
        sortOption === option
          ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
      {sortOption === option && (
        sortDirection === 'asc' ? (
          <ArrowUpIcon className="w-4 h-4" />
        ) : (
          <ArrowDownIcon className="w-4 h-4" />
        )
      )}
      {sortOption !== option && <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />}
    </button>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <ImageSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 mb-4">등록된 파일이 없습니다.</p>
        <button
          onClick={fetchFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => setShowSearchPanel(!showSearchPanel)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              showSearchPanel
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            고급 검색 {showSearchPanel ? '닫기' : '열기'}
          </button>
          <button
            onClick={() => setShowCreateAlbum(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            새 앨범 만들기
          </button>
        </div>
        {showSearchPanel && (
          <div className="mt-4">
            <SearchPanel 
              onSearch={handleSearch} 
              onTagsChange={setSelectedTags} 
              selectedTags={selectedTags}
              files={files}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1" />
            <SortButton option="name" label="이름순" />
            <SortButton option="date" label="날짜순" />
            <SortButton option="size" label="크기순" />
          </div>
        </div>

        {filteredAndSortedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 text-center bg-white rounded-xl shadow-sm p-8">
            <PhotoIcon className="w-16 h-16 text-gray-400" />
            <div>
              <p className="text-gray-500 mb-1">업로드된 파일이 없습니다.</p>
              <p className="text-gray-400 text-sm">이미지를 업로드하여 시작해보세요.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className="relative aspect-square group cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                <img
                  src={`/api/v1/files/content/${file.storagePath}`}
                  alt={file.fileName}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    console.error('이미지 로딩 실패:', e);
                    e.currentTarget.src = '/placeholder.jpg';
                  }}
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
        )}
      </div>

      {selectedFile && (
        <ImageDetailModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onUpdate={(updatedFile) => {
            setFiles(files.map(file => 
              file.id === updatedFile.id ? updatedFile : file
            ));
            setSelectedFile(updatedFile);
          }}
        />
      )}

      {showCreateAlbum && (
        <CreateAlbum
          onClose={() => setShowCreateAlbum(false)}
          onAlbumCreated={() => {
            setShowCreateAlbum(false);
            // 앨범이 생성된 후 필요한 작업 수행
          }}
        />
      )}
    </div>
  );
};

export default FileList; 