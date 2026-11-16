import React from 'react';
import { Wifi, WifiOff, Bluetooth, Plane } from 'lucide-react';

interface Props {
  time: string;
  dark: boolean;
  wifi: boolean;
  cellular: boolean;
  bluetooth: boolean;
  airplane: boolean;
  battery: number;
  charging: boolean;
  unread: number;
  onLeft: () => void;
  onRight: () => void;
}

/** Barra de status do modo paisagem: duas pílulas de vidro (hora à esquerda; conexões e bateria numa só à direita).
 *  Tocar na da esquerda abre as notificações; na da direita, os ajustes rápidos. */
export default function StatusPills({ time, dark, wifi, cellular, bluetooth, airplane, battery, charging, unread, onLeft, onRight }: Props) {
  const fg = dark ? '#f4f4f5' : '#18181b';
  const pill: React.CSSProperties = {
    height: 30, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 999, border: 0, cursor: 'pointer',
    background: dark ? 'rgba(20,20,26,0.46)' : 'rgba(255,255,255,0.62)',
    outline: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'}`, outlineOffset: -1,
    backdropFilter: 'blur(18px) saturate(1.5)', WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
    boxShadow: dark ? '0 4px 14px rgba(0,0,0,0.25)' : '0 4px 14px rgba(0,0,0,0.1)',
    color: fg, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'auto', transition: 'background .4s ease, color .4s ease, transform .12s ease', touchAction: 'manipulation',
  };

  // Bateria em pontos (igual à barra de status do sistema), sem porcentagem
  const lvl = battery;
  const n = charging ? (lvl < 33 ? 1 : lvl < 66 ? 2 : 3) : lvl <= 20 ? 1 : lvl <= 33 ? 1 : lvl <= 66 ? 2 : 3;
  const dotColor = charging ? '#4ade80' : lvl <= 20 ? '#ef4444' : fg;
  const dotClass = charging ? 'blink-charge' : lvl <= 20 ? 'blink-fast' : '';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none', zIndex: 6 }}>
      <button type="button" style={pill} onClick={onLeft} aria-label="Notificações">
        <span>{time}</span>
        {unread > 0 && <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent, #3E63DD)' }} />}
      </button>
      <button type="button" style={pill} onClick={onRight} aria-label="Ajustes rápidos">
        {airplane && <Plane size={14} strokeWidth={2.4} />}
        {!airplane && bluetooth && <Bluetooth size={14} strokeWidth={2.4} />}
        {wifi && !airplane ? <Wifi size={15} strokeWidth={2.4} /> : <WifiOff size={15} strokeWidth={2.4} style={{ opacity: 0.5 }} />}
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12, opacity: cellular && !airplane ? 1 : 0.35 }}>
          {[4, 6, 9, 12].map(h => <i key={h} style={{ width: 3, height: h, borderRadius: 1.5, background: 'currentColor', display: 'block' }} />)}
        </span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }} title={`Bateria ${Math.round(lvl)}%`}>
          {[0, 1, 2].map(i => (
            <i key={i} className={i < n ? dotClass : ''} style={{ width: 6, height: 6, borderRadius: 99, display: 'block', background: i < n ? dotColor : fg, opacity: i < n ? 1 : 0.28 }} />
          ))}
        </span>
      </button>
    </div>
  );
}
