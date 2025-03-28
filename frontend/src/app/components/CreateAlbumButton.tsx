import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface CreateAlbumButtonProps {
  onClick: () => void;
  className?: string;
}

const CreateAlbumButton: React.FC<CreateAlbumButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${className}`}
    >
      <PhotoIcon className="w-5 h-5" />
      <span>새 앨범 만들기</span>
    </button>
  );
};

export default CreateAlbumButton; 