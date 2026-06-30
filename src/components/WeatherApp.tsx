import React, { useState } from 'react';
import { Search, Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, Thermometer, ArrowDown, ArrowUp } from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  desc: string;
  min: number;
  max: number;
  humidity: number;
  wind: string;
  uv: string;
  precip: string;
  hourly: Array<{ time: string; temp: number; icon: string }>;
}

const PRESET_CITIES: Record<string, WeatherData> = {
  "sao paulo": {
    city: "São Paulo, BR",
    temp: 23,
    condition: "Nuvens",
    desc: "Parcialmente nublado",
    min: 16,
    max: 26,
    humidity: 64,
    wind: "14 km/h",
    uv: "3 (Médio)",
    precip: "10%",
    hourly: [
      { time: "08:00", temp: 18, icon: "🌤️" },
      { time: "11:00", temp: 22, icon: "☀️" },
      { time: "14:00", temp: 25, icon: "☀️" },
      { time: "17:00", temp: 21, icon: "🌤️" },
      { time: "20:00", temp: 19, icon: "☁️" },
      { time: "23:00", temp: 17, icon: "☁️" },
    ]
  },
  "rio de janeiro": {
    city: "Rio de Janeiro, BR",
    temp: 29,
    condition: "Ensolarado",
    desc: "Céu limpo e ensolarado",
    min: 21,
    max: 32,
    humidity: 55,
    wind: "18 km/h",
    uv: "9 (Muito Alto)",
    precip: "0%",
    hourly: [
      { time: "08:00", temp: 24, icon: "☀️" },
      { time: "11:00", temp: 28, icon: "☀️" },
      { time: "14:00", temp: 31, icon: "☀️" },
      { time: "17:00", temp: 29, icon: "☀️" },
      { time: "20:00", temp: 26, icon: "🌤️" },
      { time: "23:00", temp: 23, icon: "🌤️" },
    ]
  },
  "nova york": {
    city: "Nova York, US",
    temp: 14,
    condition: "Chuva",
    desc: "Chuva fraca intermitente",
    min: 10,
    max: 17,
    humidity: 82,
    wind: "22 km/h",
    uv: "1 (Baixo)",
    precip: "75%",
    hourly: [
      { time: "08:00", temp: 11, icon: "🌧️" },
      { time: "11:00", temp: 13, icon: "🌧️" },
      { time: "14:00", temp: 15, icon: "🌧️" },
      { time: "17:00", temp: 16, icon: "🌧️" },
      { time: "20:00", temp: 14, icon: "🌧️" },
      { time: "23:00", temp: 12, icon: "☁️" },
    ]
  },
  "lisboa": {
    city: "Lisboa, PT",
    temp: 20,
    condition: "Ensolarado",
    desc: "Ensolarado com poucas nuvens",
    min: 13,
    max: 22,
    humidity: 60,
    wind: "11 km/h",
    uv: "5 (Moderado)",
    precip: "5%",
    hourly: [
      { time: "08:00", temp: 15, icon: "☀️" },
      { time: "11:00", temp: 19, icon: "☀️" },
      { time: "14:00", temp: 21, icon: "☀️" },
      { time: "17:00", temp: 20, icon: "☀️" },
      { time: "20:00", temp: 17, icon: "🌤️" },
      { time: "23:00", temp: 15, icon: "🌤️" },
    ]
  }
};

interface WeatherAppProps {
  darkMode: boolean;
}

