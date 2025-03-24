import React, { useState, useEffect } from 'react';
import { CalendarIcon, TagIcon, MapPinIcon, ArrowsUpDownIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Album, FileInfo } from '../types/album';
import AlbumDetailModal from './AlbumDetailModal';
import SelectAlbumCoverModal from './SelectAlbumCoverModal';
import EditAlbumModal from './EditAlbumModal';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import ImageSkeleton from './ImageSkeleton';
import CreateAlbum from './CreateAlbum';

type SortOption = 'date' | 'count' | 'title';

export default function AlbumView() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'date' | 'tag' | 'location'>('date');
  const [minPhotos, setMinPhotos] = useState(3);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [albumForCover, setAlbumForCover] = useState<Album | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAlbums();
  }, [groupBy, minPhotos]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/v1/files/albums?groupBy=${groupBy}&minPhotos=${minPhotos}`);
      if (!response.ok) {
        throw new Error('앨범을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setAlbums(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      showToast(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortedAlbums = React.useMemo(() => {
    return [...albums].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      if (sortBy === 'count') {
        return b.photoCount - a.photoCount;
      }
      // title
      return a.title.localeCompare(b.title, 'ko');
    });
  }, [albums, sortBy]);

  const handleSelectCover = async (fileId: number, position: string) => {
    if (!albumForCover) return;

    try {
      const response = await fetch(`/api/v1/files/albums/${albumForCover.id}/cover`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId,
          position: position
        }),
      });

      if (!response.ok) {
        throw new Error('앨범 커버 설정에 실패했습니다.');
      }

      // 앨범 목록 새로고침
      await fetchAlbums();
      showToast('앨범 커버가 설정되었습니다.', 'success');
    } catch (error) {
      console.error('앨범 커버 설정 중 오류가 발생했습니다:', error);
      showToast(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.', 'error');
      throw error;
    }
  };

  const handleEditAlbum = async (albumId: number, title: string, description: string, fileIds: number[]) => {
    try {
      const response = await fetch(`/api/v1/files/albums/${albumId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          fileIds,
        }),
      });

      if (!response.ok) {
        throw new Error('앨범 수정에 실패했습니다.');
      }

      // 앨범 목록 새로고침
      await fetchAlbums();
      showToast('앨범이 수정되었습니다.', 'success');
    } catch (error) {
      console.error('앨범 수정 중 오류가 발생했습니다:', error);
      showToast(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.', 'error');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <ImageSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchAlbums}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 mb-4">생성된 앨범이 없습니다.</p>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          새 앨범 만들기
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">앨범</h1>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          새 앨범 만들기
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setGroupBy('date')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                groupBy === 'date'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>날짜별</span>
            </button>
            <button
              onClick={() => setGroupBy('tag')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                groupBy === 'tag'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TagIcon className="w-5 h-5" />
              <span>태그별</span>
            </button>
            <button
              onClick={() => setGroupBy('location')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                groupBy === 'location'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPinIcon className="w-5 h-5" />
              <span>위치별</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowsUpDownIcon className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-2 py-1 border rounded-lg text-sm"
              >
                <option value="date">날짜순</option>
                <option value="count">사진 수</option>
                <option value="title">이름순</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="minPhotos" className="text-sm text-gray-600">
                최소 사진 수:
              </label>
              <input
                type="number"
                id="minPhotos"
                value={minPhotos}
                onChange={(e) => setMinPhotos(Math.max(1, parseInt(e.target.value)))}
                className="w-20 px-2 py-1 border rounded-lg"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAlbums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group"
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="relative aspect-square">
                {album.coverImageId ? (
                  <>
                    <img
                      src={`/api/v1/files/content/${album.files.find(f => f.id === album.coverImageId)?.storagePath}`}
                      alt={album.title}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: album.coverImagePosition || 'center' }}
                      onError={(e) => {
                        console.error('이미지 로딩 실패:', e);
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlbumForCover(album);
                            setIsCoverModalOpen(true);
                          }}
                          className="px-3 py-1 bg-white text-gray-800 rounded-md hover:bg-gray-100 shadow-md"
                        >
                          커버 설정
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlbumForCover(album);
                            setIsEditModalOpen(true);
                          }}
                          className="px-3 py-1 bg-white text-gray-800 rounded-md hover:bg-gray-100 shadow-md"
                        >
                          편집
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">커버 이미지 없음</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{album.title}</h2>
                <p className="text-gray-600">{album.description}</p>
                <p className="text-sm text-gray-500 mt-2">{album.photoCount}장의 사진</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAlbum && (
        <AlbumDetailModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
        />
      )}

      {albumForCover && (
        <SelectAlbumCoverModal
          isOpen={isCoverModalOpen}
          onClose={() => {
            setIsCoverModalOpen(false);
            setAlbumForCover(null);
          }}
          album={albumForCover}
          onSelect={handleSelectCover}
        />
      )}

      {albumForCover && (
        <EditAlbumModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setAlbumForCover(null);
          }}
          album={albumForCover}
          onSave={handleEditAlbum}
        />
      )}
    </div>
  );
} 