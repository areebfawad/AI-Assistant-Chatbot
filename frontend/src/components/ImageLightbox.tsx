import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  return (
    <AnimatePresence>
      {imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Black Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
          />

          {/* Lightbox Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 210 }}
            className="relative max-w-[95vw] max-h-[90vh] z-10 select-none pointer-events-auto"
          >
            {/* Top Close Control */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 rounded-full bg-brand-card/80 border border-brand-border text-brand-text hover:text-brand-primary transition-colors focus:outline-none"
              title="Close Fullscreen View"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Lightbox Image */}
            <img
              src={imageUrl}
              alt="Zoomed preview"
              className="rounded-xl shadow-glow border border-brand-border max-w-full max-h-[85vh] object-contain"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default ImageLightbox;
