import { encryptMessage, decryptMessage } from './crypto';

// Maximum file size (25MB)
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

// Function to check if the file is PNG
export function isPNG(file: File): boolean {
  return file.type === 'image/png';
}

// Function to check if the file size is acceptable
export function isFileSizeAcceptable(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

// Function to calculate maximum message length based on image dimensions
export function calculateMaxMessageLength(width: number, height: number): number {
  // Each pixel can store 3 bits (1 in each RGB channel)
  // We reserve the first 32 pixels for message length storage
  const availablePixels = width * height - 32;
  // Convert to bytes (8 bits per byte)
  return Math.floor((availablePixels * 3) / 8);
}

// Function to encode message into an image
export async function encodeMessage(
  imageFile: File, 
  message: string, 
  key: string,
  progressCallback: (progress: number) => void
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create Image element and load the file
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      img.onload = async () => {
        try {
          // Encrypt the message and get base64 string
          const encryptedBase64 = encryptMessage(message, key); // already base64 string
          console.log('[ENCODE] encryptedBase64:', encryptedBase64);

          // Convert base64 string to Uint8Array (ASCII)
          const base64Bytes = Array.from(encryptedBase64).map(c => c.charCodeAt(0));

          // Create a canvas and draw the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          // Convert the encrypted base64 bytes to binary
          const msgLengthBinary = base64Bytes.length.toString(2).padStart(32, '0');
          const msgBinary = base64Bytes.map(byte => byte.toString(2).padStart(8, '0')).join('');
          const totalBinary = msgLengthBinary + msgBinary;
          console.log('[ENCODE] base64 length:', base64Bytes.length, 'binary length:', msgBinary.length);

          // Hide the binary data in the least significant bits of the pixels
          let pixelIndex = 0;
          let channelIndex = 0;
          for (let i = 0; i < totalBinary.length; i++) {
            // RGB channels are at indices 0, 1, 2, followed by Alpha at index 3
            const rgbIndex = (pixelIndex * 4) + channelIndex;
            if (rgbIndex < pixels.length) {
              pixels[rgbIndex] = (pixels[rgbIndex] & 0xFE) | parseInt(totalBinary[i]);
            } else {
              throw new Error('Image is too small to store the message');
            }
            channelIndex++;
            if (channelIndex === 3) {
              channelIndex = 0;
              pixelIndex++;
            }
            // Update progress every 1000 bits
            if (i % 1000 === 0) {
              progressCallback(Math.min(99, Math.floor((i / totalBinary.length) * 100)));
            }
          }
          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              progressCallback(100);
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          }, 'image/png');
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    } catch (error) {
      reject(error);
    }
  });
}

// Function to decode message from an image
export async function decodeMessage(
  imageFile: File, 
  key: string,
  progressCallback: (progress: number) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create Image element and load the file
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      img.onload = async () => {
        try {
          // Create a canvas and draw the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          // Extract message length first (32 bits)
          let msgLengthBinary = '';
          let pixelIndex = 0;
          let channelIndex = 0;
          for (let i = 0; i < 32; i++) {
            const rgbIndex = (pixelIndex * 4) + channelIndex;
            msgLengthBinary += pixels[rgbIndex] & 1;
            channelIndex++;
            if (channelIndex === 3) {
              channelIndex = 0;
              pixelIndex++;
            }
          }
          const msgLength = parseInt(msgLengthBinary, 2);
          if (msgLength <= 0 || msgLength > 1000000) {
            throw new Error('Invalid or no message found in image');
          }

          // Extract the encrypted base64 bytes
          let encryptedBinary = '';
          for (let i = 0; i < msgLength * 8; i++) {
            const rgbIndex = (pixelIndex * 4) + channelIndex;
            encryptedBinary += pixels[rgbIndex] & 1;
            channelIndex++;
            if (channelIndex === 3) {
              channelIndex = 0;
              pixelIndex++;
            }
            // Update progress every 1000 bits
            if (i % 1000 === 0) {
              progressCallback(Math.min(99, Math.floor((i / (msgLength * 8)) * 100)));
            }
          }
          // Convert binary to Uint8Array
          const bytes = new Uint8Array(msgLength);
          for (let i = 0; i < msgLength; i++) {
            const byte = encryptedBinary.substr(i * 8, 8);
            bytes[i] = parseInt(byte, 2);
          }
          // Decode ASCII base64 string (robust, ASCII-safe)
          const encryptedBase64 = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
          console.log('[DECODE] encryptedBase64:', encryptedBase64);
          // Decrypt the message using the base64 string
          const decrypted = decryptMessage(encryptedBase64, key);
          progressCallback(100);
          resolve(decrypted);
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    } catch (error) {
      reject(error);
    }
  });
}
