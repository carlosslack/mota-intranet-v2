'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

type FileRec = {
  id: string; filename: string; mimeType: string; size: number;
  kind: 'TEXTO' | 'TABULAR'; status: 'NA_FILA' | 'PROCESSANDO' | 'PRONTO' | 'ERRO';
  error: string | null; createdAt: string;
};
type Base = { id: string; name: string; description: string | null };
type Result = { columns: string[]; rows: Record<string, any>[]; answer: string; sources?: string[] };

const STATUS: Record<FileRec['status'], { label: string; cls: string }> = {
  NA_FILA:     { label: 'Na fila',     cls: 'bg-slate-500/15 text-slate-300' },
  PROCESSANDO: { label: 'Processando', cls: 'bg-amber-500/15 text-amber-300' },
  PRONTO:      { label: 'Pronto',      cls: 'bg-emerald-500/15 text-emerald-300' },
  ERRO:        { label: 'Erro',        cls: 'bg-rose-500/15 text-rose-300' }
};

function kb(n: number) { return n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(0)} KB` : `${(n/1048576).toFixed(1)} MB`; }

export function BaseWorkspace({ base, initialFiles, aiReady, semantic }: { base: Base; initialFiles: FileRec[]; aiReady: boolean; semantic: boolean }) {
  const [files, setFiles] = useState<FileRec[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [askErr, setAskErr] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const ready = files.filter(f => f.status === 'PRONTO').length;
  const processing = files.some(f => f.status === 'PROCESSANDO' || f.status === 'NA_FILA');

  const refetch = useCallback(async () => {
    const res = await fetch(`/api/financeiro/bases/${base.id}`);
    if (res.ok) { const { base: b } = await res.json(); setFiles(b.files); }
  }, [base.id]);

  useEffect(() => {
    if (!processing) return;
    const t = setInterval(refetch, 2500);
    return () => clearInterval(t);
  }, [processing, refetch]);

  async function upload(list: FileList | File[]) {
    const arr = Array.from(list);
    if (arr.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    arr.forEach(f => fd.append('files', f));
    const res = await fetch(`/api/financeiro/bases/${base.id}/files`, { method: 'POST', body: fd });
    setUploading(false);
    await refetch();
    router.refresh();
  }

  async function remove(id: string) {
    setFiles(f => f.filter(x => x.id !== id));
    await fetch(`/api/financeiro/bases/${base.id}/files?fileId=${id}`, { method: 'DELETE' }).catch(() => {});
    refetch();
  }

  async function ask() {
    if (!prompt.trim() || asking) return;
    setAsking(true); setAskErr(''); setResult(null);
    const res = await fetch(`/api/financeiro/bases/${base.id}/ask`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    setAsking(false);
    if (res.ok) setResult(await res.json());
    else {
      const { error } = await res.json().catch(() => ({ error: 'erro' }));
      setAskErr(error === 'empty_base' ? 'Envie e processe arquivos antes de perguntar.'
        : error === 'ai_unconfigured' ? 'IA não configurada. Preencha as variáveis AI_* no servidor.'
        : 'Não foi possível processar o pedido.');
    }
  }

  async function exportXlsx() {
    if (!result?.rows?.length) return;
    const res = await fetch('/api/financeiro/export', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columns: result.columns, rows: result.rows, filename: base.name })
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${base.name}.xlsx`; a.click();
    URL.revokeObjectURL(url);
  }

  const cols = result?.columns?.length ? result.columns
    : Array.from(new Set((result?.rows ?? []).flatMap(r => Object.keys(r))));

  return (
    <div className="fade-up">
      <Link href="/financeiro" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-100">
        <Icon name="arrow_back" size={16} /> Voltar às bases
      </Link>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold-300/15 text-gold-300"><Icon name="folder_open" size={20} /></div>
            <h2 className="font-display text-2xl font-normal leading-tight">{base.name}</h2>
          </div>
          {base.description && <p className="mt-1 text-sm text-ink-500">{base.description}</p>}
        </div>
        <span className="text-sm text-ink-500">{ready} pronto{ready !== 1 ? 's' : ''} · {files.length} arquivo{files.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* Coluna esquerda: ingestão */}
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
            onClick={() => fileInput.current?.click()}
            className={`panel grid cursor-pointer place-items-center p-6 text-center transition-colors ${drag ? 'border-gold-300/60' : 'hover:border-gold-300/30'}`}>
            <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-gold-300/15 text-gold-300"><Icon name={uploading ? 'progress_activity' : 'upload'} size={24} className={uploading ? 'animate-spin' : ''} /></div>
            <b className="text-sm">{uploading ? 'Enviando…' : 'Arraste arquivos ou clique'}</b>
            <p className="mt-1 text-[11px] text-ink-500">PDF · imagens · XML · CSV · XLSX · TXT · DOCX</p>
            <input ref={fileInput} type="file" multiple hidden
              onChange={e => { if (e.target.files) upload(e.target.files); e.target.value = ''; }} />
          </div>

          <div className="mt-3 space-y-2">
            {files.length === 0 && <p className="px-1 text-[12px] text-ink-500">Nenhum arquivo enviado ainda.</p>}
            {files.map(f => {
              const s = STATUS[f.status];
              return (
                <div key={f.id} className="panel flex items-center gap-3 p-3">
                  <Icon name={f.kind === 'TABULAR' ? 'table_view' : 'description'} size={20} className="shrink-0 text-ink-500" />
                  <div className="min-w-0 flex-1 leading-tight">
                    <b className="block truncate text-[13px]">{f.filename}</b>
                    <span className="text-[10px] text-ink-500">{kb(f.size)} · {f.kind === 'TABULAR' ? 'Tabular' : 'Texto'}</span>
                    {f.status === 'ERRO' && f.error && <span className="mt-0.5 block text-[10px] text-rose-300">{f.error}</span>}
                  </div>
                  <span className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-semibold ${s.cls} ${f.status === 'PROCESSANDO' ? 'animate-pulse' : ''}`}>{s.label}</span>
                  <button onClick={() => remove(f.id)} className="shrink-0 text-ink-700 hover:text-rose-300" aria-label="Remover"><Icon name="close" size={16} /></button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna direita: ambiente de pergunta */}
        <div className="panel flex flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="auto_awesome" size={18} className="text-gold-300" />
            <b className="font-display text-base">Pergunte à base</b>
            <span className="ml-auto flex items-center gap-1 rounded-pill bg-white/5 px-2 py-0.5 text-[10px] text-ink-500">
              <Icon name={semantic ? 'manage_search' : 'bolt'} size={12} /> {semantic ? 'Busca semântica' : 'Contexto direto'}
            </span>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[.03] p-3">
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask(); }}
              rows={3} placeholder="Ex.: Gere uma planilha com CNPJ, Razão Social, Valor Bruto, ISS e Data de emissão de todas as notas."
              className="w-full resize-y bg-transparent text-sm outline-none" style={{ color: '#f2f2f5' }} />
            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <span className="text-[11px] text-ink-700">⌘/Ctrl + Enter</span>
              <button onClick={ask} disabled={asking || !prompt.trim() || !aiReady}
                className="flex items-center gap-2 rounded-lg bg-gold-gradient px-4 py-1.5 text-sm font-semibold text-navy-900 disabled:opacity-40">
                {asking ? <><Icon name="progress_activity" size={16} className="animate-spin" /> Analisando…</> : <><Icon name="send" size={15} /> Perguntar</>}
              </button>
            </div>
          </div>

          {!aiReady && <p className="mt-2 flex items-center gap-1 text-[12px] text-amber-300"><Icon name="warning" size={14} /> IA não configurada — preencha as variáveis AI_* no servidor.</p>}
          {askErr && <p className="mt-2 flex items-center gap-1 text-[12px] text-rose-300"><Icon name="error" size={14} /> {askErr}</p>}

          {/* Sugestões */}
          {!result && !asking && (
            <div className="mt-3 flex flex-wrap gap-2">
              {['Some o valor total das notas', 'Liste CNPJ, valor e data de cada documento', 'Quais impostos aparecem e seus totais?'].map(s => (
                <button key={s} onClick={() => setPrompt(s)} className="rounded-pill border border-white/10 px-3 py-1 text-[12px] text-ink-300 hover:border-gold-300/40 hover:text-gold-300">{s}</button>
              ))}
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="mt-4 fade-up">
              {result.answer && <p className="mb-3 rounded-lg border border-white/5 bg-white/[.02] p-3 text-sm leading-relaxed text-ink-300 whitespace-pre-wrap">{result.answer}</p>}

              {result.rows?.length > 0 && (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] text-ink-500">{result.rows.length} linha{result.rows.length !== 1 ? 's' : ''}</span>
                    <button onClick={exportXlsx} className="flex items-center gap-1.5 rounded-lg border border-gold-300/30 bg-gold-300/[.08] px-3 py-1.5 text-[12px] font-semibold text-gold-300 hover:bg-gold-300/15">
                      <Icon name="download" size={15} /> Exportar .xlsx
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-white/[.04]">
                          {cols.map(c => <th key={c} className="whitespace-nowrap border-b border-white/10 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gold-300">{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((r, i) => (
                          <tr key={i} className="hover:bg-white/[.02]">
                            {cols.map(c => <td key={c} className="whitespace-nowrap border-b border-white/5 px-3 py-2 text-ink-300">{String(r[c] ?? '')}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {result.sources && result.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
                  <Icon name="source" size={13} className="text-ink-500" /> Fontes:
                  {result.sources.map(s => <span key={s} className="rounded bg-white/5 px-1.5 py-0.5">{s}</span>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
