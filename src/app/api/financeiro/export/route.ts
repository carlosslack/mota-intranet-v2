import { NextRequest, NextResponse } from 'next/server';
import { isFinanceAllowed, isUnlocked } from '@/lib/finance';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!(await isFinanceAllowed())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!(await isUnlocked())) return NextResponse.json({ error: 'locked' }, { status: 401 });

  const { columns, rows, filename } = await req.json().catch(() => ({}));
  const cols: string[] = Array.isArray(columns) && columns.length
    ? columns
    : Array.from(new Set((rows ?? []).flatMap((r: any) => Object.keys(r ?? {}))));
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: 'no_rows' }, { status: 400 });

  const XLSX = await import('xlsx');
  const aoa = [cols, ...rows.map((r: any) => cols.map(c => r?.[c] ?? ''))];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  const buf: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const body = new Uint8Array(buf);

  const name = String(filename ?? 'financeiro').replace(/[^\w.-]+/g, '_').replace(/\.xlsx$/i, '');
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${name}.xlsx"`
    }
  });
}
