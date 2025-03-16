import React, { useState } from 'react';
import { TagIcon, CalendarIcon, CameraIcon } from '@heroicons/react/24/outline';
import TagSearch from './TagSearch';

interface SearchPanelProps {
    onSearch: (criteria: any) => void;
    onTagsChange: (tags: string[]) => void;
    selectedTags: string[];
    files: {
        id: number;
        fileName: string;
        storagePath: string;
        fileSize: number;
        fileType: string;
        createdAt: string;
        tags?: { id: number; name: string }[];
    }[];
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, onTagsChange, selectedTags, files }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [fNumber, setFNumber] = useState('');
    const [exposureTime, setExposureTime] = useState('');
    const [isoSpeedRatings, setIsoSpeedRatings] = useState('');

    const handleSearch = () => {
        const criteria = {
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            make: make || undefined,
            model: model || undefined,
            fNumber: fNumber || undefined,
            exposureTime: exposureTime || undefined,
            isoSpeedRatings: isoSpeedRatings || undefined
        };
        onSearch(criteria);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
            <div className="space-y-4">
                {/* 태그 검색 */}
                <div>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <TagIcon className="w-5 h-5" />
                        <span className="font-medium">태그 검색</span>
                    </div>
                    <TagSearch selectedTags={selectedTags} onTagsChange={onTagsChange} />
                </div>

                {/* 날짜 범위 검색 */}
                <div>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <CalendarIcon className="w-5 h-5" />
                        <span className="font-medium">날짜 범위</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="시작일"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="종료일"
                        />
                    </div>
                </div>

                {/* EXIF 데이터 검색 */}
                <div>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <CameraIcon className="w-5 h-5" />
                        <span className="font-medium">카메라 설정</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={make}
                            onChange={(e) => setMake(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="제조사"
                        />
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="모델명"
                        />
                        <input
                            type="text"
                            value={fNumber}
                            onChange={(e) => setFNumber(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="F값"
                        />
                        <input
                            type="text"
                            value={exposureTime}
                            onChange={(e) => setExposureTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="노출 시간"
                        />
                        <input
                            type="text"
                            value={isoSpeedRatings}
                            onChange={(e) => setIsoSpeedRatings(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="ISO"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSearch}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
                검색
            </button>
        </div>
    );
};

export default SearchPanel; 