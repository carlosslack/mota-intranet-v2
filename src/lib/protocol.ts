import { prisma } from '@/lib/db';
export async function nextTicketProtocol(): Promise<string> {
  const last = await prisma.ticket.findFirst({ orderBy:{id:'desc'}, select:{id:true} });
  const n = (last?.id ?? 0) + 1;
  return 'MOTA-' + String(n).padStart(4,'0');
}
