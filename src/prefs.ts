import { useEffect, useState } from 'react';

export interface ClockPref {
  style: 'light' | 'bold' | 'stacked' | 'mono' | 'none';
  pos: 'top' | 'center' | 'bottom';
  align: 'left' | 'center' | 'right';
}
export interface Prefs {
  iconTint: boolean;
  doubleTapSleep: boolean;
  home: ClockPref;
  lock: ClockPref;
}

export const DEFAULTS: Prefs = {
  iconTint: false,
  doubleTapSleep: true,
  home: { style: 'light', pos: 'top', align: 'left' },
  lock: { style: 'light', pos: 'top', align: 'center' }
};

const KEY = 'os_prefs';

export function getPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...p, home: { ...DEFAULTS.home, ...p.home }, lock: { ...DEFAULTS.lock, ...p.lock } };
  } catch {
    return DEFAULTS;
  }
}

export function setPrefs(patch: Partial<Prefs>) {
  localStorage.setItem(KEY, JSON.stringify({ ...getPrefs(), ...patch }));
  window.dispatchEvent(new Event('mockos-prefs'));
}

export function usePrefs() {
  const [prefs, set] = useState<Prefs>(getPrefs);
  useEffect(() => {
    const f = () => set(getPrefs());
    window.addEventListener('mockos-prefs', f);
    return () => window.removeEventListener('mockos-prefs', f);
  }, []);
  return { prefs };
}
