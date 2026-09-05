import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function brl(v: number | { toString(): string } | null | undefined): string {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : Number(v.toString());
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }).replace('R$', 'R$ ');
}

export function fmtDate(d: Date | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!d) return '—';
  return format(d, pattern, { locale: ptBR });
}

export function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return '—';
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return `há ${Math.floor(s/60)} min`;
  if (s < 86400) return `há ${Math.floor(s/3600)} h`;
  const dias = Math.floor(s / 86400);
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
}
