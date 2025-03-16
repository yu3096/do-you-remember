import React, { useState, useEffect, useRef } from 'react';

interface Tag {
  id: number;
  name: string;
}

export interface TagSearchProps {
  onTagSelect?: (tags: string[]) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagSearch: React.FC<TagSearchProps> = ({ onTagSelect, selectedTags, onTagsChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('태그 목록을 가져오는데 실패했습니다');
        const data = await response.json();
        setTags(data);
        setAvailableTags(data.map((tag: any) => tag.name));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setError('태그 목록을 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTagSelect = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(tag => tag !== tagName)
      : [...selectedTags, tagName];
    if (onTagSelect) onTagSelect(newSelectedTags);
    onTagsChange(newSelectedTags);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  );

  if (error) return <div className="text-red-500">{error}</div>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tagName) => (
          <span
            key={tagName}
            className="inline-flex items-center bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
          >
            {tagName}
            <button
              onClick={() => handleTagSelect(tagName)}
              className="ml-2 focus:outline-none hover:text-red-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="태그 검색..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showSuggestions && searchTerm && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelect(tag.name)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  {tag.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">검색 결과가 없습니다</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSearch; 