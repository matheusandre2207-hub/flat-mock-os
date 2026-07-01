import React from 'react';

interface BatteryDotsProps {
  level: number;
  isCharging: boolean;
}

export default function BatteryDots({ level, isCharging }: BatteryDotsProps) {
  let d1Class = "opacity-30 bg-slate-900 dark:bg-white";
  let d2Class = "opacity-30 bg-slate-900 dark:bg-white";
  let d3Class = "opacity-30 bg-slate-900 dark:bg-white";

  if (isCharging) {
    if (level < 33) {
      d1Class = "bg-green-400 blink-slow";
    } else if (level >= 33 && level < 66) {
      d1Class = "bg-green-400 opacity-100";
      d2Class = "bg-green-400 blink-charge";
    } else if (level >= 66 && level < 100) {
      d1Class = "bg-green-400 opacity-100";
      d2Class = "bg-green-400 opacity-100";
      d3Class = "bg-green-400 blink-charge";
    } else {
      d1Class = "bg-green-400 opacity-100";
      d2Class = "bg-green-400 opacity-100";
      d3Class = "bg-green-400 opacity-100";
    }
  } else {
    // discharging
    if (level <= 20) {
      d1Class = "bg-red-500 blink-fast";
    } else if (level > 20 && level <= 33) {
      d1Class = "bg-slate-900 dark:bg-white opacity-100";
    } else if (level > 33 && level <= 66) {
      d1Class = "bg-slate-900 dark:bg-white opacity-100";
      d2Class = "bg-slate-900 dark:bg-white opacity-100";
    } else {
      d1Class = "bg-slate-900 dark:bg-white opacity-100";
      d2Class = "bg-slate-900 dark:bg-white opacity-100";
      d3Class = "bg-slate-900 dark:bg-white opacity-100";
    }
  }

  return (
    <div className="flex gap-1 items-center h-full" title={`Bateria: ${level}% ${isCharging ? '(Carregando)' : '(Descargando)'}`}>
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${d1Class}`} />
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${d2Class}`} />
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${d3Class}`} />
    </div>
  );
}
