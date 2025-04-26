
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import DropZone from './DropZone';
import ImagePreview from './ImagePreview';
import ProgressBar from './ProgressBar';
import { Download, Loader, ArrowRight } from 'lucide-react';
import { encodeMessage, isPNG, isFileSizeAcceptable, calculateMaxMessageLength } from '@/utils/steganography';

export default function EncoderPanel() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [encodedImage, setEncodedImage] = useState<Blob | null>(null);
  const [progress, setProgress] = useState(0);
  const [isEncoding, setIsEncoding] = useState(false);
  const [maxLength, setMaxLength] = useState(0);
  
  const { toast } = useToast();

  // Handle file drop
  const handleFileDrop = useCallback((file: File) => {
    if (!isPNG(file)) {
      toast({
        title: "Invalid file format",
        description: "Only PNG images are supported",
        variant: "destructive",
      });
      return;
    }

    if (!isFileSizeAcceptable(file)) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setOriginalImage(file);
    setEncodedImage(null);
    
    // Calculate max message length
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const maxLen = calculateMaxMessageLength(img.width, img.height);
      setMaxLength(maxLen);
      URL.revokeObjectURL(url);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast({
        title: "Error loading image",
        description: "Could not load the image",
        variant: "destructive",
      });
    };
    
    img.src = url;
  }, [toast]);

  // Handle encoding
  const handleEncode = useCallback(async () => {
    if (!originalImage) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "No message entered",
        description: "Please enter a message to hide",
        variant: "destructive",
      });
      return;
    }
    
    if (!key.trim()) {
      toast({
        title: "No key entered",
        description: "Please enter an encryption key",
        variant: "destructive",
      });
      return;
    }

    if (message.length > maxLength) {
      toast({
        title: "Message too long",
        description: `Maximum message length for this image is ${maxLength} characters`,
        variant: "destructive",
      });
      return;
    }
    
    setIsEncoding(true);
    setProgress(0);
    
    try {
      const encoded = await encodeMessage(
        originalImage,
        message,
        key,
        (progress) => setProgress(progress)
      );
      
      setEncodedImage(encoded);
      toast({
        title: "Success",
        description: "Your message has been successfully hidden in the image",
      });
    } catch (error) {
      let message = "An unexpected error occurred";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Encoding failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsEncoding(false);
    }
  }, [originalImage, message, key, maxLength, toast]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (encodedImage) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(encodedImage);
      link.download = 'encoded-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [encodedImage]);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Original Image</h2>
          {!originalImage ? (
            <DropZone onFileDrop={handleFileDrop} />
          ) : (
            <div className="space-y-4">
              <ImagePreview image={originalImage} />
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  {originalImage.name} ({Math.round(originalImage.size / 1024)} KB)
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setOriginalImage(null)}
                >
                  Change
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Encoded Image</h2>
          <div className="relative min-h-[200px] flex items-center justify-center">
            {isEncoding ? (
              <Card className="p-6 w-full h-full flex flex-col items-center justify-center gap-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Encoding your message...</p>
                <ProgressBar value={progress} className="w-full max-w-[200px]" />
              </Card>
            ) : encodedImage ? (
              <div className="space-y-4 w-full">
                <ImagePreview image={encodedImage} alt="Encoded image" />
                <Button 
                  className="w-full" 
                  onClick={handleDownload}
                  variant="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Encoded Image
                </Button>
              </div>
            ) : (
              <Card className="p-6 w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Encoded image will appear here
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="message">Secret Message</Label>
          <Textarea
            id="message"
            placeholder="Enter the message you want to hide..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            disabled={isEncoding}
          />
          {originalImage && (
            <p className="text-xs text-muted-foreground">
              {message.length} / {maxLength} characters
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="key">Encryption Key</Label>
          <Input
            id="key"
            type="password"
            placeholder="Enter your secret key..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={isEncoding}
          />
          <p className="text-xs text-muted-foreground">
            Remember this key! You'll need it to decode the message later.
          </p>
        </div>
        
        <Button
          className="w-full"
          onClick={handleEncode}
          disabled={isEncoding || !originalImage || !message.trim() || !key.trim()}
        >
          {isEncoding ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Encoding...
            </>
          ) : (
            <>
              Encode Message
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          ⚠️ Important: Do not compress or edit the encoded image, as it may corrupt the hidden message.
        </p>
      </div>
    </div>
  );
}
