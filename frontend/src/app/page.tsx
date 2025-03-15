'use client';

import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Timeline from './components/Timeline';
import FileList from './components/FileList';

type ViewMode = 'grid' | 'timeline';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Do You Remember?</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              기본 보기
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === 'timeline'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              타임라인
            </button>
          </div>
        </div>
        
        <FileUpload onUploadComplete={() => window.location.reload()} />
        
        <div className="mt-8">
          {viewMode === 'grid' ? (
            <FileList />
          ) : (
            <Timeline />
          )}
        </div>
      </div>
    </main>
  );
}
