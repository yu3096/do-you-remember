import React, { useState, useEffect, useRef } from 'react';

interface Tag {
  id: number;
  name: string;
}

interface TagSearchProps {
  onTagsChange: (tags: Set<string>) => void;
}

const TagSearch: React.FC<TagSearchProps> = ({ onTagsChange }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('태그를 불러오는데 실패했습니다');
        const data = await response.json();
        setAllTags(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '태그를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);

    if (value.trim()) {
      const filtered = allTags.filter(tag => 
        tag.name.toLowerCase().includes(value.toLowerCase()) &&
        !selectedTags.has(tag.name)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleTagSelect = (tagName: string) => {
    const newSelectedTags = new Set(selectedTags);
    newSelectedTags.add(tagName);
    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleTagRemove = (tagName: string) => {
    const newSelectedTags = new Set(selectedTags);
    newSelectedTags.delete(tagName);
    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-12">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-2">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">태그로 검색</h3>
      <div className="relative" ref={searchRef}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="태그 검색..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((tag) => (
              <div
                key={tag.id}
                onClick={() => handleTagSelect(tag.name)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from(selectedTags).map((tagName) => (
          <div
            key={tagName}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-sm"
          >
            <span>{tagName}</span>
            <button
              onClick={() => handleTagRemove(tagName)}
              className="hover:text-blue-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setShowAllTags(!showAllTags)}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <span>{showAllTags ? '전체 태그 숨기기' : '전체 태그 보기'}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${showAllTags ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showAllTags && (
          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelect(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors
                    ${selectedTags.has(tag.name)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  disabled={selectedTags.has(tag.name)}
                >
                  {tag.name}
                </button>
              ))}
              {allTags.length === 0 && (
                <p className="text-gray-500 text-sm">등록된 태그가 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSearch; 