import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, ZoomIn, ZoomOut, Sliders, Play, X, Zap, Maximize, Smile, Image } from 'lucide-react';

interface CameraAppProps {
  darkMode: boolean;
  isActive?: boolean;
}

interface CapturedPhoto {
  id: string;
  url: string;
  filter: string;
  timestamp: string;
}

export default function CameraApp({ darkMode, isActive = true }: CameraAppProps) {
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeFilter, setActiveFilter] = useState<'none' | 'retro' | 'cyber' | 'mono' | 'warm'>('none');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [viewingPhoto, setViewingPhoto] = useState<CapturedPhoto | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    async function startCamera() {
      if (!isActive) return;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const constraints = {
            video: { 
              facingMode: facingMode,
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          };
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          activeStream = mediaStream;
          setStream(mediaStream);
          setHasCamera(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          setHasCamera(false);
        }
      } catch (err) {
        console.warn("Real camera denied, unavailable or blocked by policy/iframe. Switching to high-fidelity mock viewfinder.", err);
        setHasCamera(false);
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, isActive]);

  // Handle stream update on component unmount/mount
  useEffect(() => {
    if (hasCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [hasCamera, stream]);

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      if (direction === 'in') return Math.min(3.0, prev + 0.2);
      return Math.max(1.0, prev - 0.2);
    });
  };

  // Synthesize a quick crisp shutter click sound
  const playShutterSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const noise = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

      noise.type = 'triangle';
      noise.frequency.setValueAtTime(1200, ctx.currentTime);
      noise.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      noise.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      noise.start();
      osc.stop(ctx.currentTime + 0.12);
      noise.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // AudioContext fails gracefully
    }
  };

  const capturePhoto = () => {
    setIsCapturing(true);
    playShutterSound();

    // Trigger flash animation
    setTimeout(() => {
      setIsCapturing(false);
      
      // Build mock canvas or placeholder image URL based on selected filter and state
      const id = String(Date.now());
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // We generate beautiful colored canvas-like mock photos depending on filters
      let baseColor = 'from-sky-400 to-indigo-600';
      if (activeFilter === 'retro') baseColor = 'from-amber-600 to-orange-950';
      else if (activeFilter === 'cyber') baseColor = 'from-purple-600 via-pink-500 to-cyan-500';
      else if (activeFilter === 'mono') baseColor = 'from-slate-800 to-slate-900';
      else if (activeFilter === 'warm') baseColor = 'from-yellow-500 to-red-500';

      const newPhoto: CapturedPhoto = {
        id,
        url: baseColor, // store gradient classes
        filter: activeFilter,
        timestamp: timeStr
      };

      setCapturedPhotos(prev => [newPhoto, ...prev]);
    }, 150);
  };

  const getFilterStyle = () => {
    switch (activeFilter) {
      case 'retro': return 'sepia contrast-[1.1] brightness-[0.95] hue-rotate-[10deg]';
      case 'cyber': return 'hue-rotate-[140deg] saturate-[1.6] contrast-[1.2]';
      case 'mono': return 'grayscale contrast-[1.3] brightness-[1.05]';
      case 'warm': return 'saturate-[1.3] brightness-[1.02] sepia-[0.15] contrast-[1.05]';
      default: return '';
    }
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-between font-sans select-none relative overflow-hidden">
      
      {/* Lightbox Photo Viewer overlay */}
      {viewingPhoto && (
        <div className="absolute inset-0 z-50 bg-black/98 flex flex-col justify-between p-6 animate-fade-in">
          <div className="flex justify-between items-center pb-4">
            <span className="text-xs font-semibold text-slate-400">Capturado às {viewingPhoto.timestamp}</span>
            <button 
              onClick={() => setViewingPhoto(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white border-none cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Full size photo display */}
          <div className="flex-1 flex items-center justify-center p-2">
            <div 
              className={`w-full aspect-[3/4] max-w-sm rounded-3xl bg-gradient-to-tr ${viewingPhoto.url} shadow-2xl relative overflow-hidden flex flex-col justify-between p-6`}
            >
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="text-center space-y-2 select-none opacity-80 scale-110">
                  <span className="text-4xl block">📸</span>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/90">Mock Capture</p>
                  <p className="text-[8px] font-mono tracking-wider text-white/50">{viewingPhoto.filter.toUpperCase()} FILTER • ZOOM {zoomLevel.toFixed(1)}X</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-4">
            <button 
              onClick={() => {
                setCapturedPhotos(prev => prev.filter(p => p.id !== viewingPhoto.id));
                setViewingPhoto(null);
              }}
              className="px-6 py-2.5 rounded-full bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-bold border-none cursor-pointer"
            >
              Excluir Foto
            </button>
          </div>
        </div>
      )}

      {/* Screen White Flash Overlay */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white z-40 animate-pulse pointer-events-none" />
      )}

      {/* Top Controls Header */}
      <header className="px-5 py-3.5 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setFlashOn(!flashOn)}
            className={`p-2 rounded-full border-none cursor-pointer transition-colors ${flashOn ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}
            title="Flash Toggle"
          >
            <Zap size={15} />
          </button>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">RESOLUÇÃO: 1080P</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleZoom('out')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white border-none cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[11px] font-mono font-bold px-1.5 w-10 text-center">{zoomLevel.toFixed(1)}x</span>
          <button 
            onClick={() => handleZoom('in')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white border-none cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </header>

      {/* Viewfinder stage */}
      <div className="flex-1 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
        {hasCamera ? (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted
            className={`w-full h-full object-cover select-none pointer-events-none transition-all duration-300 ${getFilterStyle()}`}
            style={{ transform: `scale(${zoomLevel}) ${facingMode === 'user' ? 'scaleX(-1)' : ''}` }}
          />
        ) : (
          /* HIGH-FIDELITY VIEWPORT SIMULATION (Parallax moving sky / filter scene) */
          <div 
            className={`w-full h-full bg-gradient-to-b from-slate-900 to-indigo-950 relative flex items-center justify-center transition-all duration-300 ${getFilterStyle()}`}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Viewfinder crosshairs and guidelines */}
            <div className="absolute inset-8 border border-white/5 pointer-events-none flex items-center justify-center">
              <div className="w-4 h-4 border-l border-t border-white/20 absolute top-0 left-0" />
              <div className="w-4 h-4 border-r border-t border-white/20 absolute top-0 right-0" />
              <div className="w-4 h-4 border-l border-b border-white/20 absolute bottom-0 left-0" />
              <div className="w-4 h-4 border-r border-b border-white/20 absolute bottom-0 right-0" />
              <div className="w-1.5 h-1.5 bg-white/15 rounded-full" />
            </div>

            {/* Immersive moving SVG cosmic landscape for the simulator */}
            <div className="w-44 h-44 rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-600/30 to-cyan-500/10 blur-xl animate-pulse absolute" />
            
            <div className="text-center z-10 space-y-3 p-4">
              <span className="text-5xl block animate-bounce">🪐</span>
              <div>
                <p className="text-xs font-bold tracking-widest text-slate-300">Câmera Virtual</p>
                <p className="text-[9px] text-slate-500 font-medium uppercase mt-1">Toque no botão central para capturar</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Filter Indicator Capsule */}
        {activeFilter !== 'none' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border border-white/10">
            Filtro: {activeFilter}
          </div>
        )}
      </div>

      {/* Bottom Camera Dashboard Toolbar */}
      <footer className="bg-black/90 px-6 py-6 space-y-6 z-10">
        
        {/* Filters Carousel Scroll */}
        <div className="flex justify-center gap-3.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'none', label: 'Normal', color: 'bg-slate-700' },
            { id: 'retro', label: 'Vintage', color: 'bg-amber-800' },
            { id: 'cyber', label: 'Cyber', color: 'bg-fuchsia-800' },
            { id: 'mono', label: 'P&B', color: 'bg-slate-500' },
            { id: 'warm', label: 'Quente', color: 'bg-orange-600' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border-none cursor-pointer ${
                activeFilter === f.id 
                  ? 'bg-blue-600 text-white scale-105' 
                  : 'bg-white/10 hover:bg-white/15 text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Shutter core console */}
        <div className="flex justify-between items-center px-4">
          
          {/* Bottom-left: Last Captured Image thumbnail */}
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center">
            {capturedPhotos.length > 0 ? (
              <button 
                onClick={() => setViewingPhoto(capturedPhotos[0])}
                className={`w-full h-full bg-gradient-to-tr ${capturedPhotos[0].url} border-none cursor-pointer`}
              />
            ) : (
              <span className="text-xs text-slate-600">📁</span>
            )}
          </div>

          {/* Center: Big circular shutter button */}
          <button 
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-none cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-[52px] h-[52px] rounded-full border-2 border-black bg-white flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-red-600" />
            </div>
          </button>

          {/* Bottom-right: Rotate camera toggle */}
          <button 
            onClick={toggleFacingMode}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 active:scale-90 flex items-center justify-center border-none cursor-pointer transition-transform text-white"
            title="Girar Câmera"
          >
            <RefreshCw size={18} />
          </button>

        </div>
      </footer>
    </div>
  );
}
