import Image from "next/image";
import { useState } from "react";
import { FileInfo } from "@/types/file";

interface FileDetailProps {
  file: FileInfo;
}

const FileDetail = ({ file }: FileDetailProps) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      <Image
        src={`/api/v1/files/content/${file.storagePath}`}
        alt={file.fileName}
        fill
        className="object-contain"
        sizes="100vw"
        priority
        onError={() => setImageLoadError(true)}
      />
    </div>
  );
};

export default FileDetail; 