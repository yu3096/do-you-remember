import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageDetailModal from './ImageDetailModal';
import TagSearch from './TagSearch';

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
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagList, setShowTagList] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files/list');
        if (!response.ok) throw new Error('파일 목록을 가져오는데 실패했습니다');
        const data = await response.json();
        
        // 각 파일의 태그 정보를 가져옵니다
        const filesWithTags = await Promise.all(
          data.map(async (file: File) => {
            try {
              const tagResponse = await fetch(`/api/files/${file.id}/tags`);
              if (tagResponse.ok) {
                const tags = await tagResponse.json();
                return { ...file, tags };
              }
            } catch (error) {
              console.error('Error fetching file tags:', error);
            }
            return file;
          })
        );
        
        setFiles(filesWithTags);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="mb-4">
          <TagSearch onTagSelect={handleTagSelect} selectedTags={selectedTags} />
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setShowTagList(!showTagList)}
              className={`px-3 py-1 rounded ${
                showTagList ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              전체 태그 {showTagList ? '닫기' : '보기'}
            </button>
            <button
              onClick={() => handleSort('name')}
              className={`px-3 py-1 rounded ${
                sortOption === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              이름순 {sortOption === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('date')}
              className={`px-3 py-1 rounded ${
                sortOption === 'date' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              날짜순 {sortOption === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('size')}
              className={`px-3 py-1 rounded ${
                sortOption === 'size' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              크기순 {sortOption === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {showTagList && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-3">전체 태그 목록</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(files.flatMap(file => file.tags?.map(tag => tag.name) || []))).map(tagName => (
                <button
                  key={tagName}
                  onClick={() => {
                    if (selectedTags.includes(tagName)) {
                      setSelectedTags(selectedTags.filter(t => t !== tagName));
                    } else {
                      setSelectedTags([...selectedTags, tagName]);
                    }
                  }}
                  className={`px-2 py-1 rounded text-sm ${
                    selectedTags.includes(tagName) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {tagName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredAndSortedFiles.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>업로드된 파일이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedFiles.map((file) => (
            <div
              key={file.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              onClick={() => setSelectedFile(file)}
            >
              <Image
                src={`/api/files/${file.storagePath}`}
                alt={file.fileName}
                width={300}
                height={225}
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60">
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm text-white font-medium truncate">{file.fileName}</p>
                <p className="text-xs text-white/80">{formatDate(file.createdAt)}</p>
                <p className="text-xs text-white/80">{formatFileSize(file.fileSize)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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