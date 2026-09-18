import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isFinanceAllowed, isUnlocked } from '@/lib/finance';
import { visionRead, embed, embeddingsEnabled, aiConfigured } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 300;

async function guard() {
  if (!(await isFinanceAllowed())) return 'forbidden';
  if (!(await isUnlocked())) return 'locked';
  return null;
}

const TABULAR = /(sheet|excel|csv|json|xml)/i;
function kindOf(mime: string, name: string): 'TEXTO' | 'TABULAR' {
  return TABULAR.test(mime) || /\.(xlsx?|csv|json|xml)$/i.test(name) ? 'TABULAR' : 'TEXTO';
}

const VISION_PROMPT =
  'Você é um extrator de documentos financeiros/fiscais de um escritório de advocacia. ' +
  'Transcreva FIELMENTE todo o conteúdo deste documento em Markdown. ' +
  'Preserve valores monetários, CNPJ/CPF, datas, números de nota e impostos exatamente como aparecem. ' +
  'Se houver tabelas, reproduza como tabela Markdown. Não invente nada.';

async function extractContent(buf: Buffer, mime: string, name: string): Promise<string> {
  // Texto puro
  if (/(text\/|json|xml|csv)/i.test(mime) || /\.(txt|md|csv|json|xml)$/i.test(name)) {
    return buf.toString('utf-8').slice(0, 200_000);
  }
  // Planilhas via SheetJS (dependência: xlsx)
  if (/sheet|excel/i.test(mime) || /\.xlsx?$/i.test(name)) {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buf, { type: 'buffer' });
      return wb.SheetNames.map(n => `## ${n}\n` + XLSX.utils.sheet_to_csv(wb.Sheets[n])).join('\n\n').slice(0, 200_000);
    } catch { /* cai na visão */ }
  }
  // Imagens e PDF → visão
  if (aiConfigured()) {
    const dataUrl = `data:${mime || 'application/octet-stream'};base64,${buf.toString('base64')}`;
    return await visionRead(dataUrl, VISION_PROMPT);
  }
  return '';
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return NextResponse.json({ error: g }, { status: g === 'locked' ? 401 : 403 });
  const { id: baseId } = await ctx.params;
  const base = await prisma.financeBase.findUnique({ where: { id: baseId }, select: { id: true } });
  if (!base) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const form = await req.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: 'no_files' }, { status: 400 });

  const created = [];
  for (const file of files) {
    const kind = kindOf(file.type, file.name);
    const rec = await prisma.financeFile.create({
      data: { baseId, filename: file.name, mimeType: file.type || 'application/octet-stream',
              size: file.size, kind, status: 'PROCESSANDO' }
    });
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const content = await extractContent(buf, file.type, file.name);
      let embedding: number[] | null = null;
      if (content && embeddingsEnabled()) {
        const [vec] = await embed([content.slice(0, 8000)]);
        embedding = vec ?? null;
      }
      await prisma.financeFile.update({
        where: { id: rec.id },
        data: { content: content || null, embedding: embedding ?? undefined, status: content ? 'PRONTO' : 'ERRO',
                error: content ? null : 'Sem conteúdo extraído (verifique o modelo de visão).' }
      });
    } catch (e: any) {
      await prisma.financeFile.update({ where: { id: rec.id }, data: { status: 'ERRO', error: String(e?.message ?? e).slice(0, 300) } });
    }
    created.push(rec.id);
  }
  await prisma.financeBase.update({ where: { id: baseId }, data: { updatedAt: new Date() } });
  return NextResponse.json({ ok: true, created });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return NextResponse.json({ error: g }, { status: g === 'locked' ? 401 : 403 });
  const { id: baseId } = await ctx.params;
  const fileId = req.nextUrl.searchParams.get('fileId');
  if (!fileId) return NextResponse.json({ error: 'fileId' }, { status: 400 });
  await prisma.financeFile.deleteMany({ where: { id: fileId, baseId } });
  return NextResponse.json({ ok: true });
}
