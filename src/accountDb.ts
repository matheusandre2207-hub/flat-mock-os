// Conta AeroOS (usuario@aeroaccount.id). Tudo fica neste aparelho: não há servidor.
// A senha nunca é guardada em texto puro: é derivada com PBKDF2-SHA256 (100 mil iterações)
// quando o navegador oferece WebCrypto; em conexões sem HTTPS usa um fallback mais fraco.

export const ACCOUNT_DOMAIN = 'aeroaccount.id';
const ACCOUNT_KEY = 'aeroos_account';
const SESSION_KEY = 'aeroos_session';
const ITERATIONS = 100_000;

export interface PublicAccount {
  email: string;      // usuario@aeroaccount.id
  username: string;   // usuario
  name: string;
  avatar: string;
  createdAt: number;
}

interface StoredAccount extends PublicAccount {
  algo: 'pbkdf2-sha256' | 'fnv-legacy';
  salt: string;       // hex
  hash: string;       // hex
}

const enc = new TextEncoder();

const toHex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) => new Uint8Array(hex.match(/.{2}/g)!.map(h => parseInt(h, 16)));

function fnvLegacy(password: string, salt: string): string {
  let h = 0x811c9dc5;
  const input = salt + ':' + password;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

async function derive(algo: StoredAccount['algo'], password: string, saltHex: string): Promise<string> {
  if (algo === 'fnv-legacy' || !globalThis.crypto?.subtle) return fnvLegacy(password, saltHex);
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(saltHex), iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return toHex(new Uint8Array(bits));
}

function readStored(): StoredAccount | null {
  try {
    const v = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null');
    return v && v.email && v.hash ? (v as StoredAccount) : null;
  } catch {
    return null;
  }
}

function toPublic(a: StoredAccount): PublicAccount {
  return { email: a.email, username: a.username, name: a.name, avatar: a.avatar, createdAt: a.createdAt };
}

export function getAccount(): PublicAccount | null {
  const a = readStored();
  return a ? toPublic(a) : null;
}

/** Usuário: 3 a 20 caracteres, minúsculas, números, ponto ou underline. Retorna erro ou null. */
export function validateUsername(raw: string, pt = true): string | null {
  const u = raw.trim().toLowerCase();
  if (u.length < 3) return pt ? 'Use pelo menos 3 caracteres.' : 'Use at least 3 characters.';
  if (u.length > 20) return pt ? 'Use no máximo 20 caracteres.' : 'Use at most 20 characters.';
  if (!/^[a-z0-9][a-z0-9._]*[a-z0-9]$/.test(u)) {
    return pt
      ? 'Só letras, números, ponto e underline (sem começar ou terminar com ponto).'
      : 'Letters, numbers, dot and underscore only.';
  }
  return null;
}

/** 0 = fraca, 1 = razoável, 2 = forte */
export function passwordStrength(p: string): 0 | 1 | 2 {
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score >= 3 ? 2 : score >= 2 ? 1 : 0;
}

export async function createAccount(input: {
  name: string;
  username: string;
  password: string;
  avatar: string;
}): Promise<PublicAccount> {
  const username = input.username.trim().toLowerCase();
  const err = validateUsername(username);
  if (err) throw new Error(err);
  if (input.password.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');

  const saltBytes = typeof globalThis.crypto?.getRandomValues === 'function'
    ? crypto.getRandomValues(new Uint8Array(16))
    : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  const salt = toHex(saltBytes);
  const algo: StoredAccount['algo'] = globalThis.crypto?.subtle ? 'pbkdf2-sha256' : 'fnv-legacy';
  const hash = await derive(algo, input.password, salt);

  const stored: StoredAccount = {
    email: `${username}@${ACCOUNT_DOMAIN}`,
    username,
    name: input.name.trim() || username,
    avatar: input.avatar,
    createdAt: Date.now(),
    algo,
    salt,
    hash,
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(stored));
  return toPublic(stored);
}

/** Aceita "usuario" ou "usuario@aeroaccount.id" */
export async function signIn(identifier: string, password: string, keep: boolean): Promise<boolean> {
  const stored = readStored();
  if (!stored) return false;
  const typed = identifier.trim().toLowerCase().replace(new RegExp(`@${ACCOUNT_DOMAIN.replace('.', '\\.')}$`), '');
  if (typed !== stored.username) return false;
  const hash = await derive(stored.algo, password, stored.salt);
  if (hash !== stored.hash) return false;
  (keep ? localStorage : sessionStorage).setItem(SESSION_KEY, stored.email);
  return true;
}

export function isSignedIn(): boolean {
  const s = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  const acc = readStored();
  return !!(s && acc && s === acc.email);
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function deleteAccount() {
  signOut();
  localStorage.removeItem(ACCOUNT_KEY);
}
