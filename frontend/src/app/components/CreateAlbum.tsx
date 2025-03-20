import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface File {
  id: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  tags?: { id: number; name: string }[];
}

interface CreateAlbumProps {
  onClose: () => void;
  onAlbumCreated: (data: any) => void;
}

const CreateAlbum: React.FC<CreateAlbumProps> = ({ onClose, onAlbumCreated }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/v1/files/list');
      if (!response.ok) throw new Error('파일을 불러오는데 실패했습니다.');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      setError('파일을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (fileId: number) => {
    setSelectedFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/files/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: albumTitle,
          description: albumDescription,
          fileIds: selectedFiles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '앨범 생성에 실패했습니다');
      }

      const data = await response.json();
      onAlbumCreated(data);
      
      // 성공 메시지 표시
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up';
      toast.textContent = '앨범이 성공적으로 생성되었습니다!';
      document.body.appendChild(toast);
      
      // 3초 후 토스트 메시지 제거
      setTimeout(() => {
        toast.remove();
      }, 3000);
    } catch (error) {
      console.error('Error creating album:', error);
      setError(error instanceof Error ? error.message : '앨범 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">새 앨범 만들기</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="albumTitle" className="block text-sm font-medium text-gray-700 mb-1">
              앨범 제목
            </label>
            <input
              type="text"
              id="albumTitle"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="albumDescription" className="block text-sm font-medium text-gray-700 mb-1">
              앨범 설명
            </label>
            <textarea
              id="albumDescription"
              value={albumDescription}
              onChange={(e) => setAlbumDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              사진 선택 ({selectedFiles.length}개 선택됨)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file.id)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden cursor-pointer
                    ${selectedFiles.includes(file.id) ? 'ring-4 ring-blue-500' : ''}
                  `}
                >
                  <Image
                    src={`/api/v1/files/content/${file.storagePath}`}
                    alt={file.fileName}
                    fill
                    className="object-cover"
                  />
                  {selectedFiles.includes(file.id) && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              disabled={selectedFiles.length === 0 || !albumTitle}
            >
              앨범 만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlbum; 