import React from 'react';
import { Wifi, WifiOff, Bluetooth, Plane, BatteryFull, BatteryMedium, BatteryLow, BatteryCharging } from 'lucide-react';

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
}

/** Barra de status do modo paisagem: duas "ilhas" de vidro, uma de cada lado. Cada seção tem a própria pílula. */
export default function StatusPills({ time, dark, wifi, cellular, bluetooth, airplane, battery, charging, unread }: Props) {
  const fg = dark ? '#f4f4f5' : '#18181b';
  const pill: React.CSSProperties = {
    height: 28, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 7, borderRadius: 999,
    background: dark ? 'rgba(20,20,26,0.46)' : 'rgba(255,255,255,0.6)',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'}`,
    backdropFilter: 'blur(18px) saturate(1.5)', WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
    boxShadow: dark ? '0 4px 14px rgba(0,0,0,0.25)' : '0 4px 14px rgba(0,0,0,0.1)',
    color: fg, fontSize: 12.5, fontWeight: 600, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums',
    transition: 'background .4s ease, color .4s ease',
  };
  const Bat = charging ? BatteryCharging : battery > 60 ? BatteryFull : battery > 25 ? BatteryMedium : BatteryLow;
  const low = battery <= 20 && !charging;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={pill}>
          <span>{time}</span>
          {unread > 0 && <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent, #3E63DD)' }} aria-label={`${unread} notificações`} />}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={pill}>
          {airplane && <Plane size={14} strokeWidth={2.4} />}
          {!airplane && bluetooth && <Bluetooth size={14} strokeWidth={2.4} />}
          {wifi && !airplane ? <Wifi size={15} strokeWidth={2.4} /> : <WifiOff size={15} strokeWidth={2.4} style={{ opacity: 0.5 }} />}
          <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12, opacity: cellular && !airplane ? 1 : 0.35 }}>
            {[4, 6, 9, 12].map(h => <i key={h} style={{ width: 3, height: h, borderRadius: 1.5, background: 'currentColor', display: 'block' }} />)}
          </span>
        </div>
        <div style={{ ...pill, color: low ? '#f87171' : fg }}>
          <span>{Math.round(battery)}%</span>
          <Bat size={16} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
