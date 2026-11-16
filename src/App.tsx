import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, WifiOff, Bluetooth, Signal, Plane, Moon, Sun, 
  Volume2, VolumeX, Sliders, Search, User, Folder, FileText, 
  Image as ImageIcon, Music as MusicIcon, Globe, Settings, 
  ChevronRight, ChevronLeft, X, Play, Pause, SkipForward, SkipBack, 
  Send, Trash2, Clock, Smartphone, RotateCw, Bell, MessageSquare, Plus, Minus,
  Grid, Compass, FolderClosed, PlayCircle, Eye, EyeOff, Maximize, Minimize, Check,
  Calculator as CalculatorIcon, MessageCircle, NotebookPen, Bird, CloudSun, Palette,
  Phone, Users, Camera, ShoppingBag, SunMedium, BellOff, ChevronDown
} from 'lucide-react';

import { Wallpaper, NotificationItem, PopupNotification, Track, Chat, Folder as FolderType, Contact, CapturedPhoto } from './types';
import { wallpapersList, initialNotifications, tracksList, initialChats, initialFolders } from './data';
import { generateBackgroundCheckIn } from './ai/LocalAIEngine';

// Component imports
import BatteryDots from './components/BatteryDots';
import ClockFace from './components/ClockFace';
import { WidgetView, WIDGETS } from './components/Widgets';
import { usePrefs } from './prefs';
import { COLS, ROWS, resolveLayout, occupiedCells, findFree, WidgetItem } from './homeGrid';
import Calculator from './components/Calculator';
import SettingsApp from './components/SettingsApp';
import MessagesApp from './components/MessagesApp';
import MusicPlayer from './components/MusicPlayer';
import Browser from './components/Browser';
import FilesApp from './components/FilesApp';
import StoreApp from './components/StoreApp';
import NotesApp from './components/NotesApp';
import FlappyApp from './components/FlappyApp';
import WeatherApp from './components/WeatherApp';
import PaintApp from './components/PaintApp';
import PhoneApp from './components/PhoneApp';
import ContactsApp from './components/ContactsApp';
import CameraApp from './components/CameraApp';
import BootSetupScreen from './components/BootSetupScreen';
import LockScreen from './components/LockScreen';
import SwipeDismiss from './components/SwipeDismiss';
import SignInScreen from './components/SignInScreen';
import GalleryApp from './components/GalleryApp';
import SystemKeyboard from './components/SystemKeyboard';
import StatusPills from './components/StatusPills';
import { BUNDLED_APPS, isBundledId } from './bundledApps';
import { listMedia, putMedia, deleteMedia, audioFromFile, fmtDuration, TRACK_COLORS, type MediaItem } from './mediaStorage';
import type { Track as MediaTrack } from './types';
import { getAccount, isSignedIn, signOut, type PublicAccount } from './accountDb';
import { CustomApp, setCustomAppRegistry, getCustomApp, isCustomAppId, withThemeBridge } from './customApps';
import { loadAllApps, putApp, deleteApp, deleteAppFiles } from './appStorage';
import { folderUrl, registerFolderServer } from './folderApps';
import { setScreenSize, screenW, screenH, stageFor } from './screenMetrics';
import { useWallpaperTint, setIconTint, getIconTint, tintBackground, buildAccentPalette, buildAppTheme } from './wallpaperTint';

// Animated Matrix Code wallpaper component
function MatrixWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$@#&%';
    const fontSize = 11;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const ypos = Array(columns).fill(0);
    
    let animationId: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#10b981'; // beautiful emerald green
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < ypos.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = ypos[i];
        
        ctx.fillText(text, x, y);
        
        if (y > 100 + Math.random() * 10000) {
          ypos[i] = 0;
        } else {
          ypos[i] = y + fontSize;
        }
      }
      animationId = requestAnimationFrame(draw);
    };
    
    let lastTime = 0;
    const tick = (time: number) => {
      if (time - lastTime > 40) {
        draw();
        lastTime = time;
      } else {
        animationId = requestAnimationFrame(tick);
      }
    };
    animationId = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-35" />;
}

// Animated floating particles wallpaper component
function ParticlesWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const count = 35;
    const particles: Array<{ x: number; y: number; r: number; d: number; speed: number; color: string }> = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 360),
        y: Math.random() * (canvas.height || 740),
        r: Math.random() * 2 + 1,
        d: Math.random() * count,
        speed: Math.random() * 0.4 + 0.1,
        color: `rgba(${Math.floor(Math.random() * 50 + 205)}, ${Math.floor(Math.random() * 100 + 155)}, 255, ${Math.random() * 0.5 + 0.35})`
      });
    }
    
    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        ctx.fill();
        
        p.y -= p.speed;
        p.x += Math.sin(p.d) * 0.15;
        
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-65" />;
}

