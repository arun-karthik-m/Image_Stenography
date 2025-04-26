import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import DropZone from './DropZone';
import ImagePreview from './ImagePreview';
import ProgressBar from './ProgressBar';
import { Loader, ArrowRight } from 'lucide-react';
import { decodeMessage, isPNG, isFileSizeAcceptable } from '@/utils/steganography';

export default function DecoderPanel() {
  const [encodedImage, setEncodedImage] = useState<File | null>(null);
  const [key, setKey] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDecoding, setIsDecoding] = useState(false);
  
  const { toast } = useToast();

  // Reset decoded message when image changes
  useEffect(() => {
    if (encodedImage) {
      setDecodedMessage('');
    }
  }, [encodedImage]);

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
        description: "Please upload an image smaller than 25MB",
        variant: "destructive",
      });
      return;
    }

    setEncodedImage(file);
    setDecodedMessage('');
  }, [toast]);

  // Handle decoding
  const handleDecode = useCallback(async () => {
    if (!encodedImage) {
      toast({
        title: "No image selected",
        description: "Please select an encoded image first",
        variant: "destructive",
      });
      return;
    }
    
    if (!key.trim()) {
      toast({
        title: "No key entered",
        description: "Please enter the encryption key",
        variant: "destructive",
      });
      return;
    }
    
    setIsDecoding(true);
    setProgress(0);
    setDecodedMessage(''); // Clear any previous message
    
    try {
      const decoded = await decodeMessage(
        encodedImage,
        key,
        (progress) => setProgress(progress)
      );
      
      console.log("Decoded message:", decoded);
      
      if (!decoded.trim()) {
        toast({
          title: "Decoding failed",
          description: "Failed to decode message. The key may be incorrect or the image is invalid.",
          variant: "destructive",
        });
        setDecodedMessage('');
        return;
      }
      
      setDecodedMessage(decoded);
      
      toast({
        title: "Success",
        description: "Message successfully decoded",
      });
    } catch (error) {
      let message = "An unexpected error occurred";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Decoding failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDecoding(false);
    }
  }, [encodedImage, key, toast]);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Encoded Image</h2>
          {!encodedImage ? (
            <DropZone onFileDrop={handleFileDrop} />
          ) : (
            <div className="space-y-4">
              <ImagePreview image={encodedImage} alt="Encoded image" />
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  {encodedImage.name} ({Math.round(encodedImage.size / 1024)} KB)
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEncodedImage(null)}
                >
                  Change
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Decoded Message</h2>
          <div className="relative min-h-[200px]">
            {isDecoding ? (
              <Card className="p-6 w-full h-full flex flex-col items-center justify-center gap-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Decoding the message...</p>
                <ProgressBar value={progress} className="w-full max-w-[200px]" />
              </Card>
            ) : (
              <Card className="p-6 w-full h-full">
                {decodedMessage ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Decoded Message:</h3>
                    <div className="p-3 bg-muted/50 rounded-md max-h-[200px] overflow-y-auto">
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {decodedMessage}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm flex items-center justify-center h-full">
                    Decoded message will appear here
                  </p>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="decode-key">Encryption Key</Label>
          <Input
            id="decode-key"
            type="password"
            placeholder="Enter the secret key used for encoding..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={isDecoding}
          />
          <p className="text-xs text-muted-foreground">
            You need the exact same key that was used to encode the message.
          </p>
        </div>
        
        <Button
          className="w-full"
          onClick={handleDecode}
          disabled={isDecoding || !encodedImage || !key.trim()}
        >
          {isDecoding ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Decoding...
            </>
          ) : (
            <>
              Decode Message
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
