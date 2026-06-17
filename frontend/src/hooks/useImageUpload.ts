import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);

  const clearImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64Data(null);
  }, [previewUrl]);

  const handleFileSelect = useCallback((file: File) => {
    // 5MB Limit Check
    const maxLimit = 5 * 1024 * 1024;
    if (file.size > maxLimit) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    // MIME Type Check
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported format. Please select a PNG, JPG, JPEG, WEBP, or GIF image.');
      return;
    }

    // Set selected file and preview
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Convert file to base64 string for persistent chat UI
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Data(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Failed to parse image data.');
    };
    reader.readAsDataURL(file);
  }, []);

  // Cleanup object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    selectedFile,
    previewUrl,
    base64Data,
    handleFileSelect,
    clearImage
  };
};
export default useImageUpload;
