export interface FileInfo {
  id: number;
  fileName: string;
  storagePath: string;
  contentType: string;
  size: number;
  uploadDate: string;
  exifData?: {
    make?: string;
    model?: string;
    dateTime?: string;
    exposureTime?: string;
    fNumber?: string;
    isoSpeedRatings?: string;
    focalLength?: string;
    latitude?: number;
    longitude?: number;
  };
  tags?: string[];
} 