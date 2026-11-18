import { useEffect, useState } from 'react';

export interface ClockPref {
  style: 'light' | 'bold' | 'stacked' | 'mono' | 'none';
  pos: 'top' | 'center' | 'bottom';
  align: 'left' | 'center' | 'right';
}
export type NavStyle = 'gestures' | 'buttons';
export type DrawerStyle = 'list' | 'grid';

export interface GlassLevel { op: number; blur: number }   // op: opacidade do fundo (0 a 100), blur em px
export interface GlassPrefs { drawer: GlassLevel; notif: GlassLevel; control: GlassLevel; nav: GlassLevel; dock: GlassLevel }
export type DockStyle = 'floating' | 'fixed';

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
  glass: GlassPrefs;
  dockStyle: DockStyle;
  home: ClockPref;
  lock: ClockPref;
}

export const DEFAULTS: Prefs = {
  navStyle: 'gestures',
  drawerStyle: 'list',
  dockStyle: 'floating',
  glass: { drawer: { op: 72, blur: 28 }, notif: { op: 72, blur: 28 }, control: { op: 72, blur: 28 }, nav: { op: 46, blur: 30 }, dock: { op: 38, blur: 24 } },
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
    return { ...DEFAULTS, ...p, kb: { ...DEFAULTS.kb, ...p.kb }, glass: { drawer: { ...DEFAULTS.glass.drawer, ...p.glass?.drawer }, notif: { ...DEFAULTS.glass.notif, ...p.glass?.notif }, control: { ...DEFAULTS.glass.control, ...p.glass?.control }, nav: { ...DEFAULTS.glass.nav, ...p.glass?.nav }, dock: { ...DEFAULTS.glass.dock, ...p.glass?.dock } }, home: { ...DEFAULTS.home, ...p.home }, lock: { ...DEFAULTS.lock, ...p.lock } };
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
