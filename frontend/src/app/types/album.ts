export interface Tag {
  id: number;
  name: string;
  createdAt: string;
}

export interface Album {
  id: number;
  title: string;
  description: string;
  photoCount: number;
  coverImageId?: number;
  coverImagePosition?: string;
  files: FileInfo[];
  startDate: string;
  createdAt: string;
  updatedAt: string;
  groupType?: 'date' | 'tag' | 'location';
  tags?: string[];
  location?: string;
}

export interface FileInfo {
  id: number;
  fileName: string;
  originalFileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  tags?: Tag[];
}

export interface File {
  id: string;
  url: string;
  thumbnailUrl: string;
  storagePath: string;
  dateTaken: string;
  tags: string[];
  location?: string;
} 