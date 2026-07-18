
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Play, AlertCircle } from 'lucide-react';

const videoUrls = {
  en: {
    src: 'https://drive.google.com/uc?export=download&id=1eTnY4DXDgkiTBLfgS9mmHkihPfybzgb_&confirm=t',
    poster: '',
  },
  ur: {
    src: 'https://drive.google.com/uc?export=download&id=1RgVefW0W1hy5N-vbD_TqZJBJnKvIfcA0&confirm=t',
    poster: '',
  },
};

type Language = 'en' | 'ur';

export default function VideoPlayer() {
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasError(true));
    }
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsPlaying(false);
  }, []);

  const handleLangSwitch = useCallback((lang: Language) => {
    setSelectedLang(lang);
    setIsPlaying(false);
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const currentVideo = videoUrls[selectedLang];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        key={selectedLang}
        className="aspect-video w-full rounded-2xl shadow-2xl shadow-primary/40 overflow-hidden relative bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={currentVideo.src}
          playsInline
          loop
          controls={isPlaying}
          preload="none"
          className="w-full h-full object-cover"
          onError={handleError}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Click-to-play overlay — visible when not playing and no error */}
        <AnimatePresence>
          {!isPlaying && !hasError && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              onClick={handlePlay}
            >
              {currentVideo.poster && (
                <img
                  src={currentVideo.poster}
                  alt="Video thumbnail"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

              {/* Play button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-2xl"
              >
                <Play className="w-9 h-9 text-white fill-white ml-1" />
              </motion.div>

              <p className="relative z-10 mt-4 text-white/80 text-sm font-medium">
                Click to play demo
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 gap-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
            <div className="text-center px-4">
              <p className="font-semibold text-foreground">Video unavailable</p>
              <p className="text-sm text-muted-foreground mt-1">
                The demo video could not be loaded. Please check back later.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Language toggle */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          onClick={() => handleLangSwitch('en')}
          variant={selectedLang === 'en' ? 'default' : 'outline'}
          className={cn(
            'transition-all duration-200',
            selectedLang === 'en' && 'shadow-lg shadow-primary/30'
          )}
        >
          Watch in English
        </Button>
        <Button
          onClick={() => handleLangSwitch('ur')}
          variant={selectedLang === 'ur' ? 'default' : 'outline'}
          className={cn(
            'transition-all duration-200',
            selectedLang === 'ur' && 'shadow-lg shadow-primary/30'
          )}
        >
          اردو میں دیکھیں
        </Button>
      </div>
    </div>
  );
}
