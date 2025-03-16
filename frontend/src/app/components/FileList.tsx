import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageDetailModal from './ImageDetailModal';
import SearchPanel from './SearchPanel';
import { ArrowUpIcon, ArrowDownIcon, PhotoIcon, CalendarIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface File {
  id: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  tags?: { id: number; name: string }[];
}

type SortOption = 'name' | 'date' | 'size';
type SortDirection = 'asc' | 'desc';

const FileList: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});
  const [sortField, setSortField] = useState<'fileName' | 'fileSize' | 'createdAt'>('createdAt');

  const fetchFiles = async (searchCriteria?: any) => {
    setIsLoading(true);
    try {
      let url = '/api/files/list';
      if (searchCriteria) {
        url = '/api/files/search/advanced';
        const params = new URLSearchParams();
        Object.entries(searchCriteria).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v));
            } else {
              params.append(key, value as string);
            }
          }
        });
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('파일 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('파일 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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

  const sortFiles = (filesToSort: File[]) => {
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-gray-600">이미지를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => setShowSearchPanel(!showSearchPanel)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className="group cursor-pointer rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => setSelectedFile(file)}
              >
                <div className="relative aspect-square">
                  {imageLoadErrors[file.id] ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center p-4">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">이미지를 불러올 수 없습니다</p>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={`/api/files/${file.storagePath}`}
                      alt={file.fileName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={() => setImageLoadErrors(prev => ({ ...prev, [file.id]: true }))}
                    />
                  )}
                </div>
                
                <div className="p-4 space-y-2">
                  <p className="font-medium text-gray-900 truncate">{file.fileName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {file.tags?.slice(0, 3).map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                    {file.tags && file.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-50 text-gray-500 rounded-full">
                        +{file.tags.length - 3}
                      </span>
                    )}
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
        />
      )}
    </div>
  );
};

export default FileList; 