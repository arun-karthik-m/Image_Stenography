
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

interface ImagePreviewProps {
  image: File | Blob | null;
  className?: string;
  alt?: string;
}

export default function ImagePreview({ 
  image, 
  className, 
  alt = "Image preview" 
}: ImagePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (image) {
      setIsLoading(true);
      const url = URL.createObjectURL(image);
      const img = new Image();
      img.onload = () => {
        setImageUrl(url);
        setIsLoading(false);
      };
      img.src = url;
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageUrl(null);
    }
  }, [image]);

  if (isLoading) {
    return (
      <div className={cn(
        "w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center",
        className
      )}>
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={cn(
        "w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center",
        className
      )}>
        <p className="text-muted-foreground text-sm">No image selected</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative w-full rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 shadow-inner",
      className
    )}>
      <img 
        src={imageUrl} 
        alt={alt}
        className="w-full h-auto object-contain max-h-[300px] rounded-lg" 
      />
    </div>
  );
}
