'use client';

import { useState } from 'react';
import FileList from './components/FileList';
import FileUpload from './components/FileUpload';

export default function Home() {
  const [files, setFiles] = useState<string[]>([]);

  const handleUploadSuccess = (filePath: string) => {
    setFiles(prev => [...prev, filePath]);
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Do You Remember</h1>
        
        <div className="mb-12">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">업로드된 파일</h2>
          <FileList />
        </div>
      </main>
    </div>
  );
}
