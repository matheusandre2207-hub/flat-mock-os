import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signIn, ACCOUNT_DOMAIN, type PublicAccount } from '../accountDb';

interface SignInScreenProps {
  account: PublicAccount;
  language: 'pt' | 'en';
  onSignedIn: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Entrada da conta AeroOS: aparece depois do boot enquanto ninguém estiver conectado. */
export default function SignInScreen({ account, language, onSignedIn }: SignInScreenProps) {
  const pt = language === 'pt';
  const [user, setUser] = useState(account.username);
  const [pass, setPass] = useState('');
  const [keep, setKeep] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy || !user.trim() || !pass) return;
    setBusy(true);
    setError('');
    const ok = await signIn(user, pass, keep);
    setBusy(false);
    if (ok) {
      onSignedIn();
    } else {
      setError(pt ? 'Usuário ou senha incorretos.' : 'Wrong username or password.');
      setShake(s => s + 1);
      setPass('');
    }
  };

  return (
    <motion.div
      className="absolute inset-0 z-[9998] flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100 font-sans select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12),transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className="relative w-full max-w-[300px] flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-[28px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-4xl mb-5">
          {account.avatar}
        </div>
        <h1 className="text-lg font-medium tracking-tight">{account.name}</h1>
        <p className="text-[11px] font-mono text-zinc-500 mt-1 mb-7">{account.email}</p>

        <form onSubmit={submit} className="w-full flex flex-col gap-3">
          <motion.div
            key={shake}
            animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col gap-3"
          >
            <label className="flex items-center h-11 rounded-2xl bg-white/[0.05] border border-white/10 focus-within:border-white/25 px-4 transition-colors">
              <input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={pt ? 'usuário' : 'username'}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm"
                aria-label={pt ? 'Usuário' : 'Username'}
              />
              <span className="text-[11px] font-mono text-zinc-500 shrink-0">@{ACCOUNT_DOMAIN}</span>
            </label>

            <label className="flex items-center h-11 rounded-2xl bg-white/[0.05] border border-white/10 focus-within:border-white/25 pl-4 pr-2 transition-colors">
              <input
                type={show ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder={pt ? 'senha' : 'password'}
                autoFocus
                className="flex-1 min-w-0 bg-transparent outline-none text-sm"
                aria-label={pt ? 'Senha' : 'Password'}
              />
              <button type="button" onClick={() => setShow(s => !s)} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </label>
          </motion.div>

          <label className="flex items-center gap-2.5 text-[12px] text-zinc-400 px-1 cursor-pointer">
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="os-switch" />
            {pt ? 'Manter conectado neste aparelho' : 'Keep me signed in on this device'}
          </label>

          <div className="h-4 text-center text-[11px] text-rose-400">{error}</div>

          <button
            type="submit"
            disabled={busy || !user.trim() || !pass}
            className="h-11 rounded-2xl bg-zinc-100 text-zinc-950 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 active:scale-[0.98]"
          >
            {busy ? (pt ? 'Entrando…' : 'Signing in…') : (pt ? 'Entrar' : 'Sign in')}
            {!busy && <ArrowRight size={14} />}
          </button>
        </form>

        <p className="text-[10px] text-zinc-600 mt-8 text-center leading-relaxed">
          {pt
            ? 'Esqueceu a senha? Use "Redefinir de fábrica" na tela de bloqueio, o que apaga a conta deste aparelho.'
            : 'Forgot your password? Use "Factory reset" on the lock screen, which deletes the account from this device.'}
        </p>
      </motion.div>
    </motion.div>
  );
}
