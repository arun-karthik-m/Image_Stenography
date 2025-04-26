import React, { useCallback, useState } from 'react';
import { cn } from "@/lib/utils";
import { Upload, Image } from 'lucide-react';

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  className?: string;
  accept?: string;
  maxSize?: number;
}

export default function DropZone({ 
  onFileDrop, 
  className, 
  accept = "image/png", 
  maxSize = 25 * 1024 * 1024 // Changed to 25MB
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback((file: File) => {
    setError(null);
    
    // Check file type
    if (!file.type.includes(accept)) {
      setError(`Only ${accept.split('/')[1].toUpperCase()} files are allowed`);
      return false;
    }
    
    // Check file size
    if (file.size > maxSize) {
      setError(`File size should be less than ${maxSize / (1024 * 1024)}MB`);
      return false;
    }
    
    return true;
  }, [accept, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileDrop(file);
      }
    }
  }, [onFileDrop, validateFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileDrop(file);
      }
    }
  }, [onFileDrop, validateFile]);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl transition-all duration-200",
      isDragging 
        ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[1.02]" 
        : "border-border hover:border-primary/50 hover:bg-muted/50",
      className
    )}>
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileInputChange}
        id="file-upload"
      />
      
      <div
        className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className={cn(
          "flex flex-col items-center gap-3 transition-transform duration-200",
          isDragging ? "scale-110" : "scale-100"
        )}>
          <div className={cn(
            "p-4 rounded-full bg-primary/10 text-primary mb-2 relative",
            isDragging && "animate-pulse"
          )}>
            {isDragging ? (
              <Upload className="h-8 w-8" />
            ) : (
              <Image className="h-8 w-8" />
            )}
          </div>
          <p className="text-lg font-medium">
            {isDragging ? 'Drop your image here' : 'Drag & drop your PNG image here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            PNG format only, max 25MB
          </p>
          
          {error && (
            <p className="text-sm text-destructive mt-2 font-medium flex items-center gap-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
