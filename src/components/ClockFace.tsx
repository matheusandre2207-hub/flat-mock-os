import React from 'react';
import { usePrefs } from '../prefs';

export default function ClockFace({ scope, time, date }: { scope: 'home' | 'lock'; time: string; date: string }) {
  const { prefs } = usePrefs();
  const p = prefs[scope];
  if (p.style === 'none') return null;
  const [hh, mm] = time.split(':');
  const ai = p.align === 'left' ? 'flex-start' : p.align === 'right' ? 'flex-end' : 'center';
  return (
    <div className={`clock clock-${p.style}`} style={{ alignItems: ai, textAlign: p.align }}>
      {p.style === 'stacked' ? (
        <>
          <span className="clock-t">{hh}</span>
          <span className="clock-t clock-m">{mm}</span>
        </>
      ) : (
        <span className="clock-t">{time}</span>
      )}
      <span className="clock-d">{date}</span>
    </div>
  );
}
