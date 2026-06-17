import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker to use CDN for robust bundling in Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface AttachedDocument {
  name: string;
  type: string;
  size: number;
  extractedText: string;
}

export const useDocumentUpload = () => {
  const [attachedDocument, setAttachedDocument] = useState<AttachedDocument | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
      reader.readAsText(file);
    });
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 50); // Hard limit to 50 pages to prevent massive context overflow

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      if (pdf.numPages > 50) {
        fullText += '\n\n[System Note: Document truncated at 50 pages to fit within memory limits.]';
      }

      return fullText.trim();
    } catch (err) {
      console.error("PDF Extraction error:", err);
      throw new Error("Failed to extract text from PDF. The document may be corrupted or protected.");
    }
  };

  const handleDocumentSelect = async (file: File) => {
    setDocumentError(null);
    setIsExtracting(true);

    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds the 10MB limit.');
      }

      const extension = file.name.split('.').pop()?.toLowerCase();
      let extractedText = '';

      if (extension === 'pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (['txt', 'md', 'csv', 'json'].includes(extension || '')) {
        extractedText = await extractTextFromFile(file);
      } else {
        throw new Error('Unsupported file type. Please upload PDF, TXT, MD, or CSV.');
      }

      if (!extractedText.trim()) {
        throw new Error('No readable text found in the document.');
      }

      setAttachedDocument({
        name: file.name,
        type: file.type,
        size: file.size,
        extractedText
      });

    } catch (err: any) {
      setDocumentError(err.message || 'An unknown error occurred while processing the document.');
    } finally {
      setIsExtracting(false);
    }
  };

  const clearDocument = useCallback(() => {
    setAttachedDocument(null);
    setDocumentError(null);
  }, []);

  return {
    attachedDocument,
    isExtracting,
    documentError,
    handleDocumentSelect,
    clearDocument
  };
};
