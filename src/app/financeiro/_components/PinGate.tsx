'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';

export function PinGate() {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(value: string) {
    setLoading(true); setErr(false);
    const res = await fetch('/api/financeiro/unlock', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: value })
    });
    setLoading(false);
    if (res.ok) { router.refresh(); }
    else { setErr(true); setPin(''); inputRef.current?.focus(); }
  }

  function onChange(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 6);
    setPin(digits); setErr(false);
    if (digits.length === 6) submit(digits);
  }

  return (
    <div className="mx-auto max-w-sm fade-up">
      <div className="panel p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gold-gradient text-navy-900 shadow-gold-glow">
          <Icon name="lock" size={28} />
        </div>
        <b className="block font-display text-xl">Cofre financeiro</b>
        <p className="mt-1 text-sm text-ink-500">Digite o PIN de 6 dígitos para acessar as bases de dados.</p>

        <button type="button" onClick={() => inputRef.current?.focus()}
          className="mt-6 flex justify-center gap-2" aria-label="Inserir PIN">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i}
              className={`grid h-12 w-10 place-items-center rounded-lg border text-xl font-semibold transition-colors ${
                err ? 'border-rose-400/50 text-rose-300'
                : i < pin.length ? 'border-gold-300/60 text-gold-300' : 'border-white/10 text-ink-500'
              }`}
              style={{ background: 'rgba(255,255,255,.03)' }}>
              {pin[i] ? '•' : ''}
            </span>
          ))}
        </button>

        <input ref={inputRef} value={pin} onChange={e => onChange(e.target.value)}
          inputMode="numeric" autoFocus autoComplete="off"
          className="sr-only" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

        <div className="mt-4 h-5 text-sm">
          {loading && <span className="text-ink-500">Verificando…</span>}
          {err && <span className="text-rose-300">PIN incorreto. Tente novamente.</span>}
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-700">
          <Icon name="shield" size={13} className="text-gold-300" /> Sessão liberada por 8 horas neste dispositivo.
        </div>
      </div>
    </div>
  );
}
