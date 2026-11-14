import React, { useRef } from 'react';
import { motion, useAnimation } from 'motion/react';

interface SwipeDismissProps {
  children: React.ReactNode;
  /** Chamado depois que o item sai da tela pelo arrasto */
  onDismiss: () => void;
  /** Chamado quando for só um toque (sem arrastar) */
  onTap?: () => void;
  className?: string;
  /** Distância em px a partir da qual o arrasto conta como "dispensar" */
  threshold?: number;
}

/**
 * Deixa qualquer item (notificação) ser arrastado para qualquer lado.
 * Passou do limite: sai voando na direção do arrasto e chama onDismiss.
 * Não passou: volta para o lugar com uma mola suave.
 */
export default function SwipeDismiss({
  children,
  onDismiss,
  onTap,
  className = '',
  threshold = 96,
}: SwipeDismissProps) {
  const controls = useAnimation();
  const draggedRef = useRef(false);
  const doneRef = useRef(false);

  return (
    <motion.div
      className={className}
      data-no-sheet-gesture=""
      style={{ touchAction: 'none' }}
      drag
      dragMomentum={false}
      dragElastic={0.45}
      dragConstraints={{ left: -480, right: 480, top: -240, bottom: 240 }}
      animate={controls}
      onDragStart={() => {
        draggedRef.current = true;
      }}
      onDragEnd={(_, info) => {
        if (doneRef.current) return;
        const { x, y } = info.offset;
        const { x: vx, y: vy } = info.velocity;
        const dist = Math.hypot(x, y);
        const speed = Math.hypot(vx, vy);

        if (dist > threshold || (speed > 700 && dist > 24)) {
          doneRef.current = true;
          const horizontal = Math.abs(x) >= Math.abs(y);
          const dir = (horizontal ? x || vx : y || vy) < 0 ? -1 : 1;
          controls
            .start(
              horizontal ? { x: dir * 520, opacity: 0 } : { y: dir * 240, opacity: 0 },
              { duration: 0.2, ease: 'easeOut' }
            )
            .then(() => onDismiss());
        } else {
          controls.start({ x: 0, y: 0 }, { type: 'spring', stiffness: 520, damping: 38 });
        }
        // Libera o toque depois do click que o navegador dispara ao soltar
        window.setTimeout(() => {
          draggedRef.current = false;
        }, 0);
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (!draggedRef.current && onTap) onTap();
      }}
      // Toques dentro do item não devem acionar gestos globais (desbloqueio, gaveta, voltar)
      onTouchStart={(e: React.TouchEvent) => e.stopPropagation()}
      onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
      onTouchEnd={(e: React.TouchEvent) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}
