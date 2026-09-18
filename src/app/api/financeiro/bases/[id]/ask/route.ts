import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isFinanceAllowed, isUnlocked } from '@/lib/finance';
import { chat, embed, cosine, embeddingsEnabled, aiConfigured } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 120;

async function guard() {
  if (!(await isFinanceAllowed())) return 'forbidden';
  if (!(await isUnlocked())) return 'locked';
  return null;
}

const SYSTEM =
  'Você é o analista financeiro do escritório Mota & Advogados. Responda SOMENTE com base nos ' +
  'DOCUMENTOS fornecidos — nunca invente valores. Números (R$), CNPJ/CPF, datas e impostos devem ser ' +
  'copiados exatamente dos documentos. Se o usuário pedir uma planilha, tabela, lista ou "dados", ' +
  'responda com JSON no formato {"columns":["Col1",...],"rows":[{"Col1":valor,...}],"answer":"resumo curto"}. ' +
  'Se for uma pergunta aberta, use {"columns":[],"rows":[],"answer":"texto"}. ' +
  'Sempre retorne JSON válido, sem texto fora do JSON.';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return NextResponse.json({ error: g }, { status: g === 'locked' ? 401 : 403 });
  if (!aiConfigured()) return NextResponse.json({ error: 'ai_unconfigured' }, { status: 503 });

  const { id: baseId } = await ctx.params;
  const { prompt } = await req.json().catch(() => ({}));
  const q = String(prompt ?? '').trim();
  if (!q) return NextResponse.json({ error: 'prompt' }, { status: 400 });

  const files = await prisma.financeFile.findMany({
    where: { baseId, status: 'PRONTO' },
    select: { id: true, filename: true, content: true, embedding: true }
  });
  if (files.length === 0) return NextResponse.json({ error: 'empty_base' }, { status: 400 });

  // Recuperação: ranqueia por embedding se disponível, senão usa todos.
  let selected = files;
  if (embeddingsEnabled()) {
    const [qv] = await embed([q]);
    if (qv) {
      selected = files
        .map(f => ({ f, score: Array.isArray(f.embedding) ? cosine(qv, f.embedding as number[]) : -1 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(x => x.f);
    }
  }

  const context = selected
    .map((f, i) => `### Documento ${i + 1}: ${f.filename}\n${(f.content ?? '').slice(0, 12000)}`)
    .join('\n\n---\n\n')
    .slice(0, 90_000);

  const raw = await chat([
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `DOCUMENTOS:\n${context}\n\nPEDIDO: ${q}` }
  ], { json: true });

  let parsed: any = { columns: [], rows: [], answer: raw };
  try { parsed = JSON.parse(raw); } catch { /* mantém texto cru */ }
  const columns = Array.isArray(parsed.columns) ? parsed.columns : [];
  const rows = Array.isArray(parsed.rows) ? parsed.rows : [];
  const answer = typeof parsed.answer === 'string' ? parsed.answer : String(raw);

  await prisma.financeQuery.create({ data: { baseId, prompt: q, columns, rows, answer } });
  return NextResponse.json({ columns, rows, answer, sources: selected.map(f => f.filename) });
}