// Animated Liquid Metal Chrome simulation component
function LiquidMetalWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    let animationId: number;
    let time = 0;
    const draw = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      
      for (let layer = 0; layer < 4; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 10) {
          const y = h * 0.45 + Math.sin(x * 0.008 + time * 1.5 + layer) * 50 + Math.cos(x * 0.005 - time + layer * 1.2) * 35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        
        const grad = ctx.createLinearGradient(0, h * 0.3, 0, h);
        grad.addColorStop(0, `rgba(180, 185, 195, ${0.12 - layer * 0.02})`);
        grad.addColorStop(0.5, `rgba(100, 105, 115, ${0.08 - layer * 0.015})`);
        grad.addColorStop(1, 'rgba(9, 9, 11, 0)');
        
        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.strokeStyle = `rgba(220, 225, 235, ${0.25 - layer * 0.05})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      
      time += 0.006;
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />;
}

// Animated Shifting Gradient component
function GradientShiftWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    let animationId: number;
    let hue = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, Math.max(w, h));
      grad.addColorStop(0, `hsla(${hue}, 70%, 45%, 0.15)`);
      grad.addColorStop(0.5, `hsla(${(hue + 120) % 360}, 65%, 35%, 0.1)`);
      grad.addColorStop(1, `hsla(${(hue + 240) % 360}, 60%, 25%, 0.05)`);
      
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      
      hue = (hue + 0.15) % 360;
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// Animated Ocean Waves component
function OceanWavesWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    let animationId: number;
    let time = 0;
    const draw = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      
      const waveColors = [
        'rgba(14, 116, 144, 0.18)',
        'rgba(3, 105, 161, 0.12)',
        'rgba(29, 78, 216, 0.08)'
      ];
      
      waveColors.forEach((color, idx) => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        
        const frequency = 0.006 + idx * 0.002;
        const speed = 0.015 + idx * 0.005;
        const amplitude = 30 - idx * 5;
        
        for (let x = 0; x <= w; x += 12) {
          const y = h * 0.65 + idx * 40 + Math.sin(x * frequency + time * speed) * amplitude;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 - idx * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      time += 0.8;
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// Animated Geometric Saturn wireframe component
function GeometricSaturnWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    let animationId: number;
    let angle = 0;
    
    const draw = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.2);
      
      ctx.beginPath();
      ctx.ellipse(0, 0, 85, 25, angle * 0.1, Math.PI, 0, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let r = 5; r <= 35; r += 7) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 35, 35 * Math.sin(j * Math.PI / 4 + angle * 0.1), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.ellipse(0, 0, 85, 25, angle * 0.1, 0, Math.PI, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(0, 0, 65, 18, angle * 0.1, 0, Math.PI, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
      
      angle += 0.04;
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
}

// Animated Cyber Neon perspective component
function CyberNeonWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    let animationId: number;
    let offset = 0;
    
    const draw = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.05)';
      ctx.lineWidth = 1;
      
      const horizon = h * 0.4;
      
      for (let x = -w; x <= w * 2; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x + offset, h);
        ctx.lineTo(w / 2, horizon);
        ctx.stroke();
      }
      
      for (let y = horizon; y <= h; y += (h - y) * 0.2 + 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      
      const time = Date.now() * 0.001;
      ctx.shadowBlur = 8;
      for (let i = 0; i < 8; i++) {
        const x = (Math.sin(i * 100 + time * 0.2) * 0.4 + 0.5) * w;
        const y = horizon - 20 - (i * 20) % (horizon - 20);
        const radius = Math.abs(Math.sin(time + i)) * 1.5 + 1;
        const neonColor = i % 2 === 0 ? 'rgba(6, 182, 212, 0.5)' : 'rgba(236, 72, 153, 0.5)';
        
        ctx.fillStyle = neonColor;
        ctx.shadowColor = neonColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      
      offset = (offset + 0.2) % 40;
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-65" />;
}

// Animated Starfield Warp component
function StarfieldWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const starCount = 60;
    const stars: Array<{ x: number; y: number; z: number }> = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 1000
      });
    }
    
    let animationId: number;
    const draw = () => {
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      for (let i = 0; i < starCount; i++) {
        const s = stars[i];
        s.z -= 4.5;
        if (s.z <= 0) {
          s.z = 1000;
          s.x = Math.random() * 2000 - 1000;
          s.y = Math.random() * 2000 - 1000;
        }
        
        const k = 128 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;
        
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - s.z / 1000) * 2.2;
          const alpha = 1 - s.z / 1000;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />;
}

// Animated Lava Lamp component
function LavaLampWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 740;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const blobCount = 5;
    const blobs: Array<{ x: number; y: number; r: number; speed: number; angle: number; color: string }> = [];
    const colors = [
      'rgba(244, 63, 94, 0.08)',
      'rgba(249, 115, 22, 0.07)',
      'rgba(168, 85, 247, 0.08)',
      'rgba(6, 182, 212, 0.07)',
      'rgba(236, 72, 153, 0.08)'
    ];
    for (let i = 0; i < blobCount; i++) {
      blobs.push({
        x: Math.random() * (canvas.width || 360),
        y: Math.random() * (canvas.height || 740),
        r: Math.random() * 50 + 60,
        speed: Math.random() * 0.3 + 0.15,
        angle: Math.random() * Math.PI * 2,
        color: colors[i % colors.length]
      });
    }
    
    let animationId: number;
    const draw = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      blobs.forEach(b => {
        b.y -= b.speed;
        b.x += Math.sin(b.angle) * 0.2;
        b.angle += 0.01;
        
        if (b.y < -b.r) {
          b.y = canvas.height + b.r;
          b.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        const radGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        radGrad.addColorStop(0, b.color);
        radGrad.addColorStop(1, 'rgba(9, 9, 11, 0)');
        
        ctx.fillStyle = radGrad;
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const baseAppMetadata: Record<string, { label: string; icon: React.ReactNode; iconBgClass: string }> = {
  arquivos:       { label: 'Arquivos',      icon: <Folder />,         iconBgClass: 'tile-blue' },
  calculadora:    { label: 'Calculadora',   icon: <CalculatorIcon />, iconBgClass: 'tile-graphite' },
  configuracoes:  { label: 'Configurações', icon: <Settings />,       iconBgClass: 'tile-gray' },
  galeria:        { label: 'Galeria',       icon: <ImageIcon />,      iconBgClass: 'tile-pink' },
  mensagens:      { label: 'Mensagens',     icon: <MessageCircle />,  iconBgClass: 'tile-green' },
  musica:         { label: 'Música',        icon: <MusicIcon />,      iconBgClass: 'tile-red' },
  navegador:      { label: 'Navegador',     icon: <Globe />,          iconBgClass: 'tile-sky' },
  loja:           { label: 'App Store',     icon: <ShoppingBag />,    iconBgClass: 'tile-teal' },
  notas:          { label: 'Notas',         icon: <NotebookPen />,    iconBgClass: 'tile-amber' },
  flappy:         { label: 'Flappy Bird',   icon: <Bird />,           iconBgClass: 'tile-orange' },
  clima:          { label: 'Clima',         icon: <CloudSun />,       iconBgClass: 'tile-sky' },
  paint:          { label: 'Paint',         icon: <Palette />,        iconBgClass: 'tile-purple' },
  telefone:       { label: 'Telefone',      icon: <Phone />,          iconBgClass: 'tile-green' },
  contatos:       { label: 'Contatos',      icon: <Users />,          iconBgClass: 'tile-indigo' },
  camera:         { label: 'Câmera',        icon: <Camera />,         iconBgClass: 'tile-graphite' }
};

// Ícone de app padronizado: quadrado chapado + glifo branco
function hashId(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Ícone de app: quadrado chapado + glifo branco.
// Com "ícones combinando com o papel de parede", cada app recebe uma pequena variação
// de matiz, saturação e brilho (sempre a mesma para o mesmo app), para não ficar tudo igual.
function AppIcon({ id, size = 52 }: { id: string; size?: number }) {
  const meta = baseAppMetadata[id];
  const custom = meta ? undefined : getCustomApp(id);
  if (!meta && !custom) return null;
  const tint = getIconTint();
  const seed = hashId(id);
  const style = {
    '--s': `${size}px`,
    ...(tint.enabled ? { background: tintBackground(tint.h, tint.s, seed) } : {}),
    ...(custom ? { '--custom-color': custom.color } : {}),
  } as React.CSSProperties;
  if (!meta && custom) {
    const icon = custom.iconUrl;
    return (
      <div className="app-tile tile-custom" style={style}>
        {icon && icon.startsWith('data:image') ? (
          <img src={icon} alt="" className="w-full h-full object-cover" style={{ borderRadius: 'inherit' }} />
        ) : (
          <span className="custom-app-initial">{icon || custom.name.charAt(0).toUpperCase()}</span>
        )}
      </div>
    );
  }
  return (
    <div className={`app-tile ${meta.iconBgClass}`} style={style}>
      {meta.icon}
    </div>
  );
}

// Ícone do app que enviou a notificação (ou um sino, se for de sistema)
function NotifAppIcon({ app }: { app: string }) {
  if (baseAppMetadata[app] || getCustomApp(app)) return <AppIcon id={app} size={36} />;
  return <div className="app-tile tile-gray" style={{ '--s': '36px' } as React.CSSProperties}><Bell size={16} /></div>;
}

// Atalho rápido do painel de configurações
function QSTile({ icon, label, active, disabled, warn, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; disabled?: boolean; warn?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`qs-tile ${active ? 'active' : ''} ${warn ? 'warn' : ''}`}
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const randomIncomingMessages = [
  {
    chatId: 'love',
    name: 'Amor 💖',
    avatar: '💖',
    texts: [
      "Amor, quando chegar me avisa tá? Te amo! 🥰",
      "Queria tanto comer uma pizza hoje de noite... o que acha? 🍕",
      "Terminou o que estava fazendo aí? Me liga! 😘",
      "Você é o melhor, sabia? Passando só pra lembrar! ❤️"
    ]
  },
  {
    chatId: 'friend-lucas',
    name: 'Lucas 🤙',
    avatar: '🤙',
    texts: [
      "Mano, viu o jogo ontem? Que loucura! ⚽",
      "Eae, bora fechar um game hoje mais tarde? 🎮",
      "Tô precisando de uma ajuda com um negócio aqui, depois me liga!",
      "Aquele churrasco do fim de semana tá de pé né? 🥩🍻"
    ]
  },
  {
    chatId: 'grandmother',
    name: 'Vovó 👵',
    avatar: '👵',
    texts: [
      "Meu neto querido, vem comer bolo de cenoura hoje! 👵🍰",
      "Deus te abençoe muito e te proteja sempre. Amém! 🙏",
      "Como você está, meu filho? Manda notícias!",
      "Não fique trabalhando muito nesse computador, faz mal pras vistas! 👵🌸"
    ]
  }
];

type WidgetDrag = {
  id: string;
  w: number;
  h: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  grabC: number;
  grabR: number;
  moved: boolean;
  target: { c: number; r: number } | null;
};

export default function App() {
  // 1. Core System Settings & States
  const [language, setLanguage] = useState<'pt' | 'en'>(() => {
    return (localStorage.getItem('os_language') as 'pt' | 'en') || 'pt';
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('os_user_name') || 'Mateus Oliveira';
  });
  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('os_user_avatar') || '👤';
  });
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem('os_pincode') || '';
  });
  const [isSetupCompleted, setIsSetupCompleted] = useState(() => {
    return localStorage.getItem('os_setup_completed') === 'true';
  });
  const [isBooting, setIsBooting] = useState(true);
  const [isLocked, setIsLocked] = useState(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('os_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('os_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('os_user_avatar', userAvatar);
  }, [userAvatar]);

  useEffect(() => {
    localStorage.setItem('os_pincode', pincode);
  }, [pincode]);

  useEffect(() => {
    localStorage.setItem('os_setup_completed', String(isSetupCompleted));
  }, [isSetupCompleted]);

  // Conta AeroOS: quem existe neste aparelho e se alguém está conectado
  const [account, setAccount] = useState<PublicAccount | null>(() => getAccount());
  const [signedIn, setSignedIn] = useState<boolean>(() => isSignedIn());
  // Pacotes de pasta precisam do Service Worker (HTTPS ou localhost)
  const [folderServer, setFolderServer] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    registerFolderServer().then(ok => setFolderServer(ok ? 'ready' : 'error'));
  }, []);

  // Rotação: palco horizontal dentro da janela. Pode ser ligada em qualquer app (ajuste rápido)
  // ou automaticamente, se o app importado foi marcado para abrir em paisagem.
  const [landscape, setLandscape] = useState(false);
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  // O sistema fica sempre em retrato; a paisagem gira só a janela do app aberto
  const stage = stageFor(false, viewport.w, viewport.h);
  setScreenSize(stage.w, stage.h);


  const [wifiActive, setWifiActive] = useState(true);
  const [bluetoothActive, setBluetoothActive] = useState(true);
  const [cellularActive, setCellularActive] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  // Sem Wi-Fi nem dados (e fora do modo avião), a internet simulada fica offline
  const online = !airplaneMode && (wifiActive || cellularActive);

  // Apps HTML importados pela App Store (guardados no IndexedDB)
  const [storedCustomApps, setCustomApps] = useState<CustomApp[]>([]);
  // Apps que vêm com o sistema (aparecem na loja) + os importados; edições dos embutidos ficam guardadas por cima
  const customApps = useMemo<CustomApp[]>(() => {
    const byId = new Map(storedCustomApps.map(a => [a.id, a] as const));
    return [...BUNDLED_APPS.map(b => byId.get(b.id) ?? b), ...storedCustomApps.filter(a => !isBundledId(a.id))];
  }, [storedCustomApps]);
  useEffect(() => {
    loadAllApps().then(setCustomApps).catch(() => { /* sem apps salvos */ });
  }, []);
  setCustomAppRegistry(customApps);

  // Nomes localizados + ícones padronizados
  const appLabels: Record<string, [string, string]> = {
    arquivos: ['Arquivos', 'Files'],
    calculadora: ['Calculadora', 'Calculator'],
    configuracoes: ['Configurações', 'Settings'],
    galeria: ['Galeria', 'Gallery'],
    mensagens: ['Mensagens', 'Messages'],
    musica: ['Música', 'Music'],
    navegador: ['Navegador', 'Browser'],
    loja: ['App Store', 'App Store'],
    notas: ['Notas', 'Notes'],
    flappy: ['Flappy Bird', 'Flappy Bird'],
    clima: ['Clima', 'Weather'],
    paint: ['Paint', 'Paint'],
    telefone: ['Telefone', 'Phone'],
    contatos: ['Contatos', 'Contacts'],
    camera: ['Câmera', 'Camera']
  };
  const appMetadata: Record<string, { label: string; icon: React.ReactNode; iconBgClass: string }> = {
    ...Object.fromEntries(
      Object.entries(baseAppMetadata).map(([id, m]) => [id, { ...m, label: appLabels[id]?.[language === 'en' ? 1 : 0] ?? m.label }])
    ),
    ...Object.fromEntries(customApps.map(a => [a.id, { label: a.name, icon: null, iconBgClass: 'tile-custom' }])),
  };

  // Theme & screen settings
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('os_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('os_dark_mode', String(darkMode));
  }, [darkMode]);

  const [selectedRingtone, setSelectedRingtone] = useState<string>(() => {
    return localStorage.getItem('os_selected_ringtone') || 'marimba';
  });

  useEffect(() => {
    localStorage.setItem('os_selected_ringtone', selectedRingtone);
  }, [selectedRingtone]);

  const [nightMode, setNightMode] = useState(() => {
    return localStorage.getItem('os_night_mode') === 'true';
  });
  const [brightness, setBrightness] = useState(() => {
    const saved = localStorage.getItem('os_brightness');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('os_volume');
    return saved ? parseInt(saved, 10) : 70;
  });
  const [showVolumeHUD, setShowVolumeHUD] = useState(false);

  useEffect(() => { localStorage.setItem('os_night_mode', String(nightMode)); }, [nightMode]);
  useEffect(() => { localStorage.setItem('os_brightness', String(brightness)); }, [brightness]);
  useEffect(() => { localStorage.setItem('os_volume', String(volume)); }, [volume]);

  // Battery Simulator state managers
  const [useManualBattery, setUseManualBattery] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  // Music Player globally shared state
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Músicas: as de demonstração + as importadas (tocam de verdade num <audio> oculto)
  const [mediaTracks, setMediaTracks] = useState<MediaItem[]>([]);
  const [musicBusy, setMusicBusy] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (audioRef.current === null && typeof Audio !== 'undefined') audioRef.current = new Audio();
  const mediaUrls = useRef<Map<string, string>>(new Map());
  useEffect(() => { listMedia('audio').then(setMediaTracks).catch(() => { /* sem músicas salvas */ }); }, []);
  const importedTracks = useMemo<MediaTrack[]>(() => mediaTracks.map(m => ({
    title: m.name, artist: m.artist || 'Importada', duration: fmtDuration(m.durationSec || 0), durationSec: m.durationSec || 0,
    genre: 'Importada', color: m.color || TRACK_COLORS[0], mediaId: m.id,
  })), [mediaTracks]);
  const allTracks = useMemo<MediaTrack[]>(() => [...tracksList, ...importedTracks], [importedTracks]);
  const activeMediaId = (allTracks[currentTrackIndex] ?? allTracks[0])?.mediaId;
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!activeMediaId) { a.pause(); return; }
    const item = mediaTracks.find(m => m.id === activeMediaId);
    if (!item) return;
    let url = mediaUrls.current.get(activeMediaId);
    if (!url) { url = URL.createObjectURL(item.blob); mediaUrls.current.set(activeMediaId, url); }
    if (a.src !== url) a.src = url;
    if (musicPlaying) a.play().catch(() => setMusicPlaying(false));
  }, [activeMediaId, mediaTracks]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !activeMediaId) return;
    if (musicPlaying) a.play().catch(() => setMusicPlaying(false)); else a.pause();
  }, [musicPlaying, activeMediaId]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, volume / 100)); }, [volume]);

  const handleImportTracks = async (files: FileList) => {
    const list = Array.from(files).filter(f => f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac|opus)$/i.test(f.name));
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      setMusicBusy(`Importando ${i + 1} de ${list.length}…`);
      try {
        const item = await audioFromFile(list[i], i);
        await putMedia(item);
        setMediaTracks(prev => [item, ...prev]);
        ok++;
      } catch { /* arquivo ignorado */ }
    }
    setMusicBusy(list.length === 0 ? 'Nenhum arquivo de áudio válido' : '');
    if (!list.length) window.setTimeout(() => setMusicBusy(''), 2500);
    return ok;
  };
  const handleDeleteTrack = (mediaId: string) => {
    const removed = allTracks.findIndex(t => t.mediaId === mediaId);
    if (removed < 0) return;
    if (removed === currentTrackIndex) { setMusicPlaying(false); audioRef.current?.pause(); }
    setCurrentTrackIndex(i => (i === removed ? 0 : i > removed ? i - 1 : i));
    const u = mediaUrls.current.get(mediaId);
    if (u) { URL.revokeObjectURL(u); mediaUrls.current.delete(mediaId); }
    deleteMedia(mediaId).catch(() => {});
    setMediaTracks(prev => prev.filter(m => m.id !== mediaId));
  };

  // Wallpaper manager
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    const saved = localStorage.getItem('os_wallpapers');
    return saved ? JSON.parse(saved) : wallpapersList;
  });
  const [wallpaperIndex, setWallpaperIndex] = useState(() => {
    const saved = localStorage.getItem('os_wallpaper_index');
    return saved ? parseInt(saved, 10) : 0;
  });
  const currentWallpaper = wallpapers[wallpaperIndex] || wallpapers[0];

  const [lockWallpaperIndex, setLockWallpaperIndex] = useState(() => {
    const saved = localStorage.getItem('os_lock_wallpaper_index');
    return saved ? parseInt(saved, 10) : (localStorage.getItem('os_wallpaper_index') ? parseInt(localStorage.getItem('os_wallpaper_index')!, 10) : 0);
  });
  const currentLockWallpaper = wallpapers[lockWallpaperIndex] || wallpapers[0];
  const [wallpaperTarget, setWallpaperTarget] = useState<'home' | 'lock' | 'both'>('home');

  useEffect(() => { try { localStorage.setItem('os_wallpapers', JSON.stringify(wallpapers)); } catch { /* cota cheia: mantém só na sessão */ } }, [wallpapers]);
  useEffect(() => { localStorage.setItem('os_wallpaper_index', String(wallpaperIndex)); }, [wallpaperIndex]);
  useEffect(() => { localStorage.setItem('os_lock_wallpaper_index', String(lockWallpaperIndex)); }, [lockWallpaperIndex]);

  // Shortcuts on home screen
  const [homeApps, setHomeApps] = useState<string[]>(() => {
    const saved = localStorage.getItem('os_home_apps');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => { localStorage.setItem('os_home_apps', JSON.stringify(homeApps)); }, [homeApps]);
  
  // Home Edit Mode (Jiggle Mode like iOS)
  const [isEditingHome, setIsEditingHome] = useState(false);

  // Drawer Long press state for adding shortcuts
  const [longPressActiveApp, setLongPressActiveApp] = useState<string | null>(null);
  const drawerLongPressTimerRef = useRef<any>(null);
  
  // Apps in the dock (Max 4)
  const [dockApps, setDockApps] = useState<string[]>(() => {
    const saved = localStorage.getItem('os_dock_apps');
    return saved ? JSON.parse(saved) : ['mensagens', 'loja', 'arquivos'];
  });
  useEffect(() => { localStorage.setItem('os_dock_apps', JSON.stringify(dockApps)); }, [dockApps]);

  // Captured Photos for Camera and Gallery
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>(() => {
    const saved = localStorage.getItem('mockos_captured_photos');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => { localStorage.setItem('mockos_captured_photos', JSON.stringify(capturedPhotos)); }, [capturedPhotos]);

  // Drag and Drop State
  const [draggedApp, setDraggedApp] = useState<{
    appId: string;
    isNew: boolean;
    origin: 'drawer' | 'home' | 'dock';
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [dragPosition, setDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOverZone, setDragOverZone] = useState<'home' | 'dock' | 'remove' | null>(null);
  
  const [dragHasMoved, setDragHasMoved] = useState(false);
  const dragStartCoordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const drawerPressCoordsRef = useRef<{ startX: number; startY: number; currentX: number; currentY: number }>({ startX: 0, startY: 0, currentX: 0, currentY: 0 });

  // Wallpaper Long-press Picker state
  const [wallpaperPickerOpen, setWallpaperPickerOpen] = useState(false);
  const longPressTimerRef = useRef<any>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const newWp = {
          name: file.name.split('.')[0] || (language === 'en' ? 'Custom Photo' : 'Foto Personalizada'),
          gradient: `url(${base64}) center/cover no-repeat`,
          isDark: false
        };
        setWallpapers(prev => {
          const updated = [...prev, newWp];
          setSelectedGalleryImg(updated.length - 1);
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // OS Factory Reset
  const handleResetOS = () => {
    localStorage.clear();
    setLanguage('pt');
    setUserName('Mateus Oliveira');
    setUserAvatar('👤');
    setPincode('');
    setAccount(null);
    setSignedIn(false);
    setIsSetupCompleted(false);
    setIsBooting(true);
    setIsLocked(true);
    setActiveApp(null);
    setOpenedApps([]);
    setRecentAppsOpen(false);
    setAppDrawerOpen(false);
    setNotificationsOpen(false);
    setUtilitiesOpen(false);
    setWallpaperIndex(0);
    setLockWallpaperIndex(0);
  };

  // Shell Navigation & Dropdowns
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  useEffect(() => {
    if (!activeApp) {
      setLandscape(false); // ao sair do app, o sistema volta ao retrato
      return;
    }
    const pref = customApps.find(a => a.id === activeApp)?.orientation;
    if (pref) setLandscape(pref === 'landscape');
  }, [activeApp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Time-clock updates
  const [systemTime, setSystemTime] = useState('00:00');
  const [systemDate, setSystemDate] = useState('Segunda, 15 de Outubro');

  // Interactive dynamic app data
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('os_chats');
    return saved ? JSON.parse(saved) : initialChats;
  });
  const [folders, setFolders] = useState<FolderType[]>(() => {
    const saved = localStorage.getItem('os_folders');
    return saved ? JSON.parse(saved) : initialFolders;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('os_contacts');
    return saved ? JSON.parse(saved) : [
      { id: 'mother', name: 'Mãe ❤️', avatar: '👩', role: 'Mãe', phone: '(11) 99222-3344', email: 'mamae.querida@email.com', location: 'São Paulo, SP' },
      { id: 'love', name: 'Amor 💖', avatar: '🥰', role: 'Namorada', phone: '(11) 99888-7766', email: 'meu.amor@email.com', location: 'São Paulo, SP' },
      { id: 'grandmother', name: 'Vovó 👵', avatar: '👵', role: 'Família', phone: '(11) 98765-4321', email: 'vovo.querida@email.com', location: 'Santos, SP' },
      { id: 'friend-lucas', name: 'Lucas 🤙', avatar: '👦', role: 'Amigo', phone: '(11) 99111-2233', email: 'lucas.friend@email.com', location: 'São Bernardo, SP' },
      { id: 'tech-support', name: 'Suporte Mock OS', avatar: '🛠️', role: 'Suporte Técnico', phone: '0800 123 456', email: 'suporte@mockos.io', location: 'Nuvem' },
    ];
  });

  useEffect(() => { localStorage.setItem('os_chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem('os_folders', JSON.stringify(folders)); }, [folders]);
  useEffect(() => { localStorage.setItem('os_contacts', JSON.stringify(contacts)); }, [contacts]);

  const addContact = (newContact: Contact) => {
    setContacts(prev => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)));
    // Also create a chat for this contact if it doesn't exist
    setChats(prev => {
      if (prev.some(c => c.id === newContact.id)) return prev;
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newChat: Chat = {
        id: newContact.id,
        name: newContact.name,
        avatar: newContact.avatar,
        role: newContact.role,
        unread: false,
        messages: [
          {
            id: `sys-${Date.now()}`,
            sender: 'contact',
            text: `Oi Mateus! Adicionei seu número aqui nos meus contatos. Tudo bem? 😊`,
            timestamp
          }
        ]
      };
      return [...prev, newChat];
    });
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setChats(prev => prev.filter(c => c.id !== id));
    if (selectedChatId === id) {
      setSelectedChatId(null);
    }
  };

  // Selected chat ID for messaging & Popups state
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activePopup, setActivePopup] = useState<PopupNotification | null>(null);
  const toastDraggedRef = useRef(false);
  // Aviso só aceita toque depois de um instante: toque na tela logo que ele aparece não abre o chat
  const [toastLive, setToastLive] = useState(false);
  useEffect(() => {
    if (!activePopup) return;
    setToastLive(false);
    const t = window.setTimeout(() => setToastLive(true), 900);
    return () => window.clearTimeout(t);
  }, [activePopup?.id]);

  // Installed Apps State
  const [installedApps, setInstalledApps] = useState<string[]>(() => {
    const saved = localStorage.getItem('os_installed_apps');
    return saved ? JSON.parse(saved) : ['arquivos', 'calculadora', 'configuracoes', 'galeria', 'mensagens', 'musica', 'navegador', 'loja', 'telefone', 'contatos', 'camera'];
  });
  useEffect(() => { localStorage.setItem('os_installed_apps', JSON.stringify(installedApps)); }, [installedApps]);

  const handleInstallApp = (appId: string) => {
    setInstalledApps(prev => {
      if (prev.includes(appId)) return prev;
      return [...prev, appId];
    });
  };

  const handleUninstallApp = (appId: string) => {
    if (appId === 'configuracoes' || appId === 'loja' || appId === 'telefone' || appId === 'contatos' || appId === 'camera') return;
    setInstalledApps(prev => prev.filter(id => id !== appId));
    if (activeApp === appId) {
      setActiveApp(null);
    }
    setOpenedApps(prev => prev.filter(id => id !== appId));
  };

  // App Store: importar e excluir apps HTML
  const handleImportCustomApp = async (app: CustomApp): Promise<boolean> => {
    try {
      await putApp(app);
    } catch {
      if (app.kind === 'folder') await deleteAppFiles(app.id).catch(() => {});
      return false; // falhou ao gravar no aparelho
    }
    setCustomApps(prev => [...prev, app]);
    return true;
  };

  const patchCustomApp = (appId: string, patch: Partial<CustomApp>) => {
    const cur = customApps.find(a => a.id === appId);
    if (!cur) return;
    const updated = { ...cur, ...patch };
    putApp(updated).catch(() => { /* mantém na sessão */ });
    setCustomApps(prev => (prev.some(a => a.id === appId) ? prev.map(a => (a.id === appId ? updated : a)) : [...prev, updated]));
  };
  const handleSetCustomFollow = (appId: string, value: boolean) => patchCustomApp(appId, { followWallpaper: value });

  const handleSetCustomOrientation = (appId: string, o: 'portrait' | 'landscape') => patchCustomApp(appId, { orientation: o });

  const handleDeleteCustomApp = (appId: string) => {
    if (isBundledId(appId)) return;
    deleteApp(appId).catch(() => { /* ignora */ });
    deleteAppFiles(appId).catch(() => { /* ignora */ });
    setCustomApps(prev => prev.filter(a => a.id !== appId));
    setInstalledApps(prev => prev.filter(id => id !== appId));
    setHomeApps(prev => prev.filter(id => id !== appId));
    setDockApps(prev => prev.filter(id => id !== appId));
    setOpenedApps(prev => prev.filter(id => id !== appId));
    if (activeApp === appId) setActiveApp(null);
  };

  // Standalone gallery lightbox state
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<number | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'gradient' | 'photo'>('all');

  // Status bar pull-down gesture detection
  const statusPullRef = useRef<{ startY: number; type: 'notif' | 'util' | null; triggered: boolean }>({
    startY: 0,
    type: null,
    triggered: false
  });

  const handleStatusPullStart = (e: React.MouseEvent | React.TouchEvent, type: 'notif' | 'util') => {
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientY = e.touches[0].clientY;
    } else if ('clientY' in e) {
      clientY = (e as React.MouseEvent).clientY;
    }
    statusPullRef.current = { startY: clientY, type, triggered: false };
  };

  const handleStatusPullMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!statusPullRef.current.type || statusPullRef.current.triggered) return;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientY = e.touches[0].clientY;
    } else if ('clientY' in e) {
      clientY = (e as React.MouseEvent).clientY;
    }
    const diffY = clientY - statusPullRef.current.startY;
    if (diffY > 25) {
      statusPullRef.current.triggered = true;
      if (statusPullRef.current.type === 'notif') {
        setNotificationsOpen(true);
        setUtilitiesOpen(false);
        setAppDrawerOpen(false);
      } else {
        setUtilitiesOpen(true);
        setNotificationsOpen(false);
        setAppDrawerOpen(false);
      }
      if (navigator.vibrate) {
        try { navigator.vibrate(25); } catch {}
      }
    }
  };

  const handleStatusPullEnd = () => {
    setTimeout(() => {
      statusPullRef.current = { startY: 0, type: null, triggered: false };
    }, 150);
  };

  // Swipe gesture detection
  const [touchStartX, setTouchStartX] = useState(0);
  const [swipeBackStartX, setSwipeBackStartX] = useState<number | null>(null);
  const [swipeBackCurrentX, setSwipeBackCurrentX] = useState<number>(0);
  const [isSwipingBack, setIsSwipingBack] = useState<boolean>(false);

  // Multitasking & Recent Apps states
  const [openedApps, setOpenedApps] = useState<string[]>([]);
  const [recentAppsOpen, setRecentAppsOpen] = useState(false);

  // Fullscreen state & native browser control (força a esconder a barra de status do celular Android)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ));
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const docEl = document.documentElement as any;
    const doc = document as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  // Auto-dismiss popup notifications after 5 seconds
  useEffect(() => {
    if (activePopup) {
      const timer = setTimeout(() => {
        setActivePopup(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activePopup]);

  // Periodic background message simulator
  useEffect(() => {
    let intervalId: any = null;

    // Wait 60 seconds before the first background message, then send every 150 seconds to prevent spam
    const initialTimer = setTimeout(() => {
      const sendRandomMessage = () => {
        // Use setChats functional form to always read the freshest state without triggering re-runs
        setChats(prevChats => {
          // Exclude 'self-notes' and the currently active chat
          const availableChats = prevChats.filter(c => c.id !== 'self-notes' && c.id !== selectedChatId);
          if (availableChats.length === 0) return prevChats;

          const targetChat = availableChats[Math.floor(Math.random() * availableChats.length)];

          const getBgMessage = async () => {
            const isStaticHost = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
            if (!isStaticHost) {
              try {
                const res = await fetch('/api/chat/background', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contactId: targetChat.id,
                    contactName: targetChat.name,
                    contactRole: targetChat.role,
                    messageHistory: targetChat.messages
                  })
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data && data.reply) {
                    return data.reply;
                  }
                }
              } catch (err) {
                console.warn("Background AI message generation failed, using static fallback:", err);
              }
            }
            // Offline Local AI background check-in
            return generateBackgroundCheckIn(targetChat.id);
          };

          getBgMessage().then(text => {
            if (!text) return;

            const now = new Date();
            const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const botMsg = {
              id: `b-bg-${Date.now()}`,
              sender: 'contact' as const,
              text,
              timestamp
            };

            setChats(latestChats => latestChats.map(c => {
              if (c.id === targetChat.id) {
                const isCurrentlyViewing = (activeApp === 'mensagens' && selectedChatId === targetChat.id);
                return {
                  ...c,
                  unread: !isCurrentlyViewing,
                  messages: [...c.messages, botMsg]
                };
              }
              return c;
            }));

            const isCurrentlyViewing = (activeApp === 'mensagens' && selectedChatId === targetChat.id);
            if (!isCurrentlyViewing) {
              triggerNotification(targetChat.name, text, 'mensagens', targetChat.avatar, targetChat.id);
            }
          });

          return prevChats;
        });
      };

      sendRandomMessage();

      intervalId = setInterval(sendRandomMessage, 150000);
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeApp, selectedChatId]);

  const [swipeUpStartY, setSwipeUpStartY] = useState<number | null>(null);
  const [swipeUpCurrentY, setSwipeUpCurrentY] = useState<number | null>(null);
  const swipeUpTimerRef = useRef<any>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchCurrentYRef = useRef<number>(0);
  const isHoldingBottomSwipeRef = useRef<boolean>(false);
  const lastDragPos = useRef({ x: 0, y: 0 });
  const stateRef = useRef<any>(null);
  const lastTapRef = useRef(0);

  // 2. Volume Change HUD display trigger (disabled by user request)
  useEffect(() => {
    // Disabled volume HUD display
  }, [volume]);

  // Auto-close multitasking/recent apps panel when there are no opened apps left
  useEffect(() => {
    if (recentAppsOpen && openedApps.length === 0) {
      setRecentAppsOpen(false);
    }
  }, [openedApps, recentAppsOpen]);

  // 3. Time Tick Clock trigger
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setSystemTime(`${hrs}:${mins}`);

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      let dateStr = now.toLocaleDateString('pt-BR', options);
      setSystemDate(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Solução robusta para corrigir o bug de deslocamento da tela (teclado mobile no iframe)
  useEffect(() => {
    const handleFocusOut = () => {
      // Pequeno delay para garantir que o teclado recolheu e o estado de foco foi atualizado
      setTimeout(() => {
        const activeEl = document.activeElement;
        const isInputActive = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.hasAttribute('contenteditable')
        );
        
        if (!isInputActive) {
          // Garante que o container volte ao topo absoluto do viewport
          window.scrollTo(0, 0);
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        }
      }, 150);
    };

    const handleScroll = () => {
      // Se não houver nenhum input em foco e o scroll não for zero, força a redefinição ao topo
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.hasAttribute('contenteditable')
      );

      if (!isInputActive && (window.scrollY !== 0 || window.scrollX !== 0)) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    };

    window.addEventListener('focusout', handleFocusOut);
    window.addEventListener('blur', handleFocusOut);
    window.addEventListener('scroll', handleScroll);

    // Também monitora redimensionamentos do visualViewport se disponível
    const visualViewport = (window as any).visualViewport;
    const handleViewportChange = () => {
      if (!document.activeElement || 
          (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    };

    if (visualViewport) {
      visualViewport.addEventListener('resize', handleViewportChange);
      visualViewport.addEventListener('scroll', handleViewportChange);
    }

    return () => {
      window.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('blur', handleFocusOut);
      window.removeEventListener('scroll', handleScroll);
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handleViewportChange);
        visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, []);

  // 4. Real battery connector fallback
  useEffect(() => {
    let batteryObj: any = null;
    let onLevelChange: (() => void) | null = null;
    let onChargingChange: (() => void) | null = null;

    if (!useManualBattery && typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        onLevelChange = () => setBatteryLevel(Math.round(battery.level * 100));
        onChargingChange = () => setIsCharging(battery.charging);

        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargingChange);
      }).catch((err: any) => {
        console.warn("Battery API not supported or blocked by policy:", err);
      });
    }

    return () => {
      if (batteryObj) {
        if (onLevelChange) batteryObj.removeEventListener('levelchange', onLevelChange);
        if (onChargingChange) batteryObj.removeEventListener('chargingchange', onChargingChange);
      }
    };
  }, [useManualBattery]);

  // 5. Helper callbacks for cross-app communication
  const handleApplyBuiltinWallpaper = (idx: number, target: 'home' | 'lock' | 'both') => {
    if (target !== 'lock') setWallpaperIndex(idx);
    if (target !== 'home') setLockWallpaperIndex(idx);
  };
  const handleUseGalleryPhoto = (dataUrl: string, name: string, target: 'home' | 'lock' | 'both') => {
    const idx = wallpapers.length;
    setWallpapers(prev => [...prev, { name, gradient: `url(${dataUrl}) center/cover no-repeat`, isDark: false }]);
    handleApplyBuiltinWallpaper(idx, target);
  };

  const handleSetWallpaperFromFile = (idx: number) => {
    setWallpaperIndex(idx);
  };

  const handlePlayTrackFromFile = (trackTitle: string) => {
    const trackIdx = allTracks.findIndex(t => t.title === trackTitle);
    if (trackIdx !== -1) {
      setCurrentTrackIndex(trackIdx);
      setMusicPlaying(true);
      setActiveApp('musica'); // Open music app
      setNotifications(prev => [
        {
          id: `sys-${Date.now()}`,
          title: "Player de Música",
          body: `Tocando "${trackTitle}" de Arquivos`,
          time: "Agora",
          app: "musica"
        },
        ...prev
      ]);
    }
  };

  // Clear single notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simple synthesizer for audio feedback using Web Audio API
  const playNotificationSound = (ringtoneId: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playToneLocal = (freq: number, type: OscillatorType = 'sine', duration = 0.15, vol = 0.08) => {
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          // Multiply sound volume by system volume
          const calculatedVol = vol * (volume / 100);
          gainNode.gain.setValueAtTime(calculatedVol, ctx.currentTime);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + duration);
        } catch (e) {
          console.warn(e);
        }
      };

      if (ringtoneId === 'classic') {
        playToneLocal(523.25, 'sine', 0.1);
        setTimeout(() => playToneLocal(659.25, 'sine', 0.1), 120);
        setTimeout(() => playToneLocal(783.99, 'sine', 0.15), 240);
      } else if (ringtoneId === 'synth') {
        playToneLocal(880, 'sawtooth', 0.08, 0.04);
        setTimeout(() => playToneLocal(1760, 'sawtooth', 0.15, 0.03), 100);
      } else if (ringtoneId === 'bell') {
        playToneLocal(987.77, 'triangle', 0.2, 0.1);
        setTimeout(() => playToneLocal(1318.51, 'triangle', 0.3, 0.08), 150);
      } else if (ringtoneId === 'marimba') {
        const scale = [440, 554.37, 659.25, 880];
        scale.forEach((freq, idx) => {
          setTimeout(() => playToneLocal(freq, 'sine', 0.15, 0.06), idx * 80);
        });
      }
    } catch (err) {
      console.warn('Audio synthesis not supported or blocked:', err);
    }
  };

  // Trigger system-wide notification with a popup
  const triggerNotification = (title: string, body: string, app: string, avatar?: string, chatId?: string) => {
    const newNotif: NotificationItem = {
      id: `${app}-${Date.now()}`,
      title,
      body,
      time: "Agora",
      app,
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Show popup
    setActivePopup({
      id: newNotif.id,
      title,
      body,
      app,
      avatar,
      chatId,
    });

    // Play notification sound based on selected settings tone
    playNotificationSound(selectedRingtone);
  };

  // Drag and Drop & Shortcuts customization helpers
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, appId: string, isNew: boolean, origin: 'drawer' | 'home' | 'dock') => {
    // If dragging from home or dock, only allow if already in edit mode
    if ((origin === 'home' || origin === 'dock') && !isEditingHome) {
      return;
    }
    
    // Avoid dragging core apps off the system entirely
    if (e.cancelable) e.preventDefault();
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setDraggedApp({
      appId,
      isNew,
      origin,
      offsetX: 24,
      offsetY: 24
    });

    setDragPosition({ x: clientX, y: clientY });
      lastDragPos.current = { x: clientX, y: clientY };
    dragStartCoordsRef.current = { x: clientX, y: clientY };
    setDragHasMoved(origin === 'drawer'); // If originating from drawer, long press already occurred so we drag immediately
    
    // Automatically close slide-out drawer if dragging from there
    if (origin === 'drawer') {
      setAppDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (!draggedApp) return;

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      setDragPosition({ x: clientX, y: clientY });
      lastDragPos.current = { x: clientX, y: clientY };

      if (!dragHasMoved) {
        const dx = Math.abs(clientX - dragStartCoordsRef.current.x);
        const dy = Math.abs(clientY - dragStartCoordsRef.current.y);
        if (dx > 8 || dy > 8) {
          setDragHasMoved(true);
        }
      }

      // Determine drop zones relative to the screen-container
      const phoneEl = document.getElementById('screen-container');
      if (phoneEl) {
        const rect = phoneEl.getBoundingClientRect();
        const relY = clientY - rect.top;
        
        // No delete zone on top anymore as requested
        if (relY > rect.height - 110) {
          setDragOverZone('dock');
        } else {
          setDragOverZone('home');
        }
      }
    };

    const handleGlobalUp = () => {
      const appId = draggedApp.appId;
      const origin = draggedApp.origin;
      
      if (!dragHasMoved) {
        setDraggedApp(null);
        setDragOverZone(null);
        setDragHasMoved(false);
        return;
      }

      if (dragOverZone === 'dock') {
        // Drop shortcut in the bottom dock
        setDockApps(prev => {
          if (prev.includes(appId)) return prev; // Avoid duplicates
          if (prev.length >= 4) {
            return prev; // Dock supports max 4 shortcuts, no notification as requested
          }
          
          // Remove from home screen grid if it was dragged from there
          if (origin === 'home') {
            setHomeApps(h => h.filter(id => id !== appId));
          }
          return [...prev, appId];
        });
      } else if (dragOverZone === 'home' || !dragOverZone) {
        // Solta o atalho na célula exata da grade (qualquer canto livre)
        const g = document.getElementById('home-grid');
        const st = stateRef.current;
        if (g && st) {
          const rc = g.getBoundingClientRect();
          const pt = lastDragPos.current;
          const c = Math.max(0, Math.min(COLS - 1, Math.floor((pt.x - rc.left) / (rc.width / COLS))));
          const r = Math.max(0, Math.min(ROWS - 1, Math.floor((pt.y - rc.top) / (rc.height / ROWS))));
          const occ = occupiedCells(st.placed, st.widgets, appId);
          const spot = occ.has(c + ',' + r) ? findFree(occ, 1, 1, { c, r }) : { c, r };
          if (spot) {
            setLayout(l => ({ ...l, [appId]: spot }));
            setHomeApps(prev => (prev.includes(appId) ? prev : [...prev, appId]));
            if (origin === 'dock') setDockApps(d => d.filter(id => id !== appId));
          }
        }
      }

      setDraggedApp(null);
      setDragOverZone(null);
      setDragHasMoved(false);
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [draggedApp, dragOverZone, dragHasMoved]);

  // Home screen long press triggers
  const handleHomePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Trigger selector only if clicked on empty areas or status bar triggers
    if (target.id !== 'home-screen' && !target.classList.contains('home-bg-area') && target.id !== 'swipe-trigger') {
      return;
    }

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    longPressTimerRef.current = setTimeout(() => {
      setIsEditingHome(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 650);
  };

  const handleHomePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Shortcut icon long press triggers (Home Screen)
  const handleShortcutPressStart = (e: React.MouseEvent | React.TouchEvent, appId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    longPressTimerRef.current = setTimeout(() => {
      setIsEditingHome(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 650);
  };

  const handleShortcutPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Drawer Long Press logic to add shortcuts
  const handleDrawerPressStart = (e: React.MouseEvent | React.TouchEvent, appName: string) => {
    if (drawerLongPressTimerRef.current) clearTimeout(drawerLongPressTimerRef.current);
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    drawerPressCoordsRef.current = { startX: clientX, startY: clientY, currentX: clientX, currentY: clientY };

    drawerLongPressTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Start drag from drawer immediately!
      setDraggedApp({
        appId: appName,
        isNew: true,
        origin: 'drawer',
        offsetX: 24,
        offsetY: 24
      });
      setDragPosition({ x: drawerPressCoordsRef.current.currentX, y: drawerPressCoordsRef.current.currentY });
      dragStartCoordsRef.current = { x: drawerPressCoordsRef.current.startX, y: drawerPressCoordsRef.current.startY };
      setDragHasMoved(true); // From drawer long press, we drag immediately!
      setAppDrawerOpen(false); // Close drawer
      
      setLongPressActiveApp(null);
    }, 600); // 600ms long press
    
    setLongPressActiveApp(appName);
  };

  const handleDrawerPressMove = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    drawerPressCoordsRef.current.currentX = clientX;
    drawerPressCoordsRef.current.currentY = clientY;

    // If they moved significantly, cancel long press (they are scrolling)
    const diffX = Math.abs(clientX - drawerPressCoordsRef.current.startX);
    const diffY = Math.abs(clientY - drawerPressCoordsRef.current.startY);
    if (diffX > 15 || diffY > 15) {
      if (drawerLongPressTimerRef.current) {
        clearTimeout(drawerLongPressTimerRef.current);
        drawerLongPressTimerRef.current = null;
      }
      setLongPressActiveApp(null);
    }
  };

  const handleDrawerPressEnd = (appName: string) => {
    if (drawerLongPressTimerRef.current) {
      clearTimeout(drawerLongPressTimerRef.current);
      drawerLongPressTimerRef.current = null;
    }
    
    // If released before 600ms, open the app
    if (longPressActiveApp === appName) {
      openApp(appName);
    }
    setLongPressActiveApp(null);
  };

  const handleDrawerPressCancel = () => {
    if (drawerLongPressTimerRef.current) {
      clearTimeout(drawerLongPressTimerRef.current);
      drawerLongPressTimerRef.current = null;
    }
    setLongPressActiveApp(null);
  };

  // Handle click or swipe-down action on popup notification
  const handlePopupAction = (popup: PopupNotification) => {
    if (popup.app === 'mensagens') {
      if (popup.chatId) {
        setSelectedChatId(popup.chatId);
      }
      openApp('mensagens');
    } else {
      openApp(popup.app);
    }
    setActivePopup(null);
  };

  // Open an app safely
  const openApp = (appName: string) => {
    setActiveApp(appName);
    setAppDrawerOpen(false);
    setNotificationsOpen(false);
    setUtilitiesOpen(false);
    setRecentAppsOpen(false);
    setOpenedApps(prev => {
      if (prev.includes(appName)) return prev;
      return [...prev, appName];
    });
  };

  // Close active app
  const closeApp = () => {
    setActiveApp(null);
  };

  // Navegação por botões (estilo Android): voltar, início e apps em segundo plano
  const goBack = () => {
    if (document.documentElement.dataset.kb === '1') { (document.activeElement as HTMLElement | null)?.blur?.(); return; }
    if (recentAppsOpen) { setRecentAppsOpen(false); return; }
    if (anySheetOpen) { closeSheets(); return; }
    if (activeApp === 'galeria' && selectedGalleryImg !== null) { setSelectedGalleryImg(null); return; }
    const event = new Event('mockos-back', { cancelable: true });
    const wasCancelled = !window.dispatchEvent(event);
    if (!wasCancelled) closeApp();
  };
  const goHome = () => {
    setRecentAppsOpen(false);
    closeSheets();
    setIsEditingHome(false);
    setSelectedGalleryImg(null);
    setActiveApp(null);
  };
  const toggleRecents = () => {
    closeSheets();
    setRecentAppsOpen(v => !v);
  };
  // Marca toques que começaram dentro de um item que tem gestos próprios (ex.: notificação arrastável)
  const touchNoGestureRef = useRef(false);

  // Gesto de deslizar (Swipe) para abrir a gaveta pela esquerda, voltar pela direita ou multitarefa de baixo
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLocked || isBooting || screenOff) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    touchNoGestureRef.current = !!(e.target as HTMLElement).closest?.('[data-no-sheet-gesture]');
    setTouchStartX(x);
    touchStartXRef.current = x;
    touchStartYRef.current = y;
    touchCurrentYRef.current = y;
    isHoldingBottomSwipeRef.current = false;

    const target = e.target as HTMLElement;
    const isDrawingOrGameCanvas = target && (target.tagName === 'CANVAS' || target.closest('canvas'));
    const isInteractiveApp = activeApp === 'paint' || activeApp === 'flappy';
    const isInteractiveElement = target && (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.tagName === 'BUTTON' || 
      target.closest('input') || 
      target.closest('textarea') || 
      target.closest('button') ||
      target.closest('select')
    );

    // Se o toque iniciar muito próximo à borda inferior da tela, e na parte central (evitando conflitos com scrolls longos nos apps)
    const isNearCenterBottom = Math.abs(x - screenW() / 2) < 80;
    if (y > screenH() - 30 && isNearCenterBottom && !isDrawingOrGameCanvas && !isInteractiveApp && !isInteractiveElement && prefs.navStyle === 'gestures') {
      setSwipeUpStartY(y);
      setSwipeUpCurrentY(y);
      
      if (swipeUpTimerRef.current) clearTimeout(swipeUpTimerRef.current);
      swipeUpTimerRef.current = setTimeout(() => {
        const diffY = touchStartYRef.current - touchCurrentYRef.current;
        // Se deslizou mais de 100px para cima e segurou por 350ms, abre a tela de apps recentes (multitarefa)
        if (diffY > 100) {
          setRecentAppsOpen(true);
          setAppDrawerOpen(false);
          setNotificationsOpen(false);
          setUtilitiesOpen(false);
          isHoldingBottomSwipeRef.current = true;
          if (navigator.vibrate) {
            navigator.vibrate(15);
          }
        }
      }, 350);
    } else if (x > screenW() - 25 && activeApp !== null && !isDrawingOrGameCanvas && !isInteractiveApp && !isInteractiveElement && prefs.navStyle === 'gestures') {
      // Começou bem na borda direita (gesto de voltar do Android/iOS)
      setSwipeBackStartX(x);
      setSwipeBackCurrentX(x);
      setIsSwipingBack(true);
    } else {
      setSwipeBackStartX(null);
      setIsSwipingBack(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    touchCurrentYRef.current = y;

    if (swipeUpStartY !== null) {
      setSwipeUpCurrentY(y);
    }
    if (isSwipingBack && swipeBackStartX !== null) {
      setSwipeBackCurrentX(x);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isLocked || isBooting || screenOff) return;
    if (swipeUpTimerRef.current) {
      clearTimeout(swipeUpTimerRef.current);
      swipeUpTimerRef.current = null;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const noGesture = touchNoGestureRef.current;
    touchNoGestureRef.current = false;

    // Puxar de qualquer ponto do topo: lado esquerdo abre notificações, lado direito abre ajustes rápidos
    const startXTop = touchStartXRef.current;
    const startYTop = touchStartYRef.current;
    const dyTop = touchEndY - startYTop;
    const dxTop = touchEndX - startXTop;
    if (!noGesture && !isBooting && !isLocked && !screenOff && startYTop < 90 && dyTop > 60 && dyTop > Math.abs(dxTop) * 1.5 && !notificationsOpen && !utilitiesOpen && !appDrawerOpen) {
      if (startXTop < screenW() / 2) {
        setNotificationsOpen(true);
        setUtilitiesOpen(false);
      } else {
        setUtilitiesOpen(true);
        setNotificationsOpen(false);
      }
      setAppDrawerOpen(false);
      return;
    }

    if (!noGesture && (notificationsOpen || utilitiesOpen)) {
      if ((touchStartYRef.current || touchEndY) - touchEndY > 35) {
        setNotificationsOpen(false);
        setUtilitiesOpen(false);
        return;
      }
    }

    if (appDrawerOpen) {
      const diffX = touchEndX - (touchStartXRef.current || touchEndX);
      const diffY = Math.abs((touchStartYRef.current || touchEndY) - touchEndY);
      // Se deslizar para a esquerda predominantemente horizontal, fecha a gaveta lateral
      if (diffX < -50 && Math.abs(diffX) > diffY) {
        setAppDrawerOpen(false);
        return;
      }
    }

    if (swipeUpStartY !== null) {
      const diffY = swipeUpStartY - touchEndY;
      setSwipeUpStartY(null);
      setSwipeUpCurrentY(null);

      // Se o usuário deslizou rapidamente para cima (> 140px) sem acionar o 'hold', volta para a Home
      if (!isHoldingBottomSwipeRef.current && diffY > 140) {
        setActiveApp(null);
        setRecentAppsOpen(false);
      }
      return;
    }

    if (isSwipingBack && swipeBackStartX !== null) {
      const dragDistance = swipeBackStartX - touchEndX;
      const dragVertical = Math.abs(touchEndY - (touchStartYRef.current || touchEndY));
      setIsSwipingBack(false);
      setSwipeBackStartX(null);
      
      // Puxando da direita para a esquerda: volta a página ou fecha o app
      // Deve ser predominantemente horizontal para evitar fechamento acidental durante scroll vertical
      if (dragDistance > 90 && dragVertical < dragDistance * 0.5) {
        if (activeApp === 'galeria' && selectedGalleryImg !== null) {
          setSelectedGalleryImg(null);
        } else {
          const event = new Event('mockos-back', { cancelable: true });
          const wasCancelled = !window.dispatchEvent(event);
          if (!wasCancelled) {
            closeApp();
          }
        }
      }
      return;
    }

    // Se o toque começar bem perto da borda esquerda (< 70px) e deslizar para a direita (> 80px de diferença)
    // Também deve ser predominantemente horizontal para evitar abertura acidental durante scroll
    const dragDistanceLeftToRight = touchEndX - touchStartX;
    const dragVerticalLeftToRight = Math.abs(touchEndY - (touchStartYRef.current || touchEndY));
    // Zona de abertura: a esquerda da tela, em qualquer altura
    const leftZone = Math.max(70, screenW() * 0.3);
    if (!noGesture && touchStartX !== null && touchStartX < leftZone && dragDistanceLeftToRight > 80 && dragVerticalLeftToRight < dragDistanceLeftToRight * 0.5) {
      setAppDrawerOpen(true);
      setNotificationsOpen(false);
      setUtilitiesOpen(false);
    }
  };

  // ------------------------------------------------------------------
  // Tela cheia automática, cor da barra do sistema e animação de desbloqueio
  // ------------------------------------------------------------------
  const [autoFullscreen, setAutoFullscreen] = useState<boolean>(() => {
    const saved = localStorage.getItem('os_auto_fullscreen');
    if (saved !== null) return saved === 'true';
    // Padrão: ligado em aparelhos de toque (celular/tablet), desligado no desktop
    return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  });
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    localStorage.setItem('os_auto_fullscreen', String(autoFullscreen));
  }, [autoFullscreen]);

  // Navegadores só liberam tela cheia após um gesto do usuário: entra no primeiro toque.
  useEffect(() => {
    if (!autoFullscreen) return;
    const enter = () => {
      const doc = document as any;
      const el = document.documentElement as any;
      const already = doc.fullscreenElement || doc.webkitFullscreenElement;
      if (!already) {
        try {
          const req = el.requestFullscreen
            ? el.requestFullscreen({ navigationUI: 'hide' })
            : el.webkitRequestFullscreen?.();
          if (req && typeof req.catch === 'function') req.catch(() => {});
        } catch (e) {
          // Sem suporte (ex.: iPhone) — o modo instalado (PWA) já ocupa a tela toda
        }
      }
    };
    window.addEventListener('pointerup', enter, { once: true });
    return () => window.removeEventListener('pointerup', enter);
  }, [autoFullscreen, isFullscreen]);

  // Barra do sistema com a mesma cor da tela: nada de faixa preta sobrando
  useEffect(() => {
    let color = darkMode ? '#0B0B0C' : '#F5F5F6';
    if (isBooting || isLocked || activeApp === null) {
      const wp = isLocked ? currentLockWallpaper : currentWallpaper;
      const m = wp?.gradient?.match(/#[0-9a-fA-F]{6}\b/);
      color = m ? m[0] : '#0B0B0C';
    } else if (activeApp === 'camera' || activeApp === 'clima') {
      color = '#000000';
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
    document.documentElement.style.backgroundColor = color;
  }, [darkMode, isBooting, isLocked, activeApp, currentWallpaper, currentLockWallpaper]);

  useEffect(() => {
    if (isBooting || isLocked) return;
    setJustUnlocked(true);
    const t = setTimeout(() => setJustUnlocked(false), 1200);
    return () => clearTimeout(t);
  }, [isBooting, isLocked]);

  // ------------------------------------------------------------------
  // Preferências de tela, grade livre, widgets e tela apagada
  // ------------------------------------------------------------------
  const { prefs } = usePrefs();
  const [layout, setLayout] = useState<Record<string, { c: number; r: number }>>(() => {
    try { return JSON.parse(localStorage.getItem('os_home_layout') || '{}'); } catch { return {}; }
  });
  const [widgets, setWidgets] = useState<WidgetItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('os_widgets') || '[]'); } catch { return []; }
  });
  const [widgetSheet, setWidgetSheet] = useState(false);

  // Arrastar widgets pela tela inicial (no modo de edição)
  const [widgetDrag, setWidgetDrag] = useState<WidgetDrag | null>(null);
  const widgetDragRef = useRef<WidgetDrag | null>(null);
  const [screenOff, setScreenOff] = useState(false);
  useEffect(() => { localStorage.setItem('os_home_layout', JSON.stringify(layout)); }, [layout]);
  useEffect(() => { localStorage.setItem('os_widgets', JSON.stringify(widgets)); }, [widgets]);

  const autoStart = prefs.home.style === 'none' || prefs.home.pos !== 'top' ? 0 : prefs.home.style === 'stacked' ? 3 : 2;
  const placed = resolveLayout(homeApps.filter(a => installedApps.includes(a)), layout, widgets, autoStart);
  stateRef.current = { placed, widgets };

  const handleWidgetPressStart = (e: React.MouseEvent | React.TouchEvent, w: WidgetItem) => {
    if (!isEditingHome) return;
    const sz = WIDGETS[w.type];
    const g = document.getElementById('home-grid');
    if (!sz || !g) return;
    const p = 'touches' in e ? e.touches[0] : e;
    if (!p) return;
    const rc = g.getBoundingClientRect();
    // Célula do widget onde o dedo começou, para o widget não "pular" ao arrastar
    const grabC = Math.max(0, Math.min(sz.w - 1, Math.floor((p.clientX - rc.left) / (rc.width / COLS)) - w.c));
    const grabR = Math.max(0, Math.min(sz.h - 1, Math.floor((p.clientY - rc.top) / (rc.height / ROWS)) - w.r));
    const d: WidgetDrag = {
      id: w.id, w: sz.w, h: sz.h,
      startX: p.clientX, startY: p.clientY, x: p.clientX, y: p.clientY,
      grabC, grabR, moved: false, target: null,
    };
    widgetDragRef.current = d;
    setWidgetDrag(d);
  };

  const widgetDragId = widgetDrag ? widgetDrag.id : null;
  useEffect(() => {
    if (!widgetDragId) return;
    const pointOf = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        const t = e.touches[0] || e.changedTouches[0];
        return t ? { x: t.clientX, y: t.clientY } : null;
      }
      return { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      const d = widgetDragRef.current;
      const pt = pointOf(e);
      if (!d || !pt) return;
      if ('touches' in e && e.cancelable) e.preventDefault();
      const moved = d.moved || Math.abs(pt.x - d.startX) + Math.abs(pt.y - d.startY) > 6;
      let target = d.target;
      const g = document.getElementById('home-grid');
      if (g && moved) {
        const rc = g.getBoundingClientRect();
        const c0 = Math.floor((pt.x - rc.left) / (rc.width / COLS)) - d.grabC;
        const r0 = Math.floor((pt.y - rc.top) / (rc.height / ROWS)) - d.grabR;
        const c = Math.max(0, Math.min(COLS - d.w, c0));
        const r = Math.max(0, Math.min(ROWS - d.h, r0));
        // Só colide com outros widgets; os apps se reorganizam sozinhos ao redor
        const occ = occupiedCells({}, (stateRef.current?.widgets ?? []).filter((x: WidgetItem) => x.id !== d.id));
        let fits = true;
        for (let dc = 0; dc < d.w; dc++) for (let dr = 0; dr < d.h; dr++) if (occ.has(`${c + dc},${r + dr}`)) fits = false;
        const spot = fits ? { c, r } : findFree(occ, d.w, d.h, { c, r });
        if (spot) target = spot;
      }
      const next: WidgetDrag = { ...d, x: pt.x, y: pt.y, moved, target };
      widgetDragRef.current = next;
      setWidgetDrag(next);
    };
    const onUp = () => {
      const d = widgetDragRef.current;
      widgetDragRef.current = null;
      setWidgetDrag(null);
      if (!d || !d.moved || !d.target) return;
      const t = d.target;
      setWidgets(ws => ws.map(x => (x.id === d.id ? { ...x, c: t.c, r: t.r } : x)));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [widgetDragId]);

  const addWidget = (type: string) => {
    const sz = WIDGETS[type];
    const spot = findFree(occupiedCells(placed, widgets), sz.w, sz.h, { c: 0, r: autoStart });
    if (spot) setWidgets(ws => [...ws, { id: 'w' + Date.now(), type, c: spot.c, r: spot.r }]);
    setWidgetSheet(false);
  };

  // Cor dos ícones a partir do papel de parede (fotos são lidas do próprio arquivo)
  const wpTint = useWallpaperTint(currentWallpaper.gradient);
  const tintInfo = { h: wpTint.h, s: wpTint.s, css: `hsl(${wpTint.h} ${wpTint.s}% 44%)` };
  const tint = tintInfo.css;
  setIconTint({ enabled: prefs.iconTint, h: tintInfo.h, s: tintInfo.s });
  // Modo "ícones da cor do papel de parede": a cor de destaque do sistema segue a cor média dos ícones
  const accentVars: Record<string, string> = prefs.iconTint ? buildAccentPalette(tintInfo.h, tintInfo.s) : {};

  // Apps HTML que seguem o papel de parede: recebem o tema por postMessage
  const appTheme = buildAppTheme(tintInfo.h, tintInfo.s, darkMode);
  const appThemeKey = JSON.stringify(appTheme);
  const customFrames = useRef<Record<string, HTMLIFrameElement | null>>({});
  const themeStateRef = useRef({ apps: customApps, theme: appTheme });
  themeStateRef.current = { apps: customApps, theme: appTheme };
  useEffect(() => {
    // O app avisa quando carregou: envia o tema se ele estiver marcado para seguir o papel de parede
    const onMsg = (e: MessageEvent) => {
      if (!e.data || e.data.type !== 'aeroos-ready') return;
      const cur = themeStateRef.current;
      const app = cur.apps.find(a => customFrames.current[a.id]?.contentWindow === e.source);
      if (app?.followWallpaper && e.source) (e.source as Window).postMessage({ type: 'aeroos-theme', vars: cur.theme }, '*');
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  useEffect(() => {
    // Quando o papel de parede, o modo claro/escuro ou a lista de apps mudam, atualiza os apps abertos
    customApps.forEach(a => {
      if (a.followWallpaper) customFrames.current[a.id]?.contentWindow?.postMessage({ type: 'aeroos-theme', vars: appTheme }, '*');
    });
  }, [appThemeKey, activeApp, customApps]);

  // Modo borda a borda: sobe a barra de status até a altura do notch
  const edge = isFullscreen || (typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true));

  const anySheetOpen = notificationsOpen || utilitiesOpen || appDrawerOpen;
  const immersiveApp = activeApp === 'camera' || activeApp === 'clima';
  const closeSheets = () => {
    setNotificationsOpen(false);
    setUtilitiesOpen(false);
    setAppDrawerOpen(false);
  };

  const renderAppPreviewContent = (appName: string) => {
    if (isCustomAppId(appName)) {
      return <div className="w-full h-full flex items-center justify-center text-sm opacity-60">{getCustomApp(appName)?.name}</div>;
    }
    switch (appName) {
      case 'configuracoes':
        return (
          <SettingsApp
            userName={userName}
            setUserName={setUserName}
            wifi={wifiActive}
            setWifi={setWifiActive}
            bluetooth={bluetoothActive}
            setBluetooth={setBluetoothActive}
            cellular={cellularActive}
            setCellular={setCellularActive}
            airplaneMode={airplaneMode}
            setAirplaneMode={setAirplaneMode}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            selectedRingtone={selectedRingtone}
            setSelectedRingtone={setSelectedRingtone}
            nightMode={nightMode}
            setNightMode={setNightMode}
            brightness={brightness}
            setBrightness={setBrightness}
            volume={volume}
            setVolume={setVolume}
            useManualBattery={useManualBattery}
            setUseManualBattery={setUseManualBattery}
            simulatedLevel={batteryLevel}
            setSimulatedLevel={setBatteryLevel}
            simulatedCharging={isCharging}
            setSimulatedCharging={setIsCharging}
            wallpapers={wallpapers}
            currentWallpaperIndex={wallpaperIndex}
            setWallpaperIndex={setWallpaperIndex}
            onOpenGallery={() => {
              setActiveApp('galeria');
            }}
            isActive={false}
            installedApps={installedApps}
            onUninstall={handleUninstallApp}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            autoFullscreen={autoFullscreen}
            setAutoFullscreen={setAutoFullscreen}
            language={language}
            setLanguage={setLanguage}
            pincode={pincode}
            setPincode={setPincode}
            userAvatar={userAvatar}
            setUserAvatar={setUserAvatar}
            onResetOS={handleResetOS}
          />
        );
      case 'calculadora':
        return <Calculator />;
      case 'galeria':
        return (
          <div className="no-scrollbar pt-4 pb-24 px-5 space-y-6 overflow-y-auto h-full bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
            {capturedPhotos.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Fotos capturadas</h3>
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  {capturedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => {
                        setActiveApp('camera');
                      }}
                      className={`aspect-[3/4] rounded-2xl overflow-hidden relative border border-white/10 bg-gradient-to-tr ${photo.url} cursor-pointer transition-transform`}
                    >
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Camera size={28} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                        <p className="font-bold text-xs leading-tight">Foto Capturada</p>
                        <p className="text-[11px] font-mono opacity-70">{photo.timestamp} • {photo.filter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <h3 className="font-bold text-base">Papeis de Parede</h3>
              <p className="text-xs opacity-65">Escolha um gradiente para ser seu papel de parede.</p>
            </div>
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              {wallpapers.map((wp, idx) => (
                <div
                  key={idx}
                  className="aspect-[9/16] rounded-2xl overflow-hidden relative border border-white/5 cursor-pointer"
                  style={{ background: wp.gradient }}
                  onClick={() => {
                    setWallpaperIndex(idx);
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 text-white">
                    <p className="font-bold text-xs leading-tight">{wp.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'mensagens':
        return (
          <MessagesApp
            chats={chats}
            setChats={setChats}
            darkMode={darkMode}
            isActive={false}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
          />
        );
      case 'musica':
        return (
          <MusicPlayer
            tracks={allTracks}
            isPlaying={musicPlaying}
            setIsPlaying={setMusicPlaying}
            currentTrackIndex={currentTrackIndex}
            setCurrentTrackIndex={setCurrentTrackIndex}
            volume={volume}
            setVolume={setVolume}
            darkMode={darkMode}
          />
        );
      case 'navegador':
        return <Browser darkMode={darkMode} isActive={false} online={online} account={account} />;
      case 'arquivos':
        return (
          <FilesApp
            folders={folders}
            setFolders={setFolders}
            darkMode={darkMode}
            onSetWallpaper={handleSetWallpaperFromFile}
            onPlayTrack={handlePlayTrackFromFile}
            isActive={false}
          />
        );
      case 'loja':
        return (
          <StoreApp
            darkMode={darkMode}
            installedApps={installedApps}
            onInstall={handleInstallApp}
            onUninstall={handleUninstallApp}
            onOpenApp={openApp}
            customApps={customApps}
            onImportCustomApp={handleImportCustomApp}
            onDeleteCustomApp={handleDeleteCustomApp}
              onSetFollowWallpaper={handleSetCustomFollow}
              onSetOrientation={handleSetCustomOrientation}
              onUpdateCustomApp={patchCustomApp}
          />
        );
      case 'notas':
        return <NotesApp darkMode={darkMode} />;
      case 'flappy':
        return <FlappyApp darkMode={darkMode} isActive={false} />;
      case 'clima':
        return <WeatherApp darkMode={darkMode} />;
      case 'paint':
        return <PaintApp darkMode={darkMode} />;
      case 'telefone':
        return <PhoneApp darkMode={darkMode} onOpenApp={openApp} />;
      case 'contatos':
        return (
          <ContactsApp 
            darkMode={darkMode} 
            onOpenApp={openApp} 
            contacts={contacts}
            onAddContact={addContact}
            onDeleteContact={deleteContact}
          />
        );
      case 'camera':
        return (
          <CameraApp 
            darkMode={darkMode} 
            isActive={false} 
            capturedPhotos={capturedPhotos}
            onCapturePhoto={(photo) => {
              setCapturedPhotos(prev => [photo, ...prev]);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden select-none bg-black">
      <div className="absolute overflow-hidden" style={{ left: stage.left, top: stage.top, width: stage.w, height: stage.h }}>
      <div
        id="screen-container"
        className={`${darkMode ? 'dark theme-dark' : 'theme-light'} ${activeApp !== null ? 'app-open' : ''} ${immersiveApp ? 'app-immersive' : ''} ${(anySheetOpen || recentAppsOpen) ? 'sheet-open' : ''} ${justUnlocked ? 'just-unlocked' : ''} ${edge ? 'edge' : ''} ${prefs.iconTint ? 'icons-tinted' : ''} ${prefs.navStyle === 'buttons' ? 'nav-buttons' : ''} ${(isLocked && !isBooting) ? 'is-locked' : ''} ${(landscape && activeApp !== null) ? 'app-rotated' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ position: 'absolute', inset: 0, '--stage-w': `${stage.w}px`, '--stage-h': `${stage.h}px`, filter: `brightness(${brightness}%)`, '--tint': tint, '--tint-h': `${tintInfo.h}deg`, '--tint-s': `${tintInfo.s}%`, ...accentVars } as React.CSSProperties}
      >

        {/* Filtro de luz noturna */}
        <div className="night-shield-overlay" style={{ opacity: nightMode ? 1 : 0 }} />

        {/* Papel de parede */}
        <div id="wallpaper" style={{ background: currentWallpaper.gradient }}>
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'aurora' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
              <div className="absolute w-[240px] h-[240px] rounded-full bg-emerald-500/30 blur-[60px] top-[10%] left-[10%] animate-[float1_12s_infinite_alternate]" />
              <div className="absolute w-[280px] h-[280px] rounded-full bg-teal-500/25 blur-[70px] bottom-[15%] right-[5%] animate-[float2_18s_infinite_alternate]" />
              <div className="absolute w-[200px] h-[200px] rounded-full bg-purple-500/20 blur-[50px] top-[40%] right-[25%] animate-[float3_15s_infinite_alternate]" />
            </div>
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'matrix' && <MatrixWallpaper />}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'particles' && <ParticlesWallpaper />}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'metal-liquid' && <LiquidMetalWallpaper />}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'gradient-shift' && <GradientShiftWallpaper />}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'waves' && <OceanWavesWallpaper />}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'geometric' && <GeometricSaturnWallpaper />}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'cyber-neon' && <CyberNeonWallpaper />}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'starfield' && <StarfieldWallpaper />}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'lava-lamp' && <LavaLampWallpaper />}
        </div>

        {/* Fundo escurecido atrás de painéis e gaveta */}
        <button
          id="overlay-blur"
          type="button"
          aria-label="Fechar"
          tabIndex={-1}
          className={anySheetOpen ? 'open' : ''}
          onClick={(e) => { e.stopPropagation(); closeSheets(); }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />

        {/* Barra de status */}
        <header
          id="status-bar"
          onMouseMove={handleStatusPullMove}
          onTouchMove={handleStatusPullMove}
          onMouseUp={handleStatusPullEnd}
          onTouchEnd={handleStatusPullEnd}
        >
          <div
            className="status-zone"
            id="trigger-notifications"
            onMouseDown={(e) => handleStatusPullStart(e, 'notif')}
            onTouchStart={(e) => handleStatusPullStart(e, 'notif')}
            onClick={(e) => {
              e.stopPropagation();
              if (statusPullRef.current.triggered) return;
              setNotificationsOpen(!notificationsOpen);
              setUtilitiesOpen(false);
              setAppDrawerOpen(false);
            }}
          >
            <span id="status-time">{systemTime}</span>
          </div>

          <div
            className="status-zone"
            id="trigger-utilities"
            onMouseDown={(e) => handleStatusPullStart(e, 'util')}
            onTouchStart={(e) => handleStatusPullStart(e, 'util')}
            onClick={(e) => {
              e.stopPropagation();
              if (statusPullRef.current.triggered) return;
              setUtilitiesOpen(!utilitiesOpen);
              setNotificationsOpen(false);
              setAppDrawerOpen(false);
            }}
          >
            <div className="status-pill">
              {airplaneMode && <Plane size={14} strokeWidth={2.4} />}
              {!airplaneMode && bluetoothActive && <Bluetooth size={14} strokeWidth={2.4} />}
              {wifiActive && !airplaneMode ? <Wifi size={15} strokeWidth={2.4} /> : <WifiOff size={15} strokeWidth={2.4} className="opacity-50" />}
              <div className="cellular-bars" style={{ opacity: cellularActive && !airplaneMode ? 1 : 0.35 }}>
                <div className="bar bar1"></div>
                <div className="bar bar2"></div>
                <div className="bar bar3"></div>
                <div className="bar bar4"></div>
              </div>
              <BatteryDots level={batteryLevel} isCharging={isCharging} />
            </div>
          </div>
        </header>

        {/* Painel de notificações */}
        <div id="panel-notifications" className={notificationsOpen ? '' : 'closed'}>
          <div className="sheet-title">
            <span>{language === 'en' ? 'Notifications' : 'Notificações'}</span>
            {notifications.length > 0 && (
              <button
                type="button"
                className="sheet-action"
                onClick={(e) => { e.stopPropagation(); setNotifications([]); }}
              >
                {language === 'en' ? 'Clear all' : 'Limpar tudo'}
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="empty-state">
              <BellOff size={22} />
              <span>{language === 'en' ? 'No notifications' : 'Nenhuma notificação'}</span>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map(item => (
                <SwipeDismiss key={item.id} onDismiss={() => removeNotification(item.id)}>
                  <div className="nf-card">
                    <div className="nf-icon"><NotifAppIcon app={item.app} /></div>
                    <div className="nf-body">
                      <div className="nf-head">
                        <span className="nf-app">{appMetadata[item.app]?.label ?? item.app}</span>
                        <time>{item.time}</time>
                      </div>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </div>
                  </div>
                </SwipeDismiss>
              ))}
            </div>
          )}
        </div>

        {/* Configurações rápidas */}
        <div id="panel-utilities" className={utilitiesOpen ? '' : 'closed'}>
          <div className="qs-tiles">
            <QSTile
              label={language === 'en' ? 'Rotate' : 'Girar'}
              icon={<RotateCw size={22} />}
              active={landscape}
              onClick={() => setLandscape(v => !v)}
            />
            <QSTile
              label="Wi-Fi"
              icon={<Wifi size={22} />}
              active={wifiActive}
              disabled={airplaneMode}
              onClick={() => setWifiActive(!wifiActive)}
            />
            <QSTile
              label="Bluetooth"
              icon={<Bluetooth size={22} />}
              active={bluetoothActive}
              disabled={airplaneMode}
              onClick={() => setBluetoothActive(!bluetoothActive)}
            />
            <QSTile
              label={language === 'en' ? 'Data' : 'Dados'}
              icon={<Signal size={22} />}
              active={cellularActive}
              disabled={airplaneMode}
              onClick={() => setCellularActive(!cellularActive)}
            />
            <QSTile
              label={language === 'en' ? 'Airplane' : 'Avião'}
              icon={<Plane size={22} />}
              active={airplaneMode}
              warn
              onClick={() => {
                const val = !airplaneMode;
                setAirplaneMode(val);
                if (val) {
                  setWifiActive(false);
                  setBluetoothActive(false);
                  setCellularActive(false);
                }
              }}
            />
          </div>

          <div className="qs-slider">
            <SunMedium size={20} />
            <input
              className="qs-range"
              type="range"
              min="20"
              max="100"
              value={brightness}
              aria-label={language === 'en' ? 'Brightness' : 'Brilho'}
              style={{ '--val': `${16 + ((brightness - 20) / 80) * 84}%` } as React.CSSProperties}
              onChange={e => setBrightness(parseInt(e.target.value))}
            />
          </div>
          <div className={`qs-slider ${volume < 8 ? 'is-empty' : ''}`}>
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <input
              className="qs-range"
              type="range"
              min="0"
              max="100"
              value={volume}
              aria-label={language === 'en' ? 'Volume' : 'Volume'}
              style={{ '--val': `${volume}%` } as React.CSSProperties}
              onChange={e => setVolume(parseInt(e.target.value))}
            />
          </div>

          <div className="qs-chips">
            <button type="button" className={`qs-chip ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(!darkMode)}>
              <Moon size={16} />
              <span>{language === 'en' ? 'Dark' : 'Escuro'}</span>
            </button>
            <button type="button" className={`qs-chip ${nightMode ? 'active' : ''}`} onClick={() => setNightMode(!nightMode)}>
              <Sun size={16} />
              <span>{language === 'en' ? 'Night' : 'Noturno'}</span>
            </button>
            <button type="button" className={`qs-chip ${isFullscreen ? 'active' : ''}`} onClick={() => toggleFullscreen()}>
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              <span>{language === 'en' ? 'Fullscreen' : 'Tela cheia'}</span>
            </button>
          </div>

          <div className="qs-media">
            <div className="qs-media-art"><MusicIcon size={18} /></div>
            <div className="qs-media-meta">
              <div className="qs-media-title">{allTracks[currentTrackIndex].title}</div>
              <div className="qs-media-artist">{allTracks[currentTrackIndex].artist}</div>
            </div>
            <div className="qs-media-ctrls">
              <button
                type="button"
                className="icon-btn"
                aria-label={language === 'en' ? 'Previous' : 'Anterior'}
                onClick={(e) => { e.stopPropagation(); setCurrentTrackIndex(currentTrackIndex === 0 ? allTracks.length - 1 : currentTrackIndex - 1); }}
              >
                <SkipBack size={16} />
              </button>
              <button
                type="button"
                className="icon-btn solid"
                aria-label={musicPlaying ? (language === 'en' ? 'Pause' : 'Pausar') : (language === 'en' ? 'Play' : 'Tocar')}
                onClick={(e) => { e.stopPropagation(); setMusicPlaying(!musicPlaying); }}
              >
                {musicPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={language === 'en' ? 'Next' : 'Próxima'}
                onClick={(e) => { e.stopPropagation(); setCurrentTrackIndex((currentTrackIndex + 1) % allTracks.length); }}
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Tela inicial */}
        <main
          id="home-screen"
          className="home-bg-area"
          onMouseDown={handleHomePressStart}
          onMouseUp={handleHomePressEnd}
          onTouchStart={handleHomePressStart}
          onTouchEnd={handleHomePressEnd}
          onClick={(e) => {
            if (isEditingHome) { setIsEditingHome(false); return; }
            const t = e.target as HTMLElement;
            if (t.id === 'home-screen' || t.id === 'home-grid' || t.classList.contains('home-bg-area')) {
              const now = Date.now();
              if (prefs.doubleTapSleep && now - lastTapRef.current < 320) { setScreenOff(true); lastTapRef.current = 0; }
              else lastTapRef.current = now;
            }
          }}
        >
          {!isEditingHome && prefs.home.style !== 'none' && (
            <div className={`home-clock-layer pos-${prefs.home.pos}`} style={{ '--i': 0 } as React.CSSProperties}>
              <ClockFace scope="home" time={systemTime} date={systemDate} />
            </div>
          )}

          {isEditingHome && (
            <div className="edit-bar" onClick={(e) => e.stopPropagation()}>
              <span>{language === 'en' ? 'Edit' : 'Editar'}</span>
              <div className="edit-bar-actions">
                <button type="button" className="btn" onClick={() => setWidgetSheet(true)}>
                  <Grid size={14} />
                  Widgets
                </button>
                <button type="button" className="btn" onClick={() => setWallpaperPickerOpen(true)}>
                  <ImageIcon size={14} />
                  {language === 'en' ? 'Wallpaper' : 'Fundo'}
                </button>
                <button type="button" className="btn primary" onClick={() => setIsEditingHome(false)}>
                  {language === 'en' ? 'Done' : 'Pronto'}
                </button>
              </div>
            </div>
          )}

          <div id="home-grid" className="home-grid home-bg-area">
            {widgets.map(w => {
              const sz = WIDGETS[w.type];
              if (!sz) return null;
              const dd = widgetDrag && widgetDrag.id === w.id && widgetDrag.moved ? widgetDrag : null;
              return (
                <div
                  key={w.id}
                  data-no-sheet-gesture=""
                  className={`home-widget ${isEditingHome && !dd ? 'jiggle' : ''}`}
                  style={{
                    gridColumn: `${w.c + 1} / span ${sz.w}`,
                    gridRow: `${w.r + 1} / span ${sz.h}`,
                    ...(isEditingHome ? { touchAction: 'none' } : {}),
                    ...(dd ? { transform: `translate(${dd.x - dd.startX}px, ${dd.y - dd.startY}px) scale(1.04)`, zIndex: 30, opacity: 0.92, transition: 'none' } : {}),
                  } as React.CSSProperties}
                  onMouseDown={(e) => handleWidgetPressStart(e, w)}
                  onTouchStart={(e) => handleWidgetPressStart(e, w)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isEditingHome && (
                    <button
                      type="button"
                      className="remove-badge"
                      style={{ right: 8, top: 8 }}
                      onClick={(e) => { e.stopPropagation(); setWidgets(ws => ws.filter(x => x.id !== w.id)); }}
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  )}
                  <WidgetView
                    type={w.type}
                    batteryLevel={batteryLevel}
                    isCharging={isCharging}
                    track={allTracks[currentTrackIndex]}
                    playing={musicPlaying}
                    onPrev={() => setCurrentTrackIndex(currentTrackIndex === 0 ? allTracks.length - 1 : currentTrackIndex - 1)}
                    onToggle={() => setMusicPlaying(!musicPlaying)}
                    onNext={() => setCurrentTrackIndex((currentTrackIndex + 1) % allTracks.length)}
                    onOpen={(id) => { if (!isEditingHome) openApp(id); }}
                  />
                </div>
              );
            })}

            {widgetDrag && widgetDrag.moved && widgetDrag.target && (
              <div
                className="home-widget-ghost"
                style={{ gridColumn: `${widgetDrag.target.c + 1} / span ${widgetDrag.w}`, gridRow: `${widgetDrag.target.r + 1} / span ${widgetDrag.h}` }}
              />
            )}
            {homeApps
              .filter(appId => installedApps.includes(appId))
              .map((appId, index) => {
                const meta = appMetadata[appId];
                const cell = placed[appId];
                if (!meta || !cell) return null;
                return (
                  <div
                    key={appId}
                    onMouseDown={(e) => {
                      handleShortcutPressStart(e, appId);
                      handleStartDrag(e, appId, false, 'home');
                    }}
                    onTouchStart={(e) => {
                      handleShortcutPressStart(e, appId);
                      handleStartDrag(e, appId, false, 'home');
                    }}
                    onMouseUp={handleShortcutPressEnd}
                    onTouchEnd={handleShortcutPressEnd}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isEditingHome && (!draggedApp || !dragHasMoved)) {
                        openApp(appId);
                      }
                    }}
                    className={`home-app ${isEditingHome ? (index % 2 === 0 ? 'jiggle' : 'jiggle-alt') : ''}`}
                    style={{ '--i': index + 1, gridColumn: cell.c + 1, gridRow: cell.r + 1, opacity: draggedApp?.appId === appId && dragHasMoved ? 0.35 : 1 } as React.CSSProperties}
                  >
                    {isEditingHome && (
                      <button
                        type="button"
                        className="remove-badge"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setHomeApps(prev => prev.filter(id => id !== appId));
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        title="Remover atalho"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    )}
                    <AppIcon id={appId} size={54} />
                    <span className="home-app-label">{meta.label}</span>
                  </div>
                );
              })}

            {draggedApp && dragHasMoved && dragOverZone === 'home' && (() => {
              const g = document.getElementById('home-grid');
              if (!g) return null;
              const rc = g.getBoundingClientRect();
              const c = Math.max(0, Math.min(COLS - 1, Math.floor((dragPosition.x - rc.left) / (rc.width / COLS))));
              const r = Math.max(0, Math.min(ROWS - 1, Math.floor((dragPosition.y - rc.top) / (rc.height / ROWS))));
              return <div className="home-slot" style={{ gridColumn: c + 1, gridRow: r + 1, alignSelf: 'center' }}><Plus size={18} /></div>;
            })()}
          </div>

          <div
            id="swipe-trigger"
            onClick={() => setAppDrawerOpen(true)}
            title="Toque ou deslize da esquerda para abrir os apps"
          />
        </main>

        {/* Gaveta de apps */}
        <aside id="app-drawer" className={`${appDrawerOpen ? '' : 'closed'} ${prefs.drawerStyle === 'grid' ? 'drawer-grid' : ''}`}>
          <div className="drawer-header">
            <span className="drawer-title">{language === 'en' ? 'Apps' : 'Aplicativos'}</span>
            <span className="drawer-time">{systemTime}</span>
          </div>

          <div className="drawer-list no-scrollbar">
            {[...installedApps]
              .sort((a, b) => {
                const labelA = appMetadata[a]?.label || '';
                const labelB = appMetadata[b]?.label || '';
                return labelA.localeCompare(labelB, 'pt-BR');
              })
              .map((appName) => {
                const meta = appMetadata[appName];
                if (!meta) return null;
                return (
                  <button
                    key={appName}
                    type="button"
                    className="drawer-item"
                    onMouseDown={(e) => handleDrawerPressStart(e, appName)}
                    onTouchStart={(e) => handleDrawerPressStart(e, appName)}
                    onMouseMove={(e) => handleDrawerPressMove(e)}
                    onTouchMove={(e) => handleDrawerPressMove(e)}
                    onMouseUp={() => handleDrawerPressEnd(appName)}
                    onTouchEnd={() => handleDrawerPressEnd(appName)}
                    onMouseLeave={handleDrawerPressCancel}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <AppIcon id={appName} size={40} />
                    <span className="app-label">{meta.label}</span>
                  </button>
                );
              })}
          </div>

          <div className="drawer-footer">{systemDate}</div>
        </aside>

        {/* ==========================================
           7. ACTIVE RUNNING APPLICATIONS (Janela de Cartão Deslizante)
           ========================================== */}
        
        {/* APP A: CONFIGURAÇÕES */}
        <div className={`app-window ${activeApp === 'configuracoes' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <SettingsApp
              userName={userName}
              setUserName={setUserName}
              wifi={wifiActive}
              setWifi={setWifiActive}
              bluetooth={bluetoothActive}
              setBluetooth={setBluetoothActive}
              cellular={cellularActive}
              setCellular={setCellularActive}
              airplaneMode={airplaneMode}
              setAirplaneMode={setAirplaneMode}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              selectedRingtone={selectedRingtone}
              setSelectedRingtone={setSelectedRingtone}
              nightMode={nightMode}
              setNightMode={setNightMode}
              brightness={brightness}
              setBrightness={setBrightness}
              volume={volume}
              setVolume={setVolume}
              useManualBattery={useManualBattery}
              setUseManualBattery={setUseManualBattery}
              simulatedLevel={batteryLevel}
              setSimulatedLevel={setBatteryLevel}
              simulatedCharging={isCharging}
              setSimulatedCharging={setIsCharging}
              wallpapers={wallpapers}
              currentWallpaperIndex={wallpaperIndex}
              setWallpaperIndex={setWallpaperIndex}
              onOpenGallery={() => {
                setActiveApp('galeria');
              }}
              isActive={activeApp === 'configuracoes'}
              installedApps={installedApps}
              onUninstall={handleUninstallApp}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            autoFullscreen={autoFullscreen}
            setAutoFullscreen={setAutoFullscreen}
              language={language}
              setLanguage={setLanguage}
              pincode={pincode}
              setPincode={setPincode}
              userAvatar={userAvatar}
              setUserAvatar={setUserAvatar}
              onResetOS={handleResetOS}
            />
          </div>
        </div>

        {/* APP B: CALCULADORA */}
        <div className={`app-window ${activeApp === 'calculadora' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <Calculator darkMode={darkMode} />
          </div>
        </div>

        {/* APP C: GALERIA */}
        <div className={`app-window ${activeApp === 'galeria' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <GalleryApp
              darkMode={darkMode}
              language={language}
              isActive={activeApp === 'galeria'}
              wallpapers={wallpapers}
              wallpaperIndex={wallpaperIndex}
              lockWallpaperIndex={lockWallpaperIndex}
              onApplyBuiltin={handleApplyBuiltinWallpaper}
              onUsePhoto={handleUseGalleryPhoto}
            />
          </div>
        </div>

        {/* APP D: MENSAGENS */}
        <div className={`app-window ${activeApp === 'mensagens' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <MessagesApp
              chats={chats}
              setChats={setChats}
              darkMode={darkMode}
              isActive={activeApp === 'mensagens'}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              onIncomingMessage={(senderName, text, chatId) => {
                const chatObj = chats.find(c => c.id === chatId);
                triggerNotification(senderName, text, 'mensagens', chatObj?.avatar, chatId);
              }}
            />
          </div>
        </div>

        {/* APP E: MÚSICA */}
        <div className={`app-window ${activeApp === 'musica' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <MusicPlayer
              tracks={allTracks}
              isPlaying={musicPlaying}
              setIsPlaying={setMusicPlaying}
              currentTrackIndex={currentTrackIndex}
              setCurrentTrackIndex={setCurrentTrackIndex}
              volume={volume}
              setVolume={setVolume}
              darkMode={darkMode}
              audio={audioRef.current}
              onImport={handleImportTracks}
              onDeleteTrack={handleDeleteTrack}
              importing={musicBusy}
            />
          </div>
        </div>

        {/* APP F: NAVEGADOR */}
        <div className={`app-window ${activeApp === 'navegador' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <Browser darkMode={darkMode} isActive={activeApp === 'navegador'} online={online} account={account} />
          </div>
        </div>

        {/* APP G: ARQUIVOS */}
        <div className={`app-window ${activeApp === 'arquivos' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <FilesApp
              folders={folders}
              setFolders={setFolders}
              darkMode={darkMode}
              onSetWallpaper={handleSetWallpaperFromFile}
              onPlayTrack={handlePlayTrackFromFile}
              isActive={activeApp === 'arquivos'}
            />
          </div>
        </div>

        {/* APP H: LOJA DE APLICATIVOS */}
        <div className={`app-window ${activeApp === 'loja' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <StoreApp
              darkMode={darkMode}
              installedApps={installedApps}
              onInstall={handleInstallApp}
              onUninstall={handleUninstallApp}
              onOpenApp={openApp}
              customApps={customApps}
              onImportCustomApp={handleImportCustomApp}
              onDeleteCustomApp={handleDeleteCustomApp}
              onSetFollowWallpaper={handleSetCustomFollow}
              onSetOrientation={handleSetCustomOrientation}
              onUpdateCustomApp={patchCustomApp}
            />
          </div>
        </div>

        {/* APP I: BLOCO DE NOTAS */}
        <div className={`app-window ${activeApp === 'notas' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <NotesApp darkMode={darkMode} />
          </div>
        </div>

        {/* APP J: FLAPPY BIRD */}
        <div className={`app-window ${activeApp === 'flappy' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <FlappyApp darkMode={darkMode} isActive={activeApp === 'flappy'} />
          </div>
        </div>

        {/* APP K: PREVISÃO DO TEMPO */}
        <div className={`app-window immersive ${activeApp === 'clima' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <WeatherApp darkMode={darkMode} />
          </div>
        </div>

        {/* APP L: MINI PAINT */}
        <div className={`app-window ${activeApp === 'paint' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <PaintApp darkMode={darkMode} />
          </div>
        </div>

        {/* APP M: TELEFONE */}
        <div className={`app-window ${activeApp === 'telefone' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <PhoneApp darkMode={darkMode} onOpenApp={openApp} />
          </div>
        </div>

        {/* APP N: CONTATOS */}
        <div className={`app-window ${activeApp === 'contatos' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <ContactsApp 
              darkMode={darkMode} 
              onOpenApp={openApp} 
              contacts={contacts}
              onAddContact={addContact}
              onDeleteContact={deleteContact}
            />
          </div>
        </div>

        {/* APP O: CÂMERA */}
        <div className={`app-window immersive ${activeApp === 'camera' ? '' : 'closed'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <CameraApp darkMode={darkMode} isActive={activeApp === 'camera'} />
          </div>
        </div>

        {/* Apps HTML importados: cada um roda isolado num iframe sem acesso ao sistema */}
        {customApps.map(app => (
          <div key={app.id} className={`app-window ${activeApp === app.id ? '' : 'closed'}`}>
            <div className="app-window-header">
              <div className="app-window-drag-handle" />
              <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
                <ChevronDown size={18} />
              </button>
            </div>
            <div className="app-content p-0" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
              {activeApp === app.id && app.kind === 'folder' && (
                folderServer === 'ready' ? (
                  <iframe
                    ref={(el) => { customFrames.current[app.id] = el; }}
                    title={app.name}
                    src={folderUrl(app.id)}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock"
                    allow="autoplay; fullscreen; gamepad; pointer-lock"
                    allowFullScreen
                    style={{ flex: 1, width: '100%', height: '100%', border: 0, background: '#000' }}
                  />
                ) : folderServer === 'error' ? (
                  <div className="flex-1 flex items-center justify-center p-8 text-center text-xs opacity-70">
                    Pacotes de pasta precisam que o AeroOS rode em HTTPS ou em localhost.
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs opacity-60">Preparando…</div>
                )
              )}
              {activeApp === app.id && app.kind !== 'folder' && (
                <iframe
                  ref={(el) => { customFrames.current[app.id] = el; }}
                  title={app.name}
                  srcDoc={withThemeBridge(app.html)}
                  sandbox="allow-scripts allow-forms allow-modals"
                  style={{ flex: 1, width: '100%', height: '100%', border: 0, background: '#fff' }}
                />
              )}
            </div>
          </div>
        ))}

        {/* Dock */}
        <footer
          id="bottom-dock"
          className={dragOverZone === 'dock' ? 'drop-target' : ''}
          style={{ '--i': 6 } as React.CSSProperties}
        >
          {dockApps
            .filter(appId => installedApps.includes(appId))
            .map((appId, index) => {
              const meta = appMetadata[appId];
              if (!meta) return null;
              return (
                <div
                  key={appId}
                  onClick={() => {
                    if (!draggedApp || !dragHasMoved) {
                      openApp(appId);
                    }
                  }}
                  onMouseDown={(e) => handleStartDrag(e, appId, false, 'dock')}
                  onTouchStart={(e) => handleStartDrag(e, appId, false, 'dock')}
                  className={`dock-icon ${isEditingHome ? (index % 2 === 0 ? 'jiggle' : 'jiggle-alt') : ''}`}
                  title={meta.label}
                >
                  {isEditingHome && (
                    <button
                      type="button"
                      className="remove-badge"
                      style={{ right: '-6px', top: '-6px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDockApps(prev => prev.filter(id => id !== appId));
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      title="Remover atalho"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  )}
                  <AppIcon id={appId} size={52} />
                </div>
              );
            })}

          {dockApps.filter(appId => installedApps.includes(appId)).length < 4 && (
            <div className="dock-slot"><Plus size={18} /></div>
          )}
        </footer>

        {/* Animated gesture back indicator on the right edge */}
        {isSwipingBack && swipeBackStartX !== null && (
          <div 
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] pointer-events-none flex items-center justify-end pr-2 transition-opacity duration-150"
            style={{
              width: `${Math.max(40, Math.min(120, swipeBackStartX - swipeBackCurrentX))}px`,
              opacity: Math.min(1, (swipeBackStartX - swipeBackCurrentX) / 50)
            }}
          >
            <div className="w-12 h-24 bg-black/50 backdrop-blur-md border border-white/10 rounded-l-full flex items-center justify-center text-white">
              <ChevronLeft 
                size={24} 
                className="text-white/90 animate-pulse"
                style={{
                  transform: `translateX(${Math.max(-16, -((swipeBackStartX - swipeBackCurrentX) / 4))}px)`
                }}
              />
            </div>
          </div>
        )}

        {/* Multitarefa */}
        {recentAppsOpen && (
          <div className="recents" onClick={() => setRecentAppsOpen(false)}>
            <div className="recents-track no-scrollbar">
              {openedApps.length === 0 ? (
                <div className="empty-state" style={{ width: '100%', color: 'rgba(255,255,255,0.5)' }}>
                  <span>Nenhum app aberto</span>
                </div>
              ) : (
                openedApps.map((appName) => {
                  const meta = appMetadata[appName];
                  if (!meta) return null;
                  return (
                    <motion.div
                      key={appName}
                      className="recent-card"
                      drag="y"
                      dragConstraints={{ top: -300, bottom: 0 }}
                      dragElastic={{ top: 0.8, bottom: 0.1 }}
                      onDragEnd={(event, info) => {
                        // Deslizar mais de 120px para cima fecha o app
                        if (info.offset.y < -120) {
                          setOpenedApps(prev => prev.filter(name => name !== appName));
                          if (activeApp === appName) {
                            setActiveApp(null);
                          }
                        }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openApp(appName);
                        setRecentAppsOpen(false);
                      }}
                    >
                      <div className="recent-card-head">
                        <AppIcon id={appName} size={24} />
                        <span>{meta.label}</span>
                      </div>
                      <div className="recent-card-body">
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '384px',
                            height: '488px',
                            transformOrigin: 'top left',
                            transform: 'scale(0.5)'
                          }}
                        >
                          {renderAppPreviewContent(appName)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {openedApps.length > 0 && (
              <button
                type="button"
                className="recent-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenedApps([]);
                  setActiveApp(null);
                  setRecentAppsOpen(false);
                }}
              >
                Fechar tudo
              </button>
            )}
          </div>
        )}

        {/* Aviso de notificação (arraste para cima para dispensar, para baixo para abrir) */}
        <AnimatePresence>
          {activePopup && (
            <motion.div
              key={activePopup.id}
              className="toast"
              style={{ pointerEvents: toastLive ? 'auto' : 'none' }}
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -90, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              drag
              dragSnapToOrigin
              dragMomentum={false}
              dragConstraints={{ left: -320, right: 320, top: -160, bottom: 160 }}
              dragElastic={0.35}
              onDragStart={() => { toastDraggedRef.current = true; }}
              onDragEnd={(event, info) => {
                const dist = Math.hypot(info.offset.x, info.offset.y);
                const speed = Math.hypot(info.velocity.x, info.velocity.y);
                if (dist > 70 || speed > 600) setActivePopup(null);
                window.setTimeout(() => { toastDraggedRef.current = false; }, 0);
              }}
              onClick={() => { if (!toastDraggedRef.current) handlePopupAction(activePopup); }}
            >
              <div className="toast-icon"><NotifAppIcon app={activePopup.app} /></div>
              <div className="toast-body">
                <div className="toast-head">
                  <span className="toast-title">{activePopup.title}</span>
                  <span className="toast-time">Agora</span>
                </div>
                <p className="toast-text">{activePopup.body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de gesto: toque para voltar à tela inicial / ver recentes */}
        <div
          className="home-indicator"
          onClick={() => {
            if (activeApp !== null) {
              setActiveApp(null);
              setRecentAppsOpen(false);
            } else {
              setRecentAppsOpen(!recentAppsOpen);
            }
          }}
          title="Toque para voltar à tela inicial / ver aplicativos recentes"
        />

        {/* Escolher widget */}
        <AnimatePresence>
          {widgetSheet && (
            <motion.div
              className="sheet-bottom-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWidgetSheet(false)}
            >
              <motion.div
                className="sheet-bottom"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sheet-title">
                  <span>Widgets</span>
                  <button type="button" className="sheet-action" onClick={() => setWidgetSheet(false)}>Fechar</button>
                </div>
                {Object.entries(WIDGETS).map(([type, m]) => (
                  <button key={type} type="button" className="widget-opt" onClick={() => addWidget(type)}>
                    <span className="ico">{m.icon}</span>
                    <span className="font-medium">{m.label}</span>
                    <small>{m.w}×{m.h}</small>
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallpaper Picker Sheet (Long-Press Home Screen overlay) */}
        <AnimatePresence>
          {wallpaperPickerOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-[250] flex flex-col justify-end"
              onClick={() => setWallpaperPickerOpen(false)}
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full bg-slate-900/95 border-t border-white/10 rounded-t-[32px] p-6 pb-8 flex flex-col gap-5 max-h-[80%] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-base tracking-tight">Alterar Papel de Parede</span>
                    <span className="text-slate-400 text-[11px] font-bold">Toque para selecionar</span>
                  </div>
                  <button 
                    onClick={() => setWallpaperPickerOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer border-none transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/5 text-xs font-semibold">
                  <button
                    onClick={() => setWallpaperTarget('home')}
                    className={`flex-1 py-1.5 rounded-lg border-none cursor-pointer transition-all ${wallpaperTarget === 'home' ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                  >
                    Tela Inicial
                  </button>
                  <button
                    onClick={() => setWallpaperTarget('lock')}
                    className={`flex-1 py-1.5 rounded-lg border-none cursor-pointer transition-all ${wallpaperTarget === 'lock' ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                  >
                    Tela de Bloqueio
                  </button>
                  <button
                    onClick={() => setWallpaperTarget('both')}
                    className={`flex-1 py-1.5 rounded-lg border-none cursor-pointer transition-all ${wallpaperTarget === 'both' ? 'bg-violet-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
                  >
                    Ambas
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-6">
                  {/* Animados Section */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      Papéis de parede animados
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {wallpapers
                        .map((w, idx) => ({ ...w, originalIdx: idx }))
                        .filter(w => w.isAnimated)
                        .map((w) => {
                          const isSelected = wallpaperTarget === 'lock' ? lockWallpaperIndex === w.originalIdx : wallpaperIndex === w.originalIdx;
                          return (
                            <button
                              key={w.name}
                              onClick={() => {
                                if (wallpaperTarget === 'home' || wallpaperTarget === 'both') handleSetWallpaperFromFile(w.originalIdx);
                                if (wallpaperTarget === 'lock' || wallpaperTarget === 'both') setLockWallpaperIndex(w.originalIdx);
                                setWallpaperPickerOpen(false);
                              }}
                              className={`group relative h-20 rounded-2xl border text-left overflow-hidden transition-all active:scale-[0.98] cursor-pointer ${
 isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/25' : 'border-white/10 hover:border-white/20'
 }`}
                              style={{ background: w.gradient }}
                            >
                              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2.5">
                                <span className="text-white text-[11px] font-semibold truncate w-full group-hover:text-emerald-300 transition-colors">
                                  {w.name.replace('★ ', '')}
                                </span>
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-emerald-500 text-white p-0.5 rounded-full">
                                    <Check size={10} strokeWidth={4} />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Estáticos Section */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-sky-400 text-[11px] font-semibold flex items-center gap-1">
                      Papéis de parede estáticos
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setActiveApp('galeria');
                          setWallpaperPickerOpen(false);
                        }}
                        className="group relative h-20 rounded-2xl border border-dashed border-white/20 hover:border-white/45 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-center transition-all active:scale-[0.98] cursor-pointer text-slate-300 gap-1"
                      >
                        <Plus size={16} />
                        <span className="text-white text-[11px] font-semibold">Escolher da Galeria</span>
                      </button>
                      {wallpapers
                        .map((w, idx) => ({ ...w, originalIdx: idx }))
                        .filter(w => !w.isAnimated)
                        .map((w) => {
                          const isSelected = wallpaperTarget === 'lock' ? lockWallpaperIndex === w.originalIdx : wallpaperIndex === w.originalIdx;
                          return (
                            <button
                              key={w.name}
                              onClick={() => {
                                if (wallpaperTarget === 'home' || wallpaperTarget === 'both') handleSetWallpaperFromFile(w.originalIdx);
                                if (wallpaperTarget === 'lock' || wallpaperTarget === 'both') setLockWallpaperIndex(w.originalIdx);
                                setWallpaperPickerOpen(false);
                              }}
                              className={`group relative h-20 rounded-2xl border text-left overflow-hidden transition-all active:scale-[0.98] cursor-pointer ${
 isSelected ? 'border-sky-500 ring-2 ring-sky-500/25' : 'border-white/10 hover:border-white/20'
 }`}
                              style={{ background: w.gradient }}
                            >
                              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2.5">
                                <span className="text-white text-[11px] font-semibold truncate w-full group-hover:text-sky-300 transition-colors">
                                  {w.name}
                                </span>
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-sky-500 text-white p-0.5 rounded-full">
                                    <Check size={10} strokeWidth={4} />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Atalho sendo arrastado */}
        {draggedApp && dragHasMoved && (
          <div
            className="fixed pointer-events-none z-[9999] flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 select-none"
            style={{ left: dragPosition.x, top: dragPosition.y }}
          >
            <div style={{ transform: 'scale(1.12)', opacity: 0.94 }}>
              <AppIcon id={draggedApp.appId} size={56} />
            </div>
            <span className="text-[11px] font-medium text-white">
              {appMetadata[draggedApp.appId]?.label}
            </span>
          </div>
        )}

        {/* Tela apagada: dois toques ligam na tela de bloqueio */}
        {screenOff && (
          <div
            className="screen-off"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={() => {
              const now = Date.now();
              if (now - lastTapRef.current < 320) {
                setScreenOff(false);
                setIsLocked(true);
                setActiveApp(null);
                setRecentAppsOpen(false);
                closeSheets();
                lastTapRef.current = 0;
              } else {
                lastTapRef.current = now;
              }
            }}
          />
        )}

        {/* Fundo da área do sistema (botões ou gestos): desfoque pesado + escurecimento */}
        {!isBooting && !isLocked && !screenOff && <div id="bottom-scrim" />}

        {/* Paisagem: barra de status em pílulas, girada junto com o app */}
        {landscape && activeApp !== null && !isLocked && !isBooting && (() => {
          const tone = customApps.find(a => a.id === activeApp)?.statusTone ?? 'auto';
          return (
            <div className="rot-frame" aria-hidden="true">
              <StatusPills time={systemTime} dark={tone === 'dark' || (tone === 'auto' && darkMode)} wifi={wifiActive} cellular={cellularActive}
                bluetooth={bluetoothActive} airplane={airplaneMode} battery={batteryLevel} charging={isCharging} unread={notifications.length} />
            </div>
          );
        })()}

        {/* Teclado do sistema */}
        <SystemKeyboard darkMode={darkMode} overlay={isBooting || isLocked || (!!account && !signedIn)} />

        {/* Navegação por botões (estilo Android) */}
        {prefs.navStyle === 'buttons' && !isBooting && !isLocked && !screenOff && (
          <nav id="nav-bar" aria-label={language === 'en' ? 'Navigation' : 'Navegação'}>
            <button type="button" className="nav-btn" onClick={goBack} aria-label={language === 'en' ? 'Back' : 'Voltar'}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15.5 5.5 L8 12 L15.5 18.5 Z" fill="currentColor" /></svg>
            </button>
            <button type="button" className="nav-btn" onClick={goHome} aria-label={language === 'en' ? 'Home' : 'Início'}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
            <button type="button" className="nav-btn" onClick={toggleRecents} aria-label={language === 'en' ? 'Recent apps' : 'Apps em segundo plano'}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
          </nav>
        )}

        {/* Boot & Setup wizard Screen overlay */}
        {isBooting && (
          <BootSetupScreen
            language={language}
            setLanguage={setLanguage}
            userName={userName}
            setUserName={setUserName}
            userAvatar={userAvatar}
            setUserAvatar={setUserAvatar}
            pincode={pincode}
            setPincode={setPincode}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            wallpaperIndex={wallpaperIndex}
            setWallpaperIndex={setWallpaperIndex}
            isSetupCompleted={isSetupCompleted}
            hasAccount={!!account}
            onComplete={(acc) => {
              if (acc) {
                setAccount(acc);
                setSignedIn(true);
              }
              setIsBooting(false);
              setIsSetupCompleted(true);
              // Sem PIN: desbloqueia direto. Com PIN: mostra a tela de bloqueio.
              // (O PIN é lido do armazenamento porque a conta acabou de ser criada.)
              const pin = acc ? (localStorage.getItem('os_pincode') || '') : pincode;
              setIsLocked(!!pin);
            }}
          />
        )}

        {/* Lock Screen overlay */}
        {!isBooting && isLocked && (
          <LockScreen
            language={language}
            userName={userName}
            userAvatar={userAvatar}
            pincode={pincode}
            wallpaper={currentLockWallpaper}
            notifications={notifications.map(n => ({ id: n.id, app: n.app, title: n.title, message: n.body, time: n.time }))}
            onDismissNotification={(id) => removeNotification(id)}
            renderAppIcon={(id) => <NotifAppIcon app={id} />}
            appLabel={(id) => appMetadata[id]?.label ?? id}
            onOpenApp={(appName) => {
              openApp(appName);
              setIsLocked(false);
            }}
            onUnlock={() => setIsLocked(false)}
            onReset={handleResetOS}
            onSignOut={() => {
              signOut();
              setSignedIn(false);
              setIsLocked(true);
              setActiveApp(null);
              setRecentAppsOpen(false);
              closeSheets();
            }}
          />
        )}

        {/* Entrada na conta AeroOS: depois do boot, enquanto ninguém estiver conectado */}
        <AnimatePresence>
          {!isBooting && account && !signedIn && (
            <SignInScreen
              key="signin"
              account={account}
              language={language}
              onSignedIn={() => {
                setSignedIn(true);
                if (!pincode) setIsLocked(false);
              }}
            />
          )}
        </AnimatePresence>

      </div>
      </div>
    </div>
  );
}
