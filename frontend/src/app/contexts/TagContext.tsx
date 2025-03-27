'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Tag {
  id: number;
  name: string;
  createdAt: string;
}

interface TagContextType {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  removeTag: (tagId: number) => void;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  const addTag = useCallback((tag: Tag) => {
    setTags(prevTags => {
      // 이미 존재하는 태그인지 확인
      if (prevTags.some(t => t.id === tag.id)) {
        return prevTags;
      }
      return [...prevTags, tag];
    });
  }, []);

  const removeTag = useCallback((tagId: number) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
  }, []);

  return (
    <TagContext.Provider value={{ tags, setTags, addTag, removeTag }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTags = () => {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
}; 