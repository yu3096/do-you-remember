import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface FileUploadProps {
  onUploadComplete: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  preview: string;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    const newUploadingFiles: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      preview: URL.createObjectURL(file)
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      const data = await response.json();
      onUploadComplete();
      
      // 파일 업로드 성공 이벤트 발생
      window.dispatchEvent(new Event('fileUploaded'));
      
      // 미리보기 URL 정리
      newUploadingFiles.forEach(file => URL.revokeObjectURL(file.preview));
      setUploadingFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => 
        prev.map(file => ({
          ...file,
          error: '업로드 실패'
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // 파일 크기 검사 (각각 50MB 이하)
    const validFiles = acceptedFiles.filter(file => file.size <= 50 * 1024 * 1024);
    if (validFiles.length < acceptedFiles.length) {
      alert('50MB를 초과하는 파일은 업로드할 수 없습니다.');
    }
    
    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative p-12 border-2 border-dashed rounded-2xl text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 shadow-lg' 
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg 
              className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          <div className="space-y-2">
            <p className={`text-lg font-medium ${isDragActive ? 'text-blue-500' : 'text-gray-700'}`}>
              {isDragActive ? '파일을 여기에 놓으세요...' : '파일을 드래그 앤 드롭하거나 클릭하여 선택하세요'}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF 파일 (각각 최대 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* 업로드 중인 파일 미리보기 */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {uploadingFiles.map((file, index) => (
            <div key={index} className="relative">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={file.preview}
                  alt={file.file.name}
                  fill
                  className="object-cover"
                />
                {file.error ? (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
                    <p className="text-white text-sm">{file.error}</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="w-full px-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 truncate">{file.file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 