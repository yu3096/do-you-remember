import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface File {
  id: string;
  fileName: string;
  filePath: string;
  createdAt: string;
}

const FileList: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files/list');
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();
        setFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) {
    return <div className="text-center p-4">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {files.map((file) => (
        <div key={file.id} className="border rounded-lg overflow-hidden shadow-lg">
          <div className="relative h-48">
            <Image
              src={file.filePath}
              alt={file.fileName}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">{file.fileName}</p>
            <p className="text-xs text-gray-500">
              {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList; 