import React from 'react';
import { X, Trash2 } from 'lucide-react';

export interface PanelTile { id: string; label: string; icon: React.ReactNode; active: boolean; onToggle: () => void }
export interface PanelNotif { id: string; app: string; title: string; body: string; time: string }

interface Props {
  kind: 'notifications' | 'quick';
  dark: boolean;
  notifications: PanelNotif[];
  tiles: PanelTile[];
  brightness: number;
  onBrightness: (n: number) => void;
  renderIcon: (app: string) => React.ReactNode;
  appLabel: (app: string) => string;
  onDismiss: (id: string) => void;
  onClear: () => void;
  onOpen: (app: string) => void;
  onClose: () => void;
}

/** Notificações e ajustes rápidos na horizontal, abertos pelas pílulas da barra de status em paisagem.
 *  Fica dentro do quadro girado do app, então já nasce na orientação certa. */
export default function LandscapePanel({ kind, dark, notifications, tiles, brightness, onBrightness, renderIcon, appLabel, onDismiss, onClear, onOpen, onClose }: Props) {
  const fg = dark ? '#f4f4f5' : '#18181b';
  const sub = dark ? 'rgba(244,244,245,.6)' : 'rgba(24,24,27,.55)';
  const glass: React.CSSProperties = {
    background: dark ? 'rgba(22,22,28,0.78)' : 'rgba(250,250,252,0.82)', color: fg,
    backdropFilter: 'blur(28px) saturate(1.6)', WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
    border: `1px solid ${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.07)'}`, borderRadius: 26,
    boxShadow: '0 18px 50px rgba(0,0,0,.35)', animation: 'lpIn .28s cubic-bezier(.22,1,.36,1) both',
  };
  const side: React.CSSProperties = kind === 'notifications' ? { left: 24 } : { right: 24 };

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', background: 'rgba(0,0,0,.28)', zIndex: 5 }}>
      <style>{`@keyframes lpIn { from { opacity: 0; transform: translateY(-14px) scale(.97); } to { opacity: 1; transform: none; } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 54, bottom: 20, width: 'min(60%, 440px)', display: 'flex', flexDirection: 'column', padding: 14, ...glass, ...side }}>
        {kind === 'notifications' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px 10px' }}>
              <strong style={{ fontSize: 16 }}>Notificações</strong>
              {notifications.length > 0 && (
                <button type="button" onClick={onClear} style={{ border: 0, background: 'transparent', color: sub, fontSize: 12, fontWeight: 600, display: 'flex', gap: 5, alignItems: 'center', cursor: 'pointer' }}>
                  <Trash2 size={13} /> Limpar tudo
                </button>
              )}
            </div>
            <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.length === 0 && <p style={{ color: sub, fontSize: 13, textAlign: 'center', marginTop: 40 }}>Nenhuma notificação</p>}
              {notifications.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 10px 10px 12px', borderRadius: 18, background: dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)' }}>
                  <button type="button" onClick={() => onOpen(n.app)} style={{ flex: 1, minWidth: 0, display: 'flex', gap: 10, alignItems: 'flex-start', border: 0, background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                    <span style={{ flex: 'none' }}>{renderIcon(n.app)}</span>
                    <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 11, color: sub, display: 'flex', justifyContent: 'space-between', gap: 8 }}><b>{appLabel(n.app)}</b><span>{n.time}</span></span>
                      <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</span>
                      <span style={{ fontSize: 12, color: sub, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body}</span>
                    </span>
                  </button>
                  <button type="button" onClick={() => onDismiss(n.id)} aria-label="Dispensar" style={{ border: 0, background: 'transparent', color: sub, cursor: 'pointer', padding: 4, flex: 'none' }}><X size={15} /></button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <strong style={{ fontSize: 16, padding: '2px 4px 12px' }}>Ajustes rápidos</strong>
            <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {tiles.map(t => (
                  <button key={t.id} type="button" onClick={t.onToggle}
                    style={{ height: 76, borderRadius: 20, border: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                      background: t.active ? 'var(--accent, #3E63DD)' : (dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'), color: t.active ? '#fff' : 'inherit', transition: 'background .2s, transform .1s' }}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
              <label style={{ display: 'block', marginTop: 16, padding: '0 4px' }}>
                <span style={{ fontSize: 12, color: sub, fontWeight: 600 }}>Brilho</span>
                <input type="range" min={30} max={100} value={brightness} onChange={e => onBrightness(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent, #3E63DD)' }} aria-label="Brilho" />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
