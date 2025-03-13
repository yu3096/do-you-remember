import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onUploadSuccess: (filePath: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('file', file);
      });

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      const data = await response.json();
      onUploadSuccess(data.filePath);
      
      // 파일 업로드 성공 이벤트 발생
      window.dispatchEvent(new Event('fileUploaded'));
    } catch (error) {
      console.error('Upload error:', error);
      alert('파일 업로드에 실패했습니다.');
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
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
              PNG, JPG, GIF 파일 (최대 50MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 