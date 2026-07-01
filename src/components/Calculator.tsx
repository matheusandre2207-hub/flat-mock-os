import React, { useState } from 'react';

interface CalculatorProps {
  darkMode?: boolean;
}

export default function Calculator({ darkMode = true }: CalculatorProps) {
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

  const numBtnClass = `h-12 rounded-full font-semibold transition-all text-base active:scale-95 ${
    darkMode 
      ? 'bg-slate-800/80 hover:bg-slate-800 text-white' 
      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
  }`;

  const topBtnClass = `h-12 rounded-full font-bold transition-all text-sm active:scale-95 ${
    darkMode
      ? 'bg-slate-700/60 hover:bg-slate-700/80 text-yellow-400'
      : 'bg-slate-300 hover:bg-slate-400 text-slate-800'
  }`;

  return (
    <div className={`w-full h-full flex flex-col justify-end p-4 pb-20 pt-4 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Display screen */}
      <div className={`mb-3 text-right p-4 rounded-2xl border min-h-[110px] flex flex-col justify-end transition-colors ${darkMode ? 'bg-black/35 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`text-xs font-mono h-4 mb-1 truncate ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>
          {equation}
        </div>
        <div className={`text-4xl font-semibold font-mono tracking-wider truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {display}
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        <button onClick={clear} className={topBtnClass}>
          AC
        </button>
        <button onClick={toggleSign} className={topBtnClass}>
          +/-
        </button>
        <button onClick={handlePercent} className={topBtnClass}>
          %
        </button>
        <button onClick={() => handleOp('÷')} className="h-12 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all text-lg">
          ÷
        </button>

        <button onClick={() => handleNum('7')} className={numBtnClass}>
          7
        </button>
        <button onClick={() => handleNum('8')} className={numBtnClass}>
          8
        </button>
        <button onClick={() => handleNum('9')} className={numBtnClass}>
          9
        </button>
        <button onClick={() => handleOp('×')} className="h-12 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all text-lg">
          ×
        </button>

        <button onClick={() => handleNum('4')} className={numBtnClass}>
          4
        </button>
        <button onClick={() => handleNum('5')} className={numBtnClass}>
          5
        </button>
        <button onClick={() => handleNum('6')} className={numBtnClass}>
          6
        </button>
        <button onClick={() => handleOp('-')} className="h-12 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all text-lg">
          -
        </button>

        <button onClick={() => handleNum('1')} className={numBtnClass}>
          1
        </button>
        <button onClick={() => handleNum('2')} className={numBtnClass}>
          2
        </button>
        <button onClick={() => handleNum('3')} className={numBtnClass}>
          3
        </button>
        <button onClick={() => handleOp('+')} className="h-12 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all text-lg">
          +
        </button>

        <button onClick={() => handleNum('0')} className={`col-span-2 text-left pl-6 ${numBtnClass}`}>
          0
        </button>
        <button onClick={handleDecimal} className={numBtnClass}>
          ,
        </button>
        <button onClick={calculate} className="h-12 rounded-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold transition-all text-lg">
          =
        </button>
      </div>
    </div>
  );
}
