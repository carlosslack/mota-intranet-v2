import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import { prisma } from '@/lib/db';

const OK   = 'bg-emerald-500/15 text-emerald-300';
const WARN = 'bg-amber-500/15 text-amber-300';
const NEUT = 'bg-white/5 text-ink-300';
const GOLD = 'bg-gold-300/15 text-gold-300';

export default async function ConfigPage() {
  const [tiCount, adminCount, userCount] = await Promise.all([
    prisma.user.count({ where:{role:'TI'} }),
    prisma.user.count({ where:{role:'ADMIN'} }),
    prisma.user.count({ where:{role:'USER'} })
  ]);

  const sections = [
    { title:'Integrações Google Workspace', sub:'Contas conectadas via OAuth · domínio mota.adv.br', icon:'workspaces', iconBg:'bg-gold-300/15', iconFg:'text-gold-300', rows:[
      { label:'Google Calendar',       hint:'Audiências, prazos e compromissos',      status:'Conectado',            badge:OK },
      { label:'Gmail (leitura)',        hint:'Timeline de casos com e-mails',         status:'Autorização pendente', badge:WARN },
      { label:'Google Drive',           hint:'Pasta automática por caso',             status:'Conectado',            badge:OK },
      { label:'Google Chat (bot MOTA)', hint:'Notificações de chamados e prazos',     status:'Não configurado',      badge:NEUT }
    ]},
    { title:'Chamados de TI', sub:'Regras da fila única · admin ti@mota.adv.br', icon:'support_agent', iconBg:'bg-rose-500/15', iconFg:'text-rose-400', rows:[
      { label:'SLA padrão',           hint:'Prioridade alta responde em até 30 min', status:'30 min', badge:GOLD },
      { label:'Notificação por Chat', hint:'Space #ti-mota recebe cópia dos novos',  status:'Ativo',  badge:OK },
      { label:'Escalação para sócios',hint:'Após 4h sem resposta em urgência',       status:'Ativo',  badge:OK }
    ]},
    { title:'IA / Assistente Interno', sub:'Modelo padrão da home e do CRM', icon:'auto_awesome', iconBg:'bg-violet-500/15', iconFg:'text-violet-400', rows:[
      { label:'Provedor',      hint:'OpenRouter (chave em cofre)',   status:'Configurado', badge:OK },
      { label:'Modelo padrão', hint:'google/gemini-2.5-flash',       status:'Ativo',       badge:OK },
      { label:'Fallback',      hint:'gemini-2.5-pro em erros',       status:'Ativo',       badge:OK }
    ]},
    { title:'Usuários & Papéis', sub:'Login exclusivamente com Google Workspace @mota.adv.br', icon:'group', iconBg:'bg-sky-500/15', iconFg:'text-sky-400', rows:[
      { label:'Admin TI',       hint:'ti@mota.adv.br',              status:`${tiCount} usuário${tiCount!==1?'s':''}`,       badge:GOLD },
      { label:'Administradores',hint:'Sócios com acesso ampliado',  status:`${adminCount} usuário${adminCount!==1?'s':''}`, badge:NEUT },
      { label:'Colaboradores',  hint:'Acesso a Chamados e Agenda',  status:`${userCount} usuário${userCount!==1?'s':''}`,   badge:NEUT }
    ]}
  ];

  return (
    <Shell active="config">
      <div className="mx-auto max-w-3xl fade-up">
        {sections.map(s => (
          <div key={s.title} className="panel mb-3 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${s.iconBg} ${s.iconFg}`}><Icon name={s.icon} size={18} /></div>
              <div>
                <b className="block font-display text-base">{s.title}</b>
                <span className="text-xs text-ink-500">{s.sub}</span>
              </div>
            </div>
            {s.rows.map(r => (
              <div key={r.label} className="flex items-center justify-between border-t border-dashed border-white/5 py-2.5">
                <div className="leading-tight">
                  <b className="block text-sm">{r.label}</b>
                  <span className="text-[11px] text-ink-500">{r.hint}</span>
                </div>
                <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${r.badge}`}>{r.status}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Shell>
  );
}
