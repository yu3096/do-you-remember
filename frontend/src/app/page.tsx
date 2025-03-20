'use client';

import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Timeline from './components/Timeline';
import FileList from './components/FileList';
import AlbumView from './components/AlbumView';
import { Squares2X2Icon, ClockIcon, PhotoIcon } from '@heroicons/react/24/outline';

type ViewMode = 'grid' | 'timeline' | 'album';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleUploadComplete = () => {
    // 업로드 완료 후 필요한 작업
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        <div className="mb-6">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
              <span>기본 보기</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'timeline'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ClockIcon className="w-5 h-5" />
              <span>타임라인</span>
            </button>
            <button
              onClick={() => setViewMode('album')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'album'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PhotoIcon className="w-5 h-5" />
              <span>앨범</span>
            </button>
          </div>
        </div>

        {viewMode === 'grid' && <FileList />}
        {viewMode === 'timeline' && <Timeline />}
        {viewMode === 'album' && <AlbumView />}
      </div>
    </main>
  );
}