export default function WeatherApp({ darkMode }: WeatherAppProps) {
  const [query, setQuery] = useState('');
  const [currentWeather, setCurrentWeather] = useState<WeatherData>(PRESET_CITIES["sao paulo"]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const key = query.toLowerCase().trim();
    if (PRESET_CITIES[key]) {
      setCurrentWeather(PRESET_CITIES[key]);
    } else {
      // Generate randomized realistic weather for other searched cities
      const temp = Math.floor(Math.random() * (35 - 8)) + 8;
      const conditions = ["Ensolarado", "Chuva", "Nuvens", "Tempestade"];
      const chosenCond = conditions[Math.floor(Math.random() * conditions.length)];
      
      let desc = "Tempo limpo";
      let precip = "0%";
      if (chosenCond === "Chuva") { desc = "Chuva moderada"; precip = "80%"; }
      if (chosenCond === "Nuvens") { desc = "Predomínio de nuvens"; precip = "20%"; }
      if (chosenCond === "Tempestade") { desc = "Raios e trovoadas"; precip = "90%"; }

      const generated: WeatherData = {
        city: query.charAt(0).toUpperCase() + query.slice(1) + ", BR",
        temp,
        condition: chosenCond,
        desc,
        min: temp - Math.floor(Math.random() * 5) - 2,
        max: temp + Math.floor(Math.random() * 5) + 2,
        humidity: Math.floor(Math.random() * 40) + 45,
        wind: `${Math.floor(Math.random() * 20) + 5} km/h`,
        uv: `${Math.floor(Math.random() * 10) + 1} (Índice)`,
        precip,
        hourly: [
          { time: "08:00", temp: temp - 4, icon: chosenCond === "Chuva" ? "🌧️" : "☀️" },
          { time: "11:00", temp: temp - 1, icon: chosenCond === "Chuva" ? "🌧️" : "🌤️" },
          { time: "14:00", temp: temp + 2, icon: chosenCond === "Tempestade" ? "⛈️" : "☀️" },
          { time: "17:00", temp: temp, icon: "🌤️" },
          { time: "20:00", temp: temp - 3, icon: "☁️" },
          { time: "23:00", temp: temp - 5, icon: "☁️" },
        ]
      };
      setCurrentWeather(generated);
    }
    setQuery('');
  };

  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case 'Ensolarado':
        return <Sun className="w-16 h-16 text-amber-500 animate-[spin_40s_linear_infinite]" />;
      case 'Chuva':
        return <CloudRain className="w-16 h-16 text-blue-400" />;
      case 'Tempestade':
        return <CloudLightning className="w-16 h-16 text-purple-500" />;
      default:
        return <Cloud className="w-16 h-16 text-slate-400" />;
    }
  };

  const getWeatherBackground = () => {
    switch (currentWeather.condition) {
      case 'Ensolarado':
        return 'from-sky-400 via-amber-300 to-amber-200 dark:from-slate-950 dark:via-sky-950 dark:to-slate-900';
      case 'Chuva':
        return 'from-blue-600 via-slate-500 to-slate-400 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900';
      case 'Tempestade':
        return 'from-indigo-900 via-purple-800 to-slate-700 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950';
      default:
        return 'from-sky-400 via-sky-200 to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';
    }
  };

  return (
    <div className={`flex flex-col h-full overflow-y-auto no-scrollbar pb-24 transition-colors duration-500 bg-gradient-to-b ${getWeatherBackground()}`}>
      
      {/* Search Input */}
      <form onSubmit={handleSearch} className="p-4 flex gap-2 justify-center items-center shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
          <input 
            type="text" 
            placeholder="Buscar São Paulo, Lisboa, etc..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9.5 pr-3 py-2 text-xs rounded-xl border-none bg-white/15 dark:bg-black/25 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/40"
          />
        </div>
        <button 
          type="submit"
          className="px-3.5 py-2 text-xs font-bold rounded-xl border-none bg-white/20 dark:bg-black/35 text-white cursor-pointer hover:bg-white/30"
        >
          Ir
        </button>
      </form>

      {/* Main Temp Widget */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-4 text-white">
        <h2 className="text-xl font-bold tracking-tight drop-shadow-sm">{currentWeather.city}</h2>
        <p className="text-[11px] opacity-75 mt-0.5">{currentWeather.desc}</p>
        
        <div className="my-5 flex items-center justify-center gap-4.5">
          {getWeatherIcon(currentWeather.condition)}
          <span className="text-5xl font-light font-mono leading-none tracking-tighter select-none">
            {currentWeather.temp}°
          </span>
        </div>

        {/* Min & Max Row */}
        <div className="flex gap-4 text-xs font-medium opacity-90 drop-shadow-sm">
          <span className="flex items-center gap-0.5 text-blue-200">
            <ArrowDown size={14} /> Min {currentWeather.min}°
          </span>
          <span className="flex items-center gap-0.5 text-amber-200">
            <ArrowUp size={14} /> Max {currentWeather.max}°
          </span>
        </div>
      </div>

      {/* Atmospheric stats grids */}
      <div className="px-5 py-4 shrink-0">
        <div className="grid grid-cols-2 gap-3">
          
          <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md text-white flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-300" />
            <div>
              <span className="text-[10px] opacity-60 block leading-tight">Umidade</span>
              <span className="font-bold text-xs font-mono">{currentWeather.humidity}%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md text-white flex items-center gap-3">
            <Wind className="w-5 h-5 text-emerald-300" />
            <div>
              <span className="text-[10px] opacity-60 block leading-tight">Vento</span>
              <span className="font-bold text-xs font-mono">{currentWeather.wind}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md text-white flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-amber-300" />
            <div>
              <span className="text-[10px] opacity-60 block leading-tight">Precipitação</span>
              <span className="font-bold text-xs font-mono">{currentWeather.precip}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md text-white flex items-center gap-3">
            <Sun className="w-5 h-5 text-yellow-300" />
            <div>
              <span className="text-[10px] opacity-60 block leading-tight">Índice UV</span>
              <span className="font-bold text-xs font-mono">{currentWeather.uv}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Hourly list */}
      <div className="px-5 py-3 shrink-0">
        <div className="p-4 rounded-2.5xl bg-white/10 dark:bg-black/25 backdrop-blur-md text-white space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 text-left">Previsão de hoje</h3>
          
          <div className="flex justify-between items-center overflow-x-auto gap-4 py-1 no-scrollbar">
            {currentWeather.hourly.map((h, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5 shrink-0 px-2 text-center">
                <span className="text-[9px] opacity-50 font-mono">{h.time}</span>
                <span className="text-lg filter drop-shadow-sm select-none">{h.icon}</span>
                <span className="font-bold text-[11px] font-mono">{h.temp}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
