import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageDetailModal from './ImageDetailModal';

interface File {
  id: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  exifData?: {
    dateTime: string;
    make: string;
    model: string;
  };
}

interface TimelineGroup {
  date: string;
  files: File[];
}

const Timeline: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [timelineGroups, setTimelineGroups] = useState<TimelineGroup[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files/list');
        if (!response.ok) throw new Error('파일 목록을 가져오는데 실패했습니다');
        const data = await response.json();
        
        // EXIF 데이터 가져오기
        const filesWithExif = await Promise.all(
          data.map(async (file: File) => {
            try {
              const exifResponse = await fetch(`/api/files/${file.id}/exif`);
              if (exifResponse.ok) {
                const exifData = await exifResponse.json();
                return { ...file, exifData };
              }
            } catch (error) {
              console.error('EXIF 데이터 가져오기 실패:', error);
            }
            return file;
          })
        );

        setFiles(filesWithExif);
        
        // 날짜별로 그룹화
        const groups = filesWithExif.reduce((acc: TimelineGroup[], file: File) => {
          if (!file.exifData?.dateTime) return acc;
          
          const date = file.exifData.dateTime.split(' ')[0];
          const existingGroup = acc.find(group => group.date === date);
          
          if (existingGroup) {
            existingGroup.files.push(file);
          } else {
            acc.push({ date, files: [file] });
          }
          
          return acc;
        }, []);
        
        // 날짜 기준 내림차순 정렬
        groups.sort((a: TimelineGroup, b: TimelineGroup) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTimelineGroups(groups);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {timelineGroups.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>EXIF 데이터가 있는 사진이 없습니다.</p>
        </div>
      ) : (
        timelineGroups.map((group) => (
          <div key={group.date} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-white py-4 z-10">
              {formatDate(group.date)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {group.files.map((file) => (
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
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-all duration-300">
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-sm text-white truncate">{file.fileName}</p>
                    {file.exifData?.make && file.exifData?.model && (
                      <p className="text-xs text-white opacity-75">
                        {file.exifData.make} {file.exifData.model}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
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

export default Timeline; 