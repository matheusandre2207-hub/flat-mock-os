import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, WifiOff, Bluetooth, Signal, Plane, Moon, Sun, 
  Volume2, VolumeX, Sliders, Search, User, Folder, FileText, 
  Image as ImageIcon, Music as MusicIcon, Globe, Settings, 
  ChevronRight, ChevronLeft, X, Play, Pause, SkipForward, SkipBack, 
  Send, Trash2, Clock, Smartphone, Bell, MessageSquare, Plus, Minus,
  Grid, Compass, FolderClosed, PlayCircle, Eye, EyeOff, Maximize, Minimize, Check
} from 'lucide-react';

import { Wallpaper, NotificationItem, PopupNotification, Track, Chat, Folder as FolderType, Contact, CapturedPhoto } from './types';
import { wallpapersList, initialNotifications, tracksList, initialChats, initialFolders } from './data';

// Component imports
import BatteryDots from './components/BatteryDots';
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

const appMetadata: Record<string, { label: string; icon: string; iconBgClass: string }> = {
  arquivos: { label: 'Arquivos', icon: '📁', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  calculadora: { label: 'Calculadora', icon: '🧮', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  configuracoes: { label: 'Configurações', icon: '⚙️', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  galeria: { label: 'Galeria', icon: '🖼️', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  mensagens: { label: 'Mensagens', icon: '💬', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  musica: { label: 'Música', icon: '🎵', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  navegador: { label: 'Navegador', icon: '🌐', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  loja: { label: 'App Store', icon: '🛍️', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  notas: { label: 'Bloco de Notas', icon: '📝', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  flappy: { label: 'Flappy Bird', icon: '🐦', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  clima: { label: 'Previsão do Tempo', icon: '☀️', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  paint: { label: 'Mini Paint', icon: '🎨', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  telefone: { label: 'Telefone', icon: '📞', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  contatos: { label: 'Contatos', icon: '👥', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' },
  camera: { label: 'Câmera', icon: '📷', iconBgClass: 'bg-zinc-900 border border-zinc-800/80 text-zinc-300' }
};

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

  const [wifiActive, setWifiActive] = useState(true);
  const [bluetoothActive, setBluetoothActive] = useState(true);
  const [cellularActive, setCellularActive] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);

  // Localized app names and metadata
  const appMetadata: Record<string, { label: string; icon: string; iconBgClass: string }> = {
    arquivos: { label: language === 'en' ? 'Files' : 'Arquivos', icon: '📁', iconBgClass: 'bg-sky-100 dark:bg-sky-950/80 border border-sky-200/60 dark:border-sky-900/40 text-sky-600 dark:text-sky-400' },
    calculadora: { label: language === 'en' ? 'Calculator' : 'Calculadora', icon: '🧮', iconBgClass: 'bg-orange-100 dark:bg-orange-950/80 border border-orange-200/60 dark:border-orange-900/40 text-orange-600 dark:text-orange-400' },
    configuracoes: { label: language === 'en' ? 'Settings' : 'Configurações', icon: '⚙️', iconBgClass: 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300' },
    galeria: { label: language === 'en' ? 'Gallery' : 'Galeria', icon: '🖼️', iconBgClass: 'bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400' },
    mensagens: { label: language === 'en' ? 'Messages' : 'Mensagens', icon: '💬', iconBgClass: 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
    musica: { label: language === 'en' ? 'Music' : 'Música', icon: '🎵', iconBgClass: 'bg-rose-100 dark:bg-rose-950/80 border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400' },
    navegador: { label: language === 'en' ? 'Browser' : 'Navegador', icon: '🌐', iconBgClass: 'bg-blue-100 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400' },
    loja: { label: 'App Store', icon: '🛍️', iconBgClass: 'bg-violet-100 dark:bg-violet-950/80 border border-violet-200/60 dark:border-violet-900/40 text-violet-600 dark:text-violet-400' },
    notas: { label: language === 'en' ? 'Notes' : 'Bloco de Notas', icon: '📝', iconBgClass: 'bg-yellow-100 dark:bg-yellow-950/80 border border-yellow-200/60 dark:border-yellow-900/40 text-yellow-600 dark:text-yellow-400' },
    flappy: { label: 'Flappy Bird', icon: '🐦', iconBgClass: 'bg-sky-100 dark:bg-sky-950/80 border border-sky-200/60 dark:border-sky-900/40 text-sky-600 dark:text-sky-400' },
    clima: { label: language === 'en' ? 'Weather' : 'Previsão do Tempo', icon: '☀️', iconBgClass: 'bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-200/60 dark:border-cyan-900/40 text-cyan-600 dark:text-cyan-400' },
    paint: { label: 'Mini Paint', icon: '🎨', iconBgClass: 'bg-fuchsia-100 dark:bg-fuchsia-950/80 border border-fuchsia-200/60 dark:border-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400' },
    telefone: { label: language === 'en' ? 'Phone' : 'Telefone', icon: '📞', iconBgClass: 'bg-green-100 dark:bg-green-950/80 border border-green-200/60 dark:border-green-900/40 text-green-600 dark:text-green-400' },
    contatos: { label: language === 'en' ? 'Contacts' : 'Contatos', icon: '👥', iconBgClass: 'bg-teal-100 dark:bg-teal-950/80 border border-teal-200/60 dark:border-teal-900/40 text-teal-600 dark:text-teal-400' },
    camera: { label: language === 'en' ? 'Camera' : 'Câmera', icon: '📷', iconBgClass: 'bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300' }
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

  useEffect(() => { localStorage.setItem('os_wallpapers', JSON.stringify(wallpapers)); }, [wallpapers]);
  useEffect(() => { localStorage.setItem('os_wallpaper_index', String(wallpaperIndex)); }, [wallpaperIndex]);

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
    setIsSetupCompleted(false);
    setIsBooting(true);
    setIsLocked(true);
    setActiveApp(null);
    setOpenedApps([]);
    setRecentAppsOpen(false);
    setAppDrawerOpen(false);
    setNotificationsOpen(false);
    setUtilitiesOpen(false);
  };

  // Shell Navigation & Dropdowns
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);

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

  // Standalone gallery lightbox state
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<number | null>(null);

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
            // Static fallback
            const staticContact = randomIncomingMessages.find(rc => rc.chatId === targetChat.id) || randomIncomingMessages[0];
            return staticContact.texts[Math.floor(Math.random() * staticContact.texts.length)];
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
  const touchStartYRef = useRef<number>(0);
  const touchCurrentYRef = useRef<number>(0);
  const isHoldingBottomSwipeRef = useRef<boolean>(false);

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
  const handleSetWallpaperFromFile = (idx: number) => {
    setWallpaperIndex(idx);
  };

  const handlePlayTrackFromFile = (trackTitle: string) => {
    const trackIdx = tracksList.findIndex(t => t.title === trackTitle);
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
        // Drop shortcut in the home screen grid
        setHomeApps(prev => {
          if (prev.includes(appId)) return prev; // Avoid duplicates
          
          // Remove from bottom dock if it was dragged from there
          if (origin === 'dock') {
            setDockApps(d => d.filter(id => id !== appId));
          }
          return [...prev, appId];
        });
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

  // Gesto de deslizar (Swipe) para abrir a gaveta pela esquerda, voltar pela direita ou multitarefa de baixo
  const handleTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    setTouchStartX(x);
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
    const isNearCenterBottom = Math.abs(x - window.innerWidth / 2) < 80;
    if (y > window.innerHeight - 30 && isNearCenterBottom && !isDrawingOrGameCanvas && !isInteractiveApp && !isInteractiveElement) {
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
    } else if (x > window.innerWidth - 25 && activeApp !== null && !isDrawingOrGameCanvas && !isInteractiveApp && !isInteractiveElement) {
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
    if (swipeUpTimerRef.current) {
      clearTimeout(swipeUpTimerRef.current);
      swipeUpTimerRef.current = null;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    if (notificationsOpen || utilitiesOpen || appDrawerOpen) {
      if ((touchStartYRef.current || touchEndY) - touchEndY > 35) {
        setNotificationsOpen(false);
        setUtilitiesOpen(false);
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
    if (touchStartX !== null && touchStartX < 70 && dragDistanceLeftToRight > 80 && dragVerticalLeftToRight < dragDistanceLeftToRight * 0.5) {
      setAppDrawerOpen(true);
      setNotificationsOpen(false);
      setUtilitiesOpen(false);
    }
  };

  const renderAppPreviewContent = (appName: string) => {
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
          <div className={`no-scrollbar pt-4 pb-24 px-5 space-y-6 overflow-y-auto h-full ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
            {capturedPhotos.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-base flex items-center gap-2"><span>📸</span> Fotos Capturadas</h3>
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  {capturedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => {
                        setActiveApp('camera');
                      }}
                      className={`aspect-[3/4] rounded-2xl overflow-hidden relative shadow-md border border-white/10 bg-gradient-to-tr ${photo.url} cursor-pointer hover:scale-[1.02] transition-transform`}
                    >
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-3xl">📸</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                        <p className="font-bold text-xs leading-tight">Foto Capturada</p>
                        <p className="text-[9px] font-mono opacity-70">{photo.timestamp} • {photo.filter}</p>
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
                  className="aspect-[9/16] rounded-2xl overflow-hidden relative shadow-md border border-white/5 cursor-pointer"
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
            tracks={tracksList}
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
        return <Browser darkMode={darkMode} isActive={false} />;
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
    <div className="w-screen h-screen overflow-hidden select-none bg-black">
      <div 
        id="screen-container"
        className={`
          ${darkMode ? 'dark theme-dark' : 'theme-light'}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          filter: `brightness(${brightness}%)`
        }}
      >
        
        {/* ==========================================
           1. CORE SCREEN OVERLAYS (Comfort Warmth)
           ========================================== */}
        {/* Night comfort amber tint filter screen */}
        <div 
          className="night-shield-overlay" 
          style={{ opacity: nightMode ? 1 : 0 }} 
        />



        {/* ==========================================
           2. SYSTEM WALLPAPER BACKGROUND (Metal Shift Animado)
           ========================================== */}
        <div 
          id="wallpaper"
          className="transition-all duration-500 overflow-hidden relative w-full h-full"
          style={{ background: currentWallpaper.gradient }}
        >
          {/* Animated elements based on type */}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'aurora' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
              <div className="absolute w-[240px] h-[240px] rounded-full bg-emerald-500/30 blur-[60px] top-[10%] left-[10%] animate-[float1_12s_infinite_alternate]" />
              <div className="absolute w-[280px] h-[280px] rounded-full bg-teal-500/25 blur-[70px] bottom-[15%] right-[5%] animate-[float2_18s_infinite_alternate]" />
              <div className="absolute w-[200px] h-[200px] rounded-full bg-purple-500/20 blur-[50px] top-[40%] right-[25%] animate-[float3_15s_infinite_alternate]" />
            </div>
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'matrix' && (
            <MatrixWallpaper />
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'particles' && (
            <ParticlesWallpaper />
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'metal-liquid' && (
            <LiquidMetalWallpaper />
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'gradient-shift' && (
            <GradientShiftWallpaper />
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'waves' && (
            <OceanWavesWallpaper />
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'geometric' && (
            <GeometricSaturnWallpaper />
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'cyber-neon' && (
            <CyberNeonWallpaper />
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'starfield' && (
            <StarfieldWallpaper />
          )}
          {currentWallpaper.isAnimated && currentWallpaper.animatedType === 'lava-lamp' && (
            <LavaLampWallpaper />
          )}
        </div>

        {/* Background visual blur overlay when utilities, notifications or app drawer is open */}
        {(notificationsOpen || utilitiesOpen || appDrawerOpen) && (
          <button 
            id="overlay-blur"
            onClick={() => {
              setNotificationsOpen(false);
              setUtilitiesOpen(false);
              setAppDrawerOpen(false);
            }}
            className="w-full h-full text-left border-none focus:outline-none cursor-pointer"
          />
        )}

        {/* ==========================================
           3. SYSTEM STATUS BAR (Clock & Pill - mix-blend-mode: difference)
           ========================================== */}
        <header 
          id="status-bar"
          onMouseMove={handleStatusPullMove}
          onTouchMove={handleStatusPullMove}
          onMouseUp={handleStatusPullEnd}
          onTouchEnd={handleStatusPullEnd}
        >
          <div 
            className="status-zone left cursor-pointer select-none" 
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
            className="status-zone right cursor-pointer select-none" 
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
              <svg className="pill-svg" viewBox="0 0 24 24" id="wifi-icon" style={{ width: '17px', height: '13px', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' }}>
                <circle cx="12" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
                <path d="M8.5 15.5a5 3.2 0 0 1 7 0" />
                <path d="M5 11.5a10 6 0 0 1 14 0" />
                <path d="M1.5 7.5a15 8.5 0 0 1 21 0" />
              </svg>
              <div className="cellular-bars">
                <div className="bar bar1"></div>
                <div className="bar bar2"></div>
                <div className="bar bar3"></div>
                <div className="bar bar4"></div>
              </div>
              <BatteryDots level={batteryLevel} isCharging={isCharging} />
            </div>
          </div>
        </header>

        {/* ==========================================
           4. DROPDOWN CONTROL PANELS (Animações Nativas do OS)
           ========================================== */}
        
        {/* PANEL 4A: NOTIFICATIONS LIST DRAWER */}
        <div 
          id="panel-notifications"
          className={notificationsOpen ? '' : 'closed'}
        >
          <div className="panel-top-cap" />
          <div className="panel-center-content">
            <div className="panel-header flex justify-between items-center w-full">
              <span>{language === 'en' ? 'Notifications' : 'Notificações'}</span>
              {notifications.length > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setNotifications([]); }}
                  className="text-[10px] text-blue-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  {language === 'en' ? 'Clear All' : 'Limpar Tudo'}
                </button>
              )}
            </div>

            <div className="panel-content w-full space-y-2 overflow-y-auto no-scrollbar max-h-72">
              {notifications.length === 0 ? (
                <p className="text-center py-6 text-xs text-white/40">
                  {language === 'en' ? 'No recent notifications' : 'Nenhuma notificação recente'}
                </p>
              ) : (
                notifications.map(item => (
                  <div 
                    key={item.id} 
                    className="notification-item relative"
                  >
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                    <span className="text-[9px] text-white/30 font-mono mt-1.5 block">{item.time}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeNotification(item.id); }}
                      className="absolute top-3 right-3 text-white/40 hover:text-white bg-transparent border-none cursor-pointer"
                      title={language === 'en' ? 'Remove' : 'Remover'}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="panel-bottom-cap" />
        </div>

        {/* PANEL 4B: UTILITY ATALHOS PANEL */}
        <div 
          id="panel-utilities"
          className={utilitiesOpen ? '' : 'closed'}
        >
          <div className="panel-top-cap" />
          <div className="panel-center-content">
            
            {/* 1. Fileira de 4 botões redondos */}
            <div className="panel-row-round-buttons">
              <button 
                onClick={() => !airplaneMode && setWifiActive(!wifiActive)}
                disabled={airplaneMode}
                className={`round-btn ${wifiActive ? 'active' : ''}`}
                title="Wi-Fi"
              >
                <Wifi size={20} />
              </button>
              <button 
                onClick={() => !airplaneMode && setBluetoothActive(!bluetoothActive)}
                disabled={airplaneMode}
                className={`round-btn ${bluetoothActive ? 'active' : ''}`}
                title="Bluetooth"
              >
                <Bluetooth size={20} />
              </button>
              <button 
                onClick={() => !airplaneMode && setCellularActive(!cellularActive)}
                disabled={airplaneMode}
                className={`round-btn ${cellularActive ? 'active' : ''}`}
                title="Dados Móveis"
              >
                <Signal size={20} />
              </button>
              <button 
                onClick={() => {
                  const val = !airplaneMode;
                  setAirplaneMode(val);
                  if (val) {
                    setWifiActive(false);
                    setBluetoothActive(false);
                    setCellularActive(false);
                  }
                }}
                className={`round-btn ${airplaneMode ? 'active bg-amber-500 text-white' : ''}`}
                title="Modo Avião"
              >
                <Plane size={20} className="rotate-45" />
              </button>
            </div>

            {/* 2. Duas barras deslizantes largas e arredondadas */}
            <div className="panel-sliders-container">
              <div className="panel-slider-row">
                <span className="slider-glyph">⛭</span>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={brightness} 
                  onChange={e => setBrightness(parseInt(e.target.value))}
                />
              </div>
              <div className="panel-slider-row">
                <span className="slider-glyph">🔊</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={e => setVolume(parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* 3. Grid de baixo (Toggles na esquerda, Mídia na direita) */}
            <div className="panel-bottom-grid">
              <div className="panel-vertical-toggles">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`toggle-btn ${darkMode ? 'active' : ''}`}
                >
                  <Moon size={16} />
                  <span>{language === 'en' ? 'Dark Mode' : 'Modo Escuro'}</span>
                </button>
                <button 
                  onClick={() => setNightMode(!nightMode)}
                  className={`toggle-btn ${nightMode ? 'active' : ''}`}
                >
                  <Sun size={16} />
                  <span>{language === 'en' ? 'Night Shield' : 'Modo Noturno'}</span>
                </button>
                <button 
                  onClick={() => toggleFullscreen()}
                  className={`toggle-btn ${isFullscreen ? 'active bg-blue-600 text-white' : ''}`}
                  title={language === 'en' ? 'Hide system status bar (Fullscreen)' : 'Esconder barra de status do celular Android (Tela Cheia)'}
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  <span>
                    {isFullscreen 
                      ? (language === 'en' ? 'Minimize' : 'Minimizar') 
                      : (language === 'en' ? 'Fullscreen' : 'Tela Cheia')}
                  </span>
                </button>
              </div>
              
              <div className="panel-media-player">
                <span className="media-icon">🎵</span>
                <div className="flex-1 min-w-0 flex flex-col justify-center px-1">
                  <p className="text-[10px] font-bold truncate text-white/95 leading-tight">
                    {tracksList[currentTrackIndex].title}
                  </p>
                  <p className="text-[8px] text-white/60 truncate leading-none mt-0.5">
                    {tracksList[currentTrackIndex].artist}
                  </p>
                </div>
                <div className="media-controls">
                  <span onClick={(e) => { e.stopPropagation(); setCurrentTrackIndex(currentTrackIndex === 0 ? tracksList.length - 1 : currentTrackIndex - 1); }} title="Anterior">⏮</span>
                  <span onClick={(e) => { e.stopPropagation(); setMusicPlaying(!musicPlaying); }} title={musicPlaying ? "Pausar" : "Tocar"}>
                    {musicPlaying ? '⏸' : '▶'}
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); setCurrentTrackIndex((currentTrackIndex + 1) % tracksList.length); }} title="Próxima">⏭</span>
                </div>
              </div>
            </div>

          </div>
          <div className="panel-bottom-cap" />
        </div>

        {/* ==========================================
           5. SYSTEM HOME SCREEN
           ========================================== */}
        <main 
          id="home-screen"
          className="home-bg-area relative p-4 pt-3 flex flex-col justify-start gap-3"
          onMouseDown={handleHomePressStart}
          onMouseUp={handleHomePressEnd}
          onTouchStart={handleHomePressStart}
          onTouchEnd={handleHomePressEnd}
          onClick={() => {
            if (isEditingHome) {
              setIsEditingHome(false);
            }
          }}
        >
          {/* iOS style Edit Mode active badge */}
          {isEditingHome && (
            <div 
              className="w-full bg-slate-950/90 backdrop-blur-md rounded-2xl px-4 py-2.5 flex items-center justify-between border border-white/10 shadow-lg z-50 animate-pulse shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] font-black text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Modo de Edição
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setWallpaperPickerOpen(true)}
                  className="px-2.5 py-1 text-[9px] font-extrabold bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border-none cursor-pointer"
                >
                  🖼️ Papel de Parede
                </button>
                <button 
                  onClick={() => setIsEditingHome(false)}
                  className="px-3 py-1 text-[9px] font-extrabold bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all border-none cursor-pointer"
                >
                  Pronto
                </button>
              </div>
            </div>
          )}

          {/* Desktop Apps Shortcuts Grid */}
          <div className="home-bg-area grid grid-cols-4 gap-x-3 gap-y-5 max-h-[78%] overflow-y-auto no-scrollbar pt-2 z-10 select-none">
            {homeApps
              .filter(appId => installedApps.includes(appId))
              .map((appId, index) => {
                const meta = appMetadata[appId];
                if (!meta) return null;
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
                    className={`flex flex-col items-center gap-1.5 cursor-pointer relative text-center select-none group ${
                      isEditingHome 
                        ? (index % 2 === 0 ? 'jiggle' : 'jiggle-alt') 
                        : 'hover:scale-105 active:scale-95 transition-all'
                    }`}
                  >
                    {/* iOS style delete button */}
                    {isEditingHome && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setHomeApps(prev => prev.filter(id => id !== appId));
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="absolute w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white shadow-md z-30 cursor-pointer active:scale-90 select-none"
                        style={{ right: 'calc(50% - 24px)', top: '-2px' }}
                        title="Remover atalho"
                      >
                        ✕
                      </button>
                    )}

                    <div className={`w-11 h-11 rounded-[14px] ${meta.iconBgClass} flex items-center justify-center text-2xl shadow-md border border-white/5`}>
                      {meta.icon}
                    </div>
                    <span 
                      className="text-[9.5px] font-black text-white leading-tight truncate w-full max-w-[62px]"
                      style={{ textShadow: '0 1.5px 3px rgba(0,0,0,0.85)' }}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
              })}
              
            {/* Dashed visual slot when dragging an item */}
            {draggedApp && dragHasMoved && (
              <div className="border border-dashed border-white/25 rounded-[14px] w-11 h-11 flex items-center justify-center text-white/20 text-lg bg-white/5 animate-pulse">
                +
              </div>
            )}
          </div>

          <div 
            id="swipe-trigger"
            onClick={() => setAppDrawerOpen(true)}
            title="Toque ou deslize da esquerda para abrir a Grade de Apps"
          />
        </main>

        {/* ==========================================
           6. SLIDE-OUT APP DRAWER (Visual e Animação Lateral do Usuário)
           ========================================== */}
        <aside 
          id="app-drawer"
          className={appDrawerOpen ? '' : 'closed'}
        >
          {/* Drawer Header */}
          <div className="drawer-header">
            <div className="drawer-header-left">
              <span className="grid-icon">⣿</span>
              <span className="drawer-title">Grade de aplicativos</span>
            </div>
            <span className="drawer-time">{systemTime}</span>
          </div>

          {/* Apps List */}
          <div className="drawer-list no-scrollbar flex flex-col gap-1">
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
                    className="drawer-item flex items-center p-2.5 transition-all active:scale-95 cursor-pointer text-left w-full hover:bg-white/10 select-none border-none outline-none bg-transparent" 
                    onMouseDown={(e) => handleDrawerPressStart(e, appName)}
                    onTouchStart={(e) => handleDrawerPressStart(e, appName)}
                    onMouseMove={(e) => handleDrawerPressMove(e)}
                    onTouchMove={(e) => handleDrawerPressMove(e)}
                    onMouseUp={() => handleDrawerPressEnd(appName)}
                    onTouchEnd={() => handleDrawerPressEnd(appName)}
                    onMouseLeave={handleDrawerPressCancel}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <div className={`app-icon flex items-center justify-center text-xl shadow-sm ${meta.iconBgClass} rounded-2xl w-11 h-11 flex-shrink-0`}>
                      {meta.icon}
                    </div>
                    <span className="app-label text-[11px] font-bold text-white truncate flex-1">{meta.label}</span>
                  </button>
                );
              })}
          </div>

          {/* Drawer Footer */}
          <div className="drawer-footer">
            <span>{systemDate}</span>
          </div>
        </aside>

        {/* ==========================================
           7. ACTIVE RUNNING APPLICATIONS (Janela de Cartão Deslizante)
           ========================================== */}
        
        {/* APP A: CONFIGURAÇÕES */}
        <div className={`app-window ${activeApp === 'configuracoes' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
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
        <div className={`app-window ${activeApp === 'calculadora' ? '' : 'closed'} dark bg-slate-950 text-white`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <Calculator />
          </div>
        </div>

        {/* APP C: GALERIA */}
        <div className={`app-window ${activeApp === 'galeria' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar pt-4 pb-24 px-5 space-y-4 overflow-y-auto">
            <div className="space-y-1">
              <h3 className="font-bold text-base">Minha Galeria</h3>
              <p className="text-xs opacity-65">Escolha um gradiente ou envie uma foto para ser seu papel de parede do sistema.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              {/* Option to upload wallpaper from real device */}
              <button
                onClick={() => galleryFileInputRef.current?.click()}
                className="aspect-[9/16] rounded-2xl overflow-hidden relative shadow-md hover:scale-[0.98] transition-all cursor-pointer border border-dashed border-slate-300 dark:border-white/20 bg-slate-100/50 dark:bg-white/5 flex flex-col items-center justify-center text-center p-4 gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200/80 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white">
                  <Plus size={20} />
                </div>
                <div>
                  <p className="font-bold text-xs">Adicionar Foto</p>
                  <p className="text-[10px] opacity-60">Escolher do dispositivo</p>
                </div>
              </button>

              <input 
                type="file" 
                ref={galleryFileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleCustomWallpaperUpload} 
              />

              {wallpapers.map((wp, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGalleryImg(idx)}
                  className="aspect-[9/16] rounded-2xl overflow-hidden relative shadow-md hover:scale-[0.98] transition-transform cursor-pointer border border-white/5 text-left w-full"
                  style={{ background: wp.gradient }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 text-white">
                    <p className="font-bold text-xs leading-tight">{wp.name}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* LIGHTBOX CONFIRMAÇÃO DE PAPEL DE PAREDE */}
            {selectedGalleryImg !== null && wallpapers[selectedGalleryImg] && (
              <div className="absolute inset-0 bg-black/95 flex flex-col justify-center items-center p-6 z-50 text-white space-y-6">
                <div className="w-44 aspect-[9/16] rounded-2xl border-4 border-white/10 shadow-2xl relative overflow-hidden" style={{ background: wallpapers[selectedGalleryImg].gradient }}>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 px-3 py-1 rounded-full text-[9px] text-center">
                    Visualização
                  </div>
                </div>
                
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-sm">Definir "{wallpapers[selectedGalleryImg].name}"?</h4>
                  <p className="text-xs opacity-60">Isso atualizará a tela de fundo do sistema operacional.</p>
                </div>

                <div className="flex gap-3 text-xs w-full max-w-xs">
                  <button 
                    onClick={() => setSelectedGalleryImg(null)}
                    className="flex-1 py-2.5 bg-slate-800 font-bold rounded-xl hover:bg-slate-700 border-none cursor-pointer text-white text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      handleSetWallpaperFromFile(selectedGalleryImg);
                      setSelectedGalleryImg(null);
                    }}
                    className="flex-1 py-2.5 bg-blue-600 font-bold rounded-xl hover:bg-blue-700 border-none cursor-pointer text-white text-center"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* APP D: MENSAGENS */}
        <div className={`app-window ${activeApp === 'mensagens' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
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
        <div className={`app-window ${activeApp === 'musica' ? '' : 'closed'} dark bg-slate-950 text-white`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <MusicPlayer
              tracks={tracksList}
              isPlaying={musicPlaying}
              setIsPlaying={setMusicPlaying}
              currentTrackIndex={currentTrackIndex}
              setCurrentTrackIndex={setCurrentTrackIndex}
              volume={volume}
              setVolume={setVolume}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* APP F: NAVEGADOR */}
        <div className={`app-window ${activeApp === 'navegador' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <Browser darkMode={darkMode} isActive={activeApp === 'navegador'} />
          </div>
        </div>

        {/* APP G: ARQUIVOS */}
        <div className={`app-window ${activeApp === 'arquivos' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
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
        <div className={`app-window ${activeApp === 'loja' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <StoreApp
              darkMode={darkMode}
              installedApps={installedApps}
              onInstall={handleInstallApp}
              onUninstall={handleUninstallApp}
              onOpenApp={openApp}
            />
          </div>
        </div>

        {/* APP I: BLOCO DE NOTAS */}
        <div className={`app-window ${activeApp === 'notas' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <NotesApp darkMode={darkMode} />
          </div>
        </div>

        {/* APP J: FLAPPY BIRD */}
        <div className={`app-window ${activeApp === 'flappy' ? '' : 'closed'} dark bg-slate-950 text-white`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <FlappyApp darkMode={darkMode} isActive={activeApp === 'flappy'} />
          </div>
        </div>

        {/* APP K: PREVISÃO DO TEMPO */}
        <div className={`app-window ${activeApp === 'clima' ? '' : 'closed'} ${darkMode ? 'dark text-white' : 'text-white'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <WeatherApp darkMode={darkMode} />
          </div>
        </div>

        {/* APP L: MINI PAINT */}
        <div className={`app-window ${activeApp === 'paint' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <PaintApp darkMode={darkMode} />
          </div>
        </div>

        {/* APP M: TELEFONE */}
        <div className={`app-window ${activeApp === 'telefone' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <PhoneApp darkMode={darkMode} onOpenApp={openApp} />
          </div>
        </div>

        {/* APP N: CONTATOS */}
        <div className={`app-window ${activeApp === 'contatos' ? '' : 'closed'} ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'}`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
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
        <div className={`app-window ${activeApp === 'camera' ? '' : 'closed'} dark bg-black text-white`}>
          <div className="app-window-header">
            <div className="app-window-drag-handle" />
            <button className="app-window-close-btn" onClick={() => closeApp()} title="Minimizar">
              <X size={14} />
            </button>
          </div>
          <div className="app-content no-scrollbar p-0">
            <CameraApp darkMode={darkMode} isActive={activeApp === 'camera'} />
          </div>
        </div>

        {/* ==========================================
           8. BOTTOM DOCK (Visual e Formato Original do Usuário)
           ========================================== */}
        <footer 
          id="bottom-dock"
          className={`flex items-center justify-center gap-5 transition-all duration-200 select-none ${
            dragOverZone === 'dock' ? 'bg-white/20 scale-[1.05] ring-2 ring-white/10' : ''
          }`}
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
                  className={`dock-icon flex items-center justify-center text-3xl shadow-md cursor-pointer relative group ${
                    isEditingHome 
                      ? (index % 2 === 0 ? 'jiggle' : 'jiggle-alt') 
                      : 'hover:scale-105 active:scale-95 transition-all'
                  }`}
                  style={{ backgroundColor: 'transparent' }}
                  title={meta.label}
                >
                  {/* iOS style delete button */}
                  {isEditingHome && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDockApps(prev => prev.filter(id => id !== appId));
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className="absolute w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white shadow-md z-30 cursor-pointer active:scale-90 select-none"
                      style={{ right: '-4px', top: '-4px' }}
                      title="Remover atalho"
                    >
                      ✕
                    </button>
                  )}

                  <div className={`w-11 h-11 flex items-center justify-center rounded-[14px] ${meta.iconBgClass} text-white`}>
                    {meta.icon}
                  </div>
                </div>
              );
            })}
            
          {/* Visual slot indicator if dock has space */}
          {dockApps.filter(appId => installedApps.includes(appId)).length < 4 && (
            <div className="w-11 h-11 border border-dashed border-white/20 rounded-[14px] flex items-center justify-center text-xs text-white/30 pointer-events-none bg-white/5 select-none">
              +
            </div>
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
            <div className="w-12 h-24 bg-black/50 backdrop-blur-md border border-white/10 rounded-l-full flex items-center justify-center text-white shadow-2xl">
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

        {/* ==========================================
           MULTITASKING / RECENT APPS VIEW (Modo Multitarefa)
           ========================================== */}
        {recentAppsOpen && (
          <div 
            onClick={() => setRecentAppsOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-2xl z-40 flex flex-col justify-between p-6 text-white select-none transition-all duration-300"
          >
            
            {/* Middle Carousel of cards */}
            <div 
              className="flex-1 flex items-center justify-start overflow-x-auto gap-5 py-8 no-scrollbar px-6 w-full snap-x snap-mandatory"
            >
              {openedApps.length === 0 ? (
                <div className="text-center w-full flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-400 font-medium tracking-wide">nenhum app aberto</p>
                </div>
              ) : (
                openedApps.map((appName) => {
                  const meta = appMetadata[appName] || { label: appName, icon: '📱', iconBgClass: 'bg-slate-700' };
                  const isActive = activeApp === appName;
                  
                  return (
                    <motion.div 
                      key={appName}
                      drag="y"
                      dragConstraints={{ top: -300, bottom: 0 }}
                      dragElastic={{ top: 0.8, bottom: 0.1 }}
                      onDragEnd={(event, info) => {
                        // Se deslizou mais de 120px para cima, fecha o app
                        if (info.offset.y < -120) {
                          setOpenedApps(prev => prev.filter(name => name !== appName));
                          if (activeApp === appName) {
                            setActiveApp(null);
                          }
                        }
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-48 h-72 flex-shrink-0 bg-slate-900 border border-white/15 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl transition-all cursor-pointer group snap-center select-none touch-none"
                      onClick={() => {
                        openApp(appName);
                        setRecentAppsOpen(false);
                      }}
                    >
                       {/* Top App Header inside card */}
                      <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-lg ${meta.iconBgClass} flex items-center justify-center text-xs shadow`}>
                            {meta.icon}
                          </div>
                          <span className="font-bold text-[11px] truncate text-white">{meta.label}</span>
                        </div>
                        
                        {isActive ? (
                          <span className="flex items-center gap-1 text-[8px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[8px] font-medium text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded-full border border-slate-500/10">
                            2º Plano
                          </span>
                        )}
                      </div>

                      {/* Real Preview Content */}
                      <div className="flex-1 overflow-hidden pointer-events-none select-none relative bg-slate-900">
                        <div 
                          className="absolute top-0 left-0 origin-top-left" 
                          style={{ 
                            width: '384px', 
                            height: '488px', 
                            transform: 'scale(0.5)',
                          }}
                        >
                          {renderAppPreviewContent(appName)}
                        </div>
                      </div>

                      {/* Small visual swipe-up hint bar at bottom of card */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors" />
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions - Center round 'X' button to clear everything */}
            <div 
              className="pb-8 flex flex-col items-center gap-2 w-full"
            >
              {openedApps.length > 0 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenedApps([]);
                      setActiveApp(null);
                      setRecentAppsOpen(false);
                    }}
                    className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 hover:scale-105 transition-all cursor-pointer border-none"
                    title="Fechar todos os apps"
                  >
                    <X size={24} strokeWidth={2.5} />
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fechar Tudo</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
           10. POPUP NOTIFICATION CAP (Deslizar para Cima para Fechar, Deslizar para Baixo para Abrir)
           ========================================== */}
        <AnimatePresence>
          {activePopup && (
            <motion.div
              key={activePopup.id}
              initial={{ x: "-50%", y: -120, opacity: 0, scale: 0.95 }}
              animate={{ x: "-50%", y: 0, opacity: 1, scale: 1 }}
              exit={{ x: "-50%", y: -120, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              drag="y"
              dragConstraints={{ top: -150, bottom: 150 }}
              dragElastic={{ top: 0.15, bottom: 0.4 }}
              onDragEnd={(event, info) => {
                if (info.offset.y < -35 || info.velocity.y < -300) {
                  // Swipe up: close/dismiss
                  setActivePopup(null);
                } else if (info.offset.y > 50 || info.velocity.y > 300) {
                  // Swipe down: open/activate
                  handlePopupAction(activePopup);
                }
              }}
              onClick={() => handlePopupAction(activePopup)}
              className="absolute top-14 left-1/2 z-[200] w-[calc(100%-24px)] max-w-[360px] flex items-center gap-3.5 p-3.5 rounded-3xl bg-slate-900/95 dark:bg-[#1a1c22]/95 text-white shadow-[0_20px_45px_rgba(0,0,0,0.55)] border border-white/10 backdrop-blur-xl cursor-pointer select-none active:scale-[0.99] transition-transform duration-100"
            >
              {/* Avatar / App Icon on Left */}
              <div className="flex-shrink-0 relative">
                {activePopup.avatar ? (
                  <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                    <span className="text-xl">{activePopup.avatar}</span>
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center border border-white/10 text-white shadow-inner">
                    <Bell size={20} />
                  </div>
                )}
                {/* Secondary tiny app icon indicator */}
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-lg p-1 border border-slate-900 shadow">
                  <MessageSquare size={10} className="text-white" />
                </div>
              </div>

              {/* Text content in middle */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[12.5px] tracking-tight truncate text-white">
                    {activePopup.title}
                  </span>
                  <span className="text-[9.5px] font-mono text-white/40 flex-shrink-0">
                    Agora
                  </span>
                </div>
                <p className="text-[11.5px] text-white/80 line-clamp-2 leading-snug mt-0.5">
                  {activePopup.body}
                </p>
              </div>

              {/* Pull handle / Drag hint line at the bottom of the card */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/20" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
           9. GESTURE NAVIGATION PILL BAR (Android/iOS Style)
           ========================================== */}
        <div 
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-[100] cursor-pointer hover:bg-white/60 active:scale-95 transition-all"
          onClick={() => {
            if (activeApp !== null) {
              setActiveApp(null);
              setRecentAppsOpen(false);
            } else {
              setRecentAppsOpen(!recentAppsOpen);
            }
          }}
          title="Toque para Voltar à Tela Inicial / Ver Aplicativos Recentes"
        />

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
                    <span className="text-white font-black text-base tracking-tight">Alterar Papel de Parede</span>
                    <span className="text-slate-400 text-[10px] tracking-wide uppercase font-bold">Toque para selecionar</span>
                  </div>
                  <button 
                    onClick={() => setWallpaperPickerOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer border-none transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-6">
                  {/* Animados Section */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-emerald-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                      <span>✨</span> Papéis de Parede Animados
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {wallpapers
                        .map((w, idx) => ({ ...w, originalIdx: idx }))
                        .filter(w => w.isAnimated)
                        .map((w) => {
                          const isSelected = wallpaperIndex === w.originalIdx;
                          return (
                            <button
                              key={w.name}
                              onClick={() => {
                                handleSetWallpaperFromFile(w.originalIdx);
                                setWallpaperPickerOpen(false);
                              }}
                              className={`group relative h-20 rounded-2xl border text-left overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/25' : 'border-white/10 hover:border-white/20'
                              }`}
                              style={{ background: w.gradient }}
                            >
                              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2.5">
                                <span className="text-white text-[10.5px] font-extrabold truncate w-full group-hover:text-emerald-300 transition-colors">
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
                    <span className="text-sky-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                      <span>🖼️</span> Estáticos Clássicos
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setActiveApp('galeria');
                          setWallpaperPickerOpen(false);
                        }}
                        className="group relative h-20 rounded-2xl border border-dashed border-white/20 hover:border-white/45 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-slate-300 gap-1"
                      >
                        <Plus size={16} />
                        <span className="text-white text-[9px] font-black uppercase tracking-wider">Escolher da Galeria</span>
                      </button>
                      {wallpapers
                        .map((w, idx) => ({ ...w, originalIdx: idx }))
                        .filter(w => !w.isAnimated)
                        .map((w) => {
                          const isSelected = wallpaperIndex === w.originalIdx;
                          return (
                            <button
                              key={w.name}
                              onClick={() => {
                                handleSetWallpaperFromFile(w.originalIdx);
                                setWallpaperPickerOpen(false);
                              }}
                              className={`group relative h-20 rounded-2xl border text-left overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                isSelected ? 'border-sky-500 ring-2 ring-sky-500/25' : 'border-white/10 hover:border-white/20'
                              }`}
                              style={{ background: w.gradient }}
                            >
                              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2.5">
                                <span className="text-white text-[10.5px] font-extrabold truncate w-full group-hover:text-sky-300 transition-colors">
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

        {/* Global Floating Draggable App Shortcut visual feedback */}
        {draggedApp && dragHasMoved && (
          <div 
            className="fixed pointer-events-none z-[9999] flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              left: dragPosition.x,
              top: dragPosition.y,
            }}
          >
            <div className={`w-12 h-12 rounded-2xl ${appMetadata[draggedApp.appId]?.iconBgClass || 'bg-slate-500'} flex items-center justify-center text-3xl shadow-[0_15px_30px_rgba(0,0,0,0.4)] ring-4 ring-white/20 scale-110 opacity-90 animate-bounce`}>
              {appMetadata[draggedApp.appId]?.icon}
            </div>
            <span className="text-[9px] font-black tracking-wider uppercase text-white bg-slate-950/80 px-2 py-0.5 rounded-md border border-white/10 shadow-lg leading-none">
              {appMetadata[draggedApp.appId]?.label}
            </span>
          </div>
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
            onComplete={() => {
              setIsBooting(false);
              setIsSetupCompleted(true);
              // If no PIN is configured, unlock immediately. Otherwise, show LockScreen.
              if (!pincode) {
                setIsLocked(false);
              } else {
                setIsLocked(true);
              }
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
            onUnlock={() => setIsLocked(false)}
            onReset={handleResetOS}
          />
        )}

      </div>
    </div>
  );
}
