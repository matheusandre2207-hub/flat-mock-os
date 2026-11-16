import { useEffect, useState } from 'react';

export interface ClockPref {
  style: 'light' | 'bold' | 'stacked' | 'mono' | 'none';
  pos: 'top' | 'center' | 'bottom';
  align: 'left' | 'center' | 'right';
}
export type NavStyle = 'gestures' | 'buttons';
export type DrawerStyle = 'list' | 'grid';

export interface KbPrefs {
  enabled: boolean;                                   // usar o teclado do AeroOS em vez do teclado do celular
  theme: 'auto' | 'dark' | 'light' | 'wallpaper';
  opacity: number;                                    // 30 a 100 (%)
  blur: number;                                       // 0 a 40 (px)
  height: number;                                     // altura de cada tecla, 34 a 60 (px)
  radius: number;                                     // arredondamento das teclas, 4 a 22 (px)
  sound: boolean;
  vibrate: boolean;
  autoCap: boolean;
  accents: boolean;                                   // segurar uma vogal mostra acentos
}

export interface Prefs {
  navStyle: NavStyle;
  drawerStyle: DrawerStyle;
  iconTint: boolean;
  doubleTapSleep: boolean;
  kb: KbPrefs;
  home: ClockPref;
  lock: ClockPref;
}

export const DEFAULTS: Prefs = {
  navStyle: 'gestures',
  drawerStyle: 'list',
  iconTint: false,
  doubleTapSleep: true,
  kb: { enabled: true, theme: 'auto', opacity: 82, blur: 24, height: 46, radius: 12, sound: false, vibrate: true, autoCap: true, accents: true },
  home: { style: 'light', pos: 'top', align: 'left' },
  lock: { style: 'light', pos: 'top', align: 'center' }
};

const KEY = 'os_prefs';

export function getPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...p, kb: { ...DEFAULTS.kb, ...p.kb }, home: { ...DEFAULTS.home, ...p.home }, lock: { ...DEFAULTS.lock, ...p.lock } };
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
