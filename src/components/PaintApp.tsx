import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Download, Square, Circle } from 'lucide-react';

interface PaintAppProps {
  darkMode: boolean;
}

const COLORS = [
  { value: '#000000', label: 'Preto', darkValue: '#ffffff' },
  { value: '#ef4444', label: 'Vermelho', darkValue: '#ef4444' },
  { value: '#3b82f6', label: 'Azul', darkValue: '#3b82f6' },
  { value: '#10b981', label: 'Verde', darkValue: '#10b981' },
  { value: '#f59e0b', label: 'Laranja', darkValue: '#f59e0b' },
  { value: '#8b5cf6', label: 'Roxo', darkValue: '#8b5cf6' },
  { value: '#ec4899', label: 'Rosa', darkValue: '#ec4899' },
];

export default function PaintApp({ darkMode }: PaintAppProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Save current content
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight - 65; // Offset header

      // Fill background
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = darkMode ? '#0b0f19' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Restore contents
        ctx.drawImage(tempCanvas, 0, 0, Math.min(tempCanvas.width, canvas.width), Math.min(tempCanvas.height, canvas.height));
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [darkMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    const pos = getMousePos(canvas, e);
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    
    ctx.strokeStyle = isEraser ? (darkMode ? '#0b0f19' : '#ffffff') : currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getMousePos = (canvas: HTMLCanvasElement, e: any) => {
    const rect = canvas.getBoundingClientRect();
    
    // Check if it's touch
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = darkMode ? '#0b0f19' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `meu-desenho-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const activeColorValue = isEraser ? 'transparent' : currentColor;

  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-hidden select-none relative bg-slate-900 pb-24">
      
      {/* Canvas Area */}
      <div className="flex-1 w-full bg-slate-950">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block touch-none"
        />
      </div>

      {/* Control Panel (Bottom Drawer Style) */}
      <div className={`p-4 border-t flex flex-col gap-3.5 shrink-0 shadow-lg ${
        darkMode ? 'bg-[#1e293b]/95 border-white/5 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
      }`}>
        
        {/* Colors + Brush slider row */}
        <div className="flex justify-between items-center gap-4">
          
          {/* Preset Colors */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[70%]">
            <button 
              onClick={() => {
                setIsEraser(true);
              }}
              className={`w-6 h-6 rounded-full flex items-center justify-center border cursor-pointer ${
                isEraser ? 'ring-2 ring-blue-500 bg-red-100 border-red-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-300/50'
              }`}
              title="Borracha"
            >
              <span className="text-xs">🧽</span>
            </button>

            {COLORS.map((c) => {
              const actualColor = (darkMode && c.value === '#000000') ? '#ffffff' : c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => {
                    setCurrentColor(actualColor);
                    setIsEraser(false);
                  }}
                  className={`w-6 h-6 rounded-full border-2 cursor-pointer relative shrink-0 transition-transform hover:scale-105 active:scale-95 ${
                    !isEraser && currentColor === actualColor ? 'ring-2 ring-blue-500 scale-110' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: actualColor }}
                  title={c.label}
                />
              );
            })}
          </div>

          {/* Brush Size Slider */}
          <div className="flex-1 flex items-center gap-2 max-w-[30%]">
            <span className="text-[10px] opacity-50 font-bold uppercase shrink-0">Tam</span>
            <input 
              type="range"
              min={1}
              max={25}
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] font-mono shrink-0 w-4">{brushSize}</span>
          </div>

        </div>

        {/* Clear & Save Action Row */}
        <div className="flex justify-between items-center pt-1 border-t border-slate-200/50 dark:border-white/5 text-xs">
          <div className="flex items-center gap-1.5">
            <div 
              className="w-3.5 h-3.5 rounded-full border border-white/20" 
              style={{ backgroundColor: isEraser ? 'transparent' : currentColor }}
            />
            <span className="font-semibold text-[11px] opacity-75">
              {isEraser ? 'Borracha Ativa' : `Pincel: ${currentColor}`}
            </span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={clearCanvas}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-none cursor-pointer transition-colors ${
                darkMode ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
              }`}
              title="Limpar tudo"
            >
              <Trash2 size={12} />
              <span className="font-bold">Limpar</span>
            </button>

            <button 
              onClick={downloadImage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-none cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold transition-transform active:scale-95 shadow-sm"
              title="Baixar imagem"
            >
              <Download size={12} />
              <span>Salvar</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
