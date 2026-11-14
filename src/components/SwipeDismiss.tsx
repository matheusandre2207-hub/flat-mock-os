import React, { useRef } from 'react';
import { motion, useAnimation } from 'motion/react';

interface SwipeDismissProps {
  children: React.ReactNode;
  /** Chamado depois que o item sai da tela pelo arrasto lateral */
  onDismiss: () => void;
  /** Chamado quando for só um toque (sem arrastar) */
  onTap?: () => void;
  className?: string;
  /** Distância horizontal (px) a partir da qual o arrasto conta como "dispensar" */
  threshold?: number;
}

/**
 * Notificação que se dispensa arrastando só para a esquerda ou para a direita.
 * Passou do limite: sai deslizando para o lado e chama onDismiss.
 * Não passou: volta para o lugar com uma mola suave.
 */
export default function SwipeDismiss({ children, onDismiss, onTap, className = '', threshold = 100 }: SwipeDismissProps) {
  const controls = useAnimation();
  const draggedRef = useRef(false);
  const doneRef = useRef(false);

  return (
    <motion.div
      className={className}
      data-no-sheet-gesture=""
      style={{ touchAction: 'pan-y' }}
      drag="x"
      dragMomentum={false}
      dragElastic={0.5}
      dragConstraints={{ left: -480, right: 480, top: 0, bottom: 0 }}
      animate={controls}
      onDragStart={() => { draggedRef.current = true; }}
      onDragEnd={(_, info) => {
        if (doneRef.current) return;
        const { x } = info.offset;
        const vx = info.velocity.x;
        if (Math.abs(x) > threshold || (Math.abs(vx) > 650 && Math.abs(x) > 24)) {
          doneRef.current = true;
          const dir = (x || vx) < 0 ? -1 : 1;
          controls
            .start({ x: dir * 520, opacity: 0 }, { duration: 0.22, ease: [0.4, 0, 1, 1] })
            .then(() => onDismiss());
        } else {
          controls.start({ x: 0 }, { type: 'spring', stiffness: 520, damping: 40 });
        }
        window.setTimeout(() => { draggedRef.current = false; }, 0);
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (!draggedRef.current && onTap) onTap();
      }}
      onTouchStart={(e: React.TouchEvent) => e.stopPropagation()}
      onTouchMove={(e: React.TouchEvent) => e.stopPropagation()}
      onTouchEnd={(e: React.TouchEvent) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}
