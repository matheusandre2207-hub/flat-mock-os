import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface FlappyAppProps {
  darkMode: boolean;
  isActive?: boolean;
}

export default function FlappyApp({ darkMode, isActive = false }: FlappyAppProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // References for game state to avoid closure issues in the game loop
  const stateRef = useRef({
    birdY: 150,
    birdVelocity: 0,
    birdGravity: 0.4,
    birdJump: -6,
    birdRadius: 10,
    pipes: [] as Array<{ x: number; topHeight: number; bottomY: number; width: number; passed: boolean }>,
    pipeSpeed: 2,
    pipeSpawnInterval: 95,
    frameCount: 0,
    isGameOver: false,
    score: 0,
    highScore: 0,
  });

  // Reusable AudioContext to avoid crash on multiple jumps
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load HighScore
  useEffect(() => {
    const saved = localStorage.getItem('mockos_flappy_highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
      stateRef.current.highScore = parseInt(saved, 10);
    }
  }, []);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Beep Sound Helper
  const playBeep = (freq: number, type: OscillatorType, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const jump = () => {
    if (stateRef.current.isGameOver) return;
    stateRef.current.birdVelocity = stateRef.current.birdJump;
    playBeep(400, 'square', 0.08);
  };

  const resetGame = () => {
    stateRef.current = {
      birdY: 150,
      birdVelocity: 0,
      birdGravity: 0.4,
      birdJump: -6,
      birdRadius: 10,
      pipes: [],
      pipeSpeed: 2,
      pipeSpawnInterval: 100,
      frameCount: 0,
      isGameOver: false,
      score: 0,
      highScore: stateRef.current.highScore,
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    playBeep(523, 'triangle', 0.15);
  };

  // Main game rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      // Clear Screen
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Sky Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (darkMode) {
        skyGrad.addColorStop(0, '#0f172a'); // slate-900
        skyGrad.addColorStop(1, '#1e293b'); // slate-800
      } else {
        skyGrad.addColorStop(0, '#bae6fd'); // sky-200
        skyGrad.addColorStop(1, '#38bdf8'); // sky-400
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Clouds (cosmetic backdrop)
      ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(60, 60, 25, 0, Math.PI * 2);
      ctx.arc(90, 55, 30, 0, Math.PI * 2);
      ctx.arc(120, 60, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(220, 110, 20, 0, Math.PI * 2);
      ctx.arc(245, 105, 25, 0, Math.PI * 2);
      ctx.arc(270, 110, 20, 0, Math.PI * 2);
      ctx.fill();

      if (isPlaying && !stateRef.current.isGameOver) {
        // Physics logic
        stateRef.current.birdVelocity += stateRef.current.birdGravity;
        stateRef.current.birdY += stateRef.current.birdVelocity;

        // Ceiling collision
        if (stateRef.current.birdY - stateRef.current.birdRadius < 0) {
          stateRef.current.birdY = stateRef.current.birdRadius;
          stateRef.current.birdVelocity = 0;
        }

        // Ground collision
        if (stateRef.current.birdY + stateRef.current.birdRadius > canvas.height - 25) {
          handleGameOver();
        }

        // Pipe spawning & management
        stateRef.current.frameCount++;
        if (stateRef.current.frameCount % stateRef.current.pipeSpawnInterval === 0) {
          const gapSize = 85;
          const minHeight = 40;
          const maxHeight = canvas.height - gapSize - minHeight - 40;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
          const bottomY = topHeight + gapSize;
          
          stateRef.current.pipes.push({
            x: canvas.width,
            topHeight,
            bottomY,
            width: 42,
            passed: false,
          });
        }

        // Move Pipes & Check Collisions
        for (let i = stateRef.current.pipes.length - 1; i >= 0; i--) {
          const pipe = stateRef.current.pipes[i];
          pipe.x -= stateRef.current.pipeSpeed;

          // Collision detection
          const birdX = 65;
          const birdY = stateRef.current.birdY;
          const rad = stateRef.current.birdRadius;

          const collidesTop = (
            birdX + rad > pipe.x &&
            birdX - rad < pipe.x + pipe.width &&
            birdY - rad < pipe.topHeight
          );

          const collidesBottom = (
            birdX + rad > pipe.x &&
            birdX - rad < pipe.x + pipe.width &&
            birdY + rad > pipe.bottomY
          );

          if (collidesTop || collidesBottom) {
            handleGameOver();
          }

          // Score check
          if (!pipe.passed && pipe.x + pipe.width < birdX) {
            pipe.passed = true;
            stateRef.current.score++;
            setScore(stateRef.current.score);
            playBeep(659, 'sine', 0.1); // high score beep
            
            // Speed up slightly as score rises
            if (stateRef.current.score % 5 === 0) {
              stateRef.current.pipeSpeed += 0.25;
            }
          }

          // Delete offscreen pipes
          if (pipe.x + pipe.width < 0) {
            stateRef.current.pipes.splice(i, 1);
          }
        }
      }

      // Draw Pipes
      stateRef.current.pipes.forEach(pipe => {
        // Draw top pipe
        const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        pipeGrad.addColorStop(0, '#22c55e'); // emerald-500
        pipeGrad.addColorStop(0.5, '#4ade80'); // emerald-400
        pipeGrad.addColorStop(1, '#15803d'); // emerald-700
        
        ctx.fillStyle = pipeGrad;
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 2;

        // Top Pipe Rectangle
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
        
        // Top Pipe lip/cap
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 12, pipe.width + 6, 12);
        ctx.strokeRect(pipe.x - 3, pipe.topHeight - 12, pipe.width + 6, 12);

        // Bottom Pipe Rectangle
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY - 20);
        ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY - 20);

        // Bottom Pipe lip/cap
        ctx.fillRect(pipe.x - 3, pipe.bottomY, pipe.width + 6, 12);
        ctx.strokeRect(pipe.x - 3, pipe.bottomY, pipe.width + 6, 12);
      });

      // Draw Ground
      ctx.fillStyle = darkMode ? '#1e293b' : '#854d0e'; // dark slate or mud-brown
      ctx.fillRect(0, canvas.height - 25, canvas.width, 25);
      ctx.fillStyle = darkMode ? '#334155' : '#22c55e'; // ground surface grass
      ctx.fillRect(0, canvas.height - 25, canvas.width, 5);

      // Draw Bird
      const birdY = stateRef.current.birdY;
      ctx.save();
      ctx.translate(65, birdY);
      
      // Rotate bird depending on velocity
      const rotation = Math.min(Math.max(stateRef.current.birdVelocity * 0.08, -0.4), 0.7);
      ctx.rotate(rotation);

      // Body (Golden yellow bird)
      ctx.fillStyle = '#eab308'; // yellow-500
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Wing
      ctx.fillStyle = '#facc15'; // yellow-400
      ctx.beginPath();
      ctx.ellipse(-3, 1, 5, 3, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(5, -3, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Orange Beak
      ctx.fillStyle = '#f97316'; // orange-500
      ctx.beginPath();
      ctx.moveTo(8, -1);
      ctx.lineTo(14, 1);
      ctx.lineTo(8, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // Frame ticking
      animationId = requestAnimationFrame(gameLoop);
    };

    const handleGameOver = () => {
      stateRef.current.isGameOver = true;
      setIsGameOver(true);
      playBeep(180, 'sawtooth', 0.35);

      // Update High Score
      if (stateRef.current.score > stateRef.current.highScore) {
        stateRef.current.highScore = stateRef.current.score;
        setHighScore(stateRef.current.score);
        localStorage.setItem('mockos_flappy_highscore', stateRef.current.score.toString());
      }
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, soundEnabled, darkMode]);

  // Click handler to jump or start
  const handleCanvasClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPlaying) {
      resetGame();
    } else {
      jump();
    }
  };

  return (
    <div className="flex flex-col h-full pb-24 bg-slate-950 select-none overflow-hidden text-white relative">
      {/* Mini App Header */}
      <div className={`px-4 py-3 shrink-0 flex justify-between items-center ${
        darkMode ? 'bg-slate-900/90 border-b border-white/5' : 'bg-slate-800 text-white'
      }`}>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🐦</span>
          <div>
            <h2 className="text-xs font-bold leading-none">Flappy Bird</h2>
            <p className="text-[9px] opacity-40 mt-0.5 font-mono">Recorde: {highScore}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Display Score in real time */}
          <div className="bg-black/30 px-2 py-0.5 rounded-lg text-xs font-bold font-mono">
            Pts: {score}
          </div>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded bg-transparent hover:bg-white/10 text-white/80 border-none cursor-pointer"
            title={soundEnabled ? "Mudar som" : "Ativar som"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="flex-1 flex justify-center items-center relative p-2">
        <canvas 
          ref={canvasRef}
          width={280}
          height={380}
          onClick={handleCanvasClick}
          className="rounded-2xl shadow-2xl border border-white/10 cursor-pointer w-full max-w-[280px] aspect-[28/38]"
        />

        {/* Start Game overlay */}
        {!isPlaying && !isGameOver && (
          <div 
            onClick={resetGame}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-center items-center text-center p-6 space-y-4 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center animate-bounce shadow-lg">
              <span className="text-3xl">🐦</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-sm tracking-wide">Iniciar Flappy Bird</h3>
              <p className="text-[10px] text-slate-400">Toque em qualquer lugar da tela para bater asas e desviar dos canos.</p>
            </div>

            <button className="flex items-center gap-1.5 px-4.5 py-2 bg-green-600 hover:bg-green-700 font-bold text-xs rounded-xl border-none cursor-pointer text-white">
              <Play size={13} fill="white" />
              <span>Jogar</span>
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xs flex flex-col justify-center items-center text-center p-6 space-y-4">
            <div className="text-4xl">💥</div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm tracking-wider text-red-400">FIM DE JOGO</h3>
              <p className="text-xs text-white/80">Você fez <span className="font-bold font-mono text-amber-400">{score}</span> pontos!</p>
              {score >= highScore && score > 0 && (
                <p className="text-[10px] text-yellow-300 font-semibold animate-pulse">👑 Novo Recorde!</p>
              )}
            </div>

            <button 
              onClick={resetGame}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-xs rounded-xl border-none cursor-pointer text-white shadow-md active:scale-95 transition-all"
            >
              <RotateCcw size={13} />
              <span>Tentar Novamente</span>
            </button>
          </div>
        )}
      </div>

      {/* Swipe up hint */}
      <div className="absolute bottom-1 w-full text-center opacity-30 text-[8px] font-mono select-none pointer-events-none">
        TAP SCREEN TO JUMP
      </div>
    </div>
  );
}
