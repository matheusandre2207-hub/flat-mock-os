import { useEffect, useState } from 'react';

export interface ClockPref {
  style: 'light' | 'bold' | 'stacked' | 'mono' | 'none';
  pos: 'top' | 'center' | 'bottom';
  align: 'left' | 'center' | 'right';
}
export type NavStyle = 'gestures' | 'buttons';
export type DrawerStyle = 'list' | 'grid';

export interface GlassLevel { op: number; blur: number }   // op: opacidade do fundo (0 a 100), blur em px
export interface GlassPrefs {
  drawer: GlassLevel; notif: GlassLevel; control: GlassLevel; nav: GlassLevel; dock: GlassLevel;
  // tela que fica por baixo da barra de apps, das notificações e da central de controle
  bdDrawer: GlassLevel; bdNotif: GlassLevel; bdControl: GlassLevel;
}
export type IconMode = 'normal' | 'dark' | 'light' | 'wallpaper';
export type DockStyle = 'floating' | 'fixed';

/** Informações do sistema editáveis pelo modo desenvolvedor */
export interface DevPrefs {
  enabled: boolean;          // modo desenvolvedor desbloqueado (toque 7 vezes no número da versão)
  osName: string; osVersion: string; codename: string; build: string;
  model: string; maker: string; deviceName: string;
  ramGb: number; storageGb: number;
  timeOffsetMs: number;      // diferença entre a hora do sistema e a hora real
}

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
  autoCorrect: boolean;
  suggestions: boolean;
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
  dev: DevPrefs;
  dndHideLock: boolean;      // Não perturbe: esconde as notificações na tela de bloqueio
  /** Estilo dos ícones; se ausente, vem de iconTint (compatibilidade) */
  iconMode?: IconMode;
  home: ClockPref;
  lock: ClockPref;
}

export const DEFAULTS: Prefs = {
  navStyle: 'gestures',
  drawerStyle: 'list',
  dockStyle: 'floating',
  dndHideLock: false,
  dev: { enabled: false, osName: 'AeroOS', osVersion: '1.0', codename: 'Aurora', build: 'AERO.261118.001', model: 'Aero One', maker: 'UNiVERSE', deviceName: '', ramGb: 8, storageGb: 128, timeOffsetMs: 0 },
  glass: { drawer: { op: 72, blur: 28 }, notif: { op: 72, blur: 28 }, control: { op: 72, blur: 28 }, nav: { op: 46, blur: 30 }, dock: { op: 46, blur: 30 }, bdDrawer: { op: 38, blur: 10 }, bdNotif: { op: 45, blur: 14 }, bdControl: { op: 45, blur: 14 } },
  iconTint: false,
  doubleTapSleep: true,
  kb: { enabled: true, theme: 'auto', opacity: 82, blur: 24, height: 46, radius: 12, sound: false, vibrate: true, autoCap: true, autoCorrect: true, suggestions: true, accents: true },
  home: { style: 'light', pos: 'top', align: 'left' },
  lock: { style: 'light', pos: 'top', align: 'center' }
};

const KEY = 'os_prefs';

export function getPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...p, kb: { ...DEFAULTS.kb, ...p.kb }, dev: { ...DEFAULTS.dev, ...p.dev }, glass: { drawer: { ...DEFAULTS.glass.drawer, ...p.glass?.drawer }, notif: { ...DEFAULTS.glass.notif, ...p.glass?.notif }, control: { ...DEFAULTS.glass.control, ...p.glass?.control }, nav: { ...DEFAULTS.glass.nav, ...p.glass?.nav }, dock: { ...DEFAULTS.glass.dock, ...p.glass?.dock }, bdDrawer: { ...DEFAULTS.glass.bdDrawer, ...p.glass?.bdDrawer }, bdNotif: { ...DEFAULTS.glass.bdNotif, ...p.glass?.bdNotif }, bdControl: { ...DEFAULTS.glass.bdControl, ...p.glass?.bdControl } }, home: { ...DEFAULTS.home, ...p.home }, lock: { ...DEFAULTS.lock, ...p.lock } };
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
