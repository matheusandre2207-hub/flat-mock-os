import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Volume2, Music, ListMusic
} from 'lucide-react';
import { Track } from '../types';

interface MusicPlayerProps {
  tracks: Track[];
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (n: number) => void;
  volume: number;
  setVolume: (n: number) => void;
  darkMode: boolean;
}

export default function MusicPlayer({
  tracks,
  isPlaying,
  setIsPlaying,
  currentTrackIndex,
  setCurrentTrackIndex,
  volume,
  setVolume,
  darkMode
}: MusicPlayerProps) {
  const [progress, setProgress] = useState(30); // 0 to 100 percentage
  const [currentTimeSec, setCurrentTimeSec] = useState(45);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const activeTrack = tracks[currentTrackIndex] || tracks[0];

  // Simulated song timer progression when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= activeTrack.durationSec) {
            // Song ended
            if (isRepeat) {
              return 0; // restart
            } else {
              handleNext();
              return 0;
            }
          }
          const nextSec = prev + 1;
          setProgress(Math.round((nextSec / activeTrack.durationSec) * 100));
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrackIndex, isRepeat]);

  // Synchronize progress and duration when track changes
  useEffect(() => {
    setProgress(0);
    setCurrentTimeSec(0);
  }, [currentTrackIndex]);

  const handleNext = () => {
    if (isShuffle) {
      const rand = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(rand);
    } else {
      setCurrentTrackIndex((currentTrackIndex + 1) % tracks.length);
    }
  };

  const handlePrev = () => {
    if (currentTimeSec > 3) {
      // restart current song
      setCurrentTimeSec(0);
      setProgress(0);
    } else {
      // previous song
      const prevIdx = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIdx);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    const newTimeSec = Math.round((newProgress / 100) * activeTrack.durationSec);
    setCurrentTimeSec(newTimeSec);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`h-full flex flex-col md:flex-row rounded-none overflow-y-auto no-scrollbar pb-24 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Immersive Audio Visual Player Screen */}
      <div className={`flex-1 pt-3 pb-6 px-5 flex flex-col justify-center items-center relative ${
        darkMode ? 'bg-gradient-to-b from-slate-900 to-black' : 'bg-gradient-to-b from-slate-100 to-white'
      }`}>
        <div className="text-center space-y-4 w-full max-w-sm">
          
          {/* SPINNING VINYL CD COVER ART */}
          <div className="relative mx-auto w-44 h-44 flex items-center justify-center">
            {/* Spinning Disc container */}
            <div className={`absolute inset-0 rounded-full bg-black border-4 border-slate-700 shadow-2xl flex items-center justify-center spin-vinyl ${
              isPlaying ? '' : 'spin-vinyl-paused'
            }`}>
              {/* Grooves */}
              <div className="absolute inset-2.5 rounded-full border border-slate-800" />
              <div className="absolute inset-5 rounded-full border border-slate-800/60" />
              <div className="absolute inset-8 rounded-full border border-slate-900" />
              
              {/* Dynamic Album Cover Center Artwork */}
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${activeTrack.color} flex items-center justify-center text-white font-black shadow-lg border border-black`}>
                🎵
              </div>
            </div>
            
            {/* Tone arm needle simulator icon */}
            <div className={`absolute top-0 right-4 w-12 h-16 origin-top transition-transform duration-500 ${
              isPlaying ? 'rotate-12' : 'rotate-0'
            }`}>
              <div className="w-1 bg-slate-400 h-10 mx-auto rounded-full" />
              <div className="w-2 h-2 bg-slate-500 rounded-full mx-auto" />
            </div>
          </div>

          {/* Song Details Title */}
          <div>
            <h3 className="font-extrabold text-lg tracking-tight truncate">{activeTrack.title}</h3>
            <p className="text-xs opacity-60 font-medium truncate mt-0.5">{activeTrack.artist}</p>
          </div>

          {/* DYNAMIC SPECTRUM ANALYZER BARS */}
          <div className="h-10 flex items-end justify-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((b, i) => (
              <div 
                key={i} 
                className={`w-1 rounded-full bg-blue-600 transition-all ${
                  isPlaying ? `audio-bar-${(i % 5) + 1}` : 'h-1.5 bg-slate-500/40'
                }`}
              />
            ))}
          </div>

          {/* Scrubbable Seek Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-1 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-mono opacity-50">
              <span>{formatTime(currentTimeSec)}</span>
              <span>{activeTrack.duration}</span>
            </div>
          </div>

          {/* Music Playback Panel buttons */}
          <div className="flex justify-between items-center px-4">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1.5 transition-colors ${isShuffle ? 'text-blue-500' : 'opacity-40 hover:opacity-100'}`}
              title="Embaralhar"
            >
              <Shuffle size={16} />
            </button>

            <button 
              onClick={handlePrev}
              className="p-1.5 opacity-80 hover:opacity-100 active:scale-90 transition-all"
              title="Anterior"
            >
              <SkipBack size={20} />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer"
              title={isPlaying ? "Pausar" : "Tocar"}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>

            <button 
              onClick={handleNext}
              className="p-1.5 opacity-80 hover:opacity-100 active:scale-90 transition-all"
              title="Próxima"
            >
              <SkipForward size={20} />
            </button>

            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-1.5 transition-colors ${isRepeat ? 'text-blue-500' : 'opacity-40 hover:opacity-100'}`}
              title="Repetir"
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Quick inline Volume capsule slider */}
          <div className="flex items-center gap-2 justify-center pt-2.5 opacity-70">
            <Volume2 size={12} />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={e => setVolume(parseInt(e.target.value))}
              className="w-24 h-1 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

        </div>
      </div>

      {/* Track List Sidebar */}
      <div className={`w-full md:w-64 border-t md:border-t-0 md:border-l flex flex-col px-5 py-4 ${
        darkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'
      }`}>
        <h4 className="text-xs font-extrabold uppercase tracking-widest opacity-60 mb-3 flex items-center gap-1.5">
          <ListMusic size={14} className="text-blue-500" /> Playlist
        </h4>
        <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar max-h-48 md:max-h-none">
          {tracks.map((track, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
              className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 text-left text-xs transition-colors ${
                currentTrackIndex === idx
                  ? 'bg-blue-600 text-white font-bold'
                  : (darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5')
              }`}
            >
              <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${track.color} flex items-center justify-center text-[10px]`}>
                {currentTrackIndex === idx && isPlaying ? "⚡" : "🎵"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold">{track.title}</p>
                <p className="truncate text-[10px] opacity-70">{track.artist}</p>
              </div>
              <span className="font-mono text-[10px] opacity-60">{track.duration}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
