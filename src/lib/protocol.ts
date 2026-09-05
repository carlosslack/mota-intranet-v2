import { db } from "@/lib/db";

export async function nextTicketProtocol(): Promise<string> {
  const last = await db.ticket.findFirst({
    orderBy: { createdAt: "desc" },
    select: { protocol: true },
  });

  let next = 1;
  if (last?.protocol) {
    const match = last.protocol.match(/^MOTA-(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }

  return `MOTA-${next.toString().padStart(4, "0")}`;
}
