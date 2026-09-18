// Camada de IA OpenAI-compatible. 100% configurável por env — nenhum
// provedor ou modelo fixo no código. Preencha AI_* no .env ao subir.

const BASE = (process.env.AI_BASE_URL ?? '').replace(/\/+$/, '');
const KEY = process.env.AI_API_KEY ?? '';
const CHAT_MODEL = process.env.AI_MODEL ?? '';
const VISION_MODEL = process.env.AI_VISION_MODEL ?? process.env.AI_MODEL ?? '';

// Embeddings: slot próprio (provedor pode ser outro). Cai no do chat se vazio.
const EMBED_BASE = (process.env.AI_EMBED_BASE_URL ?? process.env.AI_BASE_URL ?? '').replace(/\/+$/, '');
const EMBED_KEY = process.env.AI_EMBED_API_KEY ?? process.env.AI_API_KEY ?? '';
const EMBED_MODEL = process.env.AI_EMBED_MODEL ?? '';

export function aiConfigured(): boolean {
  return Boolean(BASE && KEY && CHAT_MODEL);
}
export function embeddingsEnabled(): boolean {
  return Boolean(EMBED_BASE && EMBED_KEY && EMBED_MODEL);
}

class AINotConfigured extends Error {
  constructor() { super('IA não configurada. Preencha AI_BASE_URL, AI_API_KEY e AI_MODEL no .env.'); }
}

type Msg = { role: 'system' | 'user' | 'assistant'; content: any };

async function post(path: string, body: unknown, base = BASE, key = KEY) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`IA ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

/** Chat de texto. */
export async function chat(messages: Msg[], opts: { json?: boolean } = {}): Promise<string> {
  if (!aiConfigured()) throw new AINotConfigured();
  const body: any = { model: CHAT_MODEL, messages, temperature: 0.1 };
  if (opts.json) body.response_format = { type: 'json_object' };
  const data = await post('/chat/completions', body);
  return data?.choices?.[0]?.message?.content ?? '';
}

/** Leitura de documento por visão. `dataUrl` = data:<mime>;base64,<...> */
export async function visionRead(dataUrl: string, instruction: string): Promise<string> {
  if (!aiConfigured()) throw new AINotConfigured();
  const messages: Msg[] = [
    { role: 'user', content: [
      { type: 'text', text: instruction },
      { type: 'image_url', image_url: { url: dataUrl } }
    ]}
  ];
  const data = await post('/chat/completions', { model: VISION_MODEL, messages, temperature: 0 });
  return data?.choices?.[0]?.message?.content ?? '';
}

/** Embeddings para busca semântica. Retorna [] se não configurado. */
export async function embed(texts: string[]): Promise<number[][]> {
  if (!embeddingsEnabled() || texts.length === 0) return [];
  const data = await post('/embeddings', { model: EMBED_MODEL, input: texts }, EMBED_BASE, EMBED_KEY);
  return (data?.data ?? []).map((d: any) => d.embedding as number[]);
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}
