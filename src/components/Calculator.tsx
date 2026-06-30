import React, { useState } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);

  const handleNum = (num: string) => {
    if (display === '0' || shouldReset) {
      setDisplay(num);
      setShouldReset(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setShouldReset(true);
  };

  const calculate = () => {
    if (!equation) return;
    const parts = equation.trim().split(' ');
    if (parts.length < 2) return;
    
    const val1 = parseFloat(parts[0]);
    const op = parts[1];
    const val2 = parseFloat(display);
    
    let res = 0;
    switch (op) {
      case '+': res = val1 + val2; break;
      case '-': res = val1 - val2; break;
      case '×': res = val1 * val2; break;
      case '÷': res = val2 !== 0 ? val1 / val2 : 0; break;
      default: return;
    }

    // Format result to prevent giant decimal overflow
    const formattedRes = Number(res.toFixed(8)).toString();
    setDisplay(formattedRes);
    setEquation('');
    setShouldReset(true);
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setShouldReset(false);
  };

  const toggleSign = () => {
    if (display !== '0') {
      if (display.startsWith('-')) {
        setDisplay(display.slice(1));
      } else {
        setDisplay('-' + display);
      }
    }
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay((val / 100).toString());
  };

  const handleDecimal = () => {
    if (shouldReset) {
      setDisplay('0.');
      setShouldReset(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-end p-6 bg-slate-950 pb-24 pt-16">
      {/* Display screen */}
      <div className="mb-6 text-right p-6 bg-black/35 rounded-2xl border border-white/5 min-h-[140px] flex flex-col justify-end">
        <div className="text-sm text-white/50 font-mono h-5 mb-1 truncate">
          {equation}
        </div>
        <div className="text-5xl font-semibold text-white font-mono tracking-wider truncate">
          {display}
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="grid grid-cols-4 gap-3.5">
        <button onClick={clear} className="h-14 rounded-full bg-slate-700/60 hover:bg-slate-700/80 active:scale-95 text-yellow-400 font-bold transition-all text-base">
          AC
        </button>
        <button onClick={toggleSign} className="h-14 rounded-full bg-slate-700/60 hover:bg-slate-700/80 active:scale-95 text-white font-medium transition-all text-base">
          +/-
        </button>
        <button onClick={handlePercent} className="h-14 rounded-full bg-slate-700/60 hover:bg-slate-700/80 active:scale-95 text-white font-medium transition-all text-base">
          %
        </button>
        <button onClick={() => handleOp('÷')} className="h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all text-xl">
          ÷
        </button>

        <button onClick={() => handleNum('7')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          7
        </button>
        <button onClick={() => handleNum('8')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          8
        </button>
        <button onClick={() => handleNum('9')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          9
        </button>
        <button onClick={() => handleOp('×')} className="h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all text-lg">
          ×
        </button>

        <button onClick={() => handleNum('4')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          4
        </button>
        <button onClick={() => handleNum('5')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          5
        </button>
        <button onClick={() => handleNum('6')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          6
        </button>
        <button onClick={() => handleOp('-')} className="h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all text-xl">
          -
        </button>

        <button onClick={() => handleNum('1')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          1
        </button>
        <button onClick={() => handleNum('2')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          2
        </button>
        <button onClick={() => handleNum('3')} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          3
        </button>
        <button onClick={() => handleOp('+')} className="h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all text-lg">
          +
        </button>

        <button onClick={() => handleNum('0')} className="col-span-2 h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg text-left pl-6">
          0
        </button>
        <button onClick={handleDecimal} className="h-14 rounded-full bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-white font-semibold transition-all text-lg">
          ,
        </button>
        <button onClick={calculate} className="h-14 rounded-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold transition-all text-xl">
          =
        </button>
      </div>
    </div>
  );
}
