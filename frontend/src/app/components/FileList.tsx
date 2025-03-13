import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ImageDetailModal from './ImageDetailModal';

interface File {
  id: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

type SortField = 'fileName' | 'fileSize' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const FileList: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files/list');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      console.log('Fetched files:', data);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const handleFileUploaded = () => {
      fetchFiles();
    };

    window.addEventListener('fileUploaded', handleFileUploaded);
    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'fileName':
        comparison = a.fileName.localeCompare(b.fileName);
        break;
      case 'fileSize':
        comparison = a.fileSize - b.fileSize;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const getImageUrl = (storagePath: string) => {
    if (!storagePath) {
      return '/placeholder-image.jpg';
    }
    if (storagePath.startsWith('http')) {
      return storagePath;
    }
    return `http://localhost:8080/api/files/${storagePath}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex gap-4 items-center">
        <span className="text-gray-600">정렬:</span>
        <button
          onClick={() => handleSort('fileName')}
          className={`px-4 py-2 rounded-lg ${
            sortField === 'fileName'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          파일명 {sortField === 'fileName' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('fileSize')}
          className={`px-4 py-2 rounded-lg ${
            sortField === 'fileSize'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          크기 {sortField === 'fileSize' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('createdAt')}
          className={`px-4 py-2 rounded-lg ${
            sortField === 'createdAt'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          업로드일 {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedFiles.map((file) => (
          <div
            key={file.id}
            className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => setSelectedFile(file)}
          >
            <div className="relative h-64 overflow-hidden">
              <Image
                src={getImageUrl(file.storagePath)}
                alt={file.fileName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                priority={false}
                quality={75}
                unoptimized
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">
                {file.fileName}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatFileSize(file.fileSize)}</span>
                <span className="capitalize">{file.fileType.split('/')[1]}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {formatDate(file.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">아직 업로드된 파일이 없습니다.</p>
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