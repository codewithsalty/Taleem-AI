'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const videoIds = {
  en: 'F7m0gW9uwBo',
  ur: 'oSoZLgFil2U',
};

type Language = 'en' | 'ur';

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: Record<string, unknown>) => YouTubePlayer;
      PlayerState: { PLAYING: number; PAUSED: number };
      ready: (callback: () => void) => void;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (vol: number) => void;
  getVolume: () => number;
  destroy: () => void;
}

export default function VideoPlayer() {
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(30);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const first = document.getElementsByTagName('script')[0];
    first.parentNode?.insertBefore(tag, first);
    window.onYouTubeIframeAPIReady = () => setApiReady(true);
  }, []);

  useEffect(() => {
    if (!apiReady) return;
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    setIsPlaying(false);
    const id = videoIds[selectedLang];
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const div = document.createElement('div');
      div.id = 'youtube-player';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(div);
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          loop: 1,
          playlist: id,
          enablejsapi: 1,
        },
        events: {
          onReady: (e: { target: YouTubePlayer }) => {
            e.target.setVolume(volume);
            setIsPlaying(true);
            setIsMuted(true);
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
          },
        },
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [apiReady, selectedLang]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (playerRef.current.isMuted()) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (playerRef.current) {
      playerRef.current.unMute();
      playerRef.current.setVolume(val);
      setIsMuted(false);
    }
  }, []);

  const handleLangSwitch = useCallback((lang: Language) => {
    setSelectedLang(lang);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        key={selectedLang}
        className="aspect-video w-full rounded-2xl shadow-2xl shadow-primary/40 overflow-hidden relative bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div ref={containerRef} className="w-full h-full relative pointer-events-none">
          <div className="w-full h-full [&_iframe]:pointer-events-none" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
          <div className="flex-1" onClick={togglePlay} />

          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-2xl pointer-events-auto cursor-pointer"
                  onClick={togglePlay}
                >
                  <Play className="w-9 h-9 text-white fill-white ml-1" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={togglePlay}
              className="text-white/80 hover:text-white transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleMute}
              className="text-white/80 hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 accent-white cursor-pointer"
              aria-label="Volume"
            />
          </div>
        </div>
      </motion.div>

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
