import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { Icon } from '@/components/Icon';
import { prisma } from '@/lib/db';

async function ticketCount() {
  try { return await prisma.ticket.count({ where: { status: { in: ['ABERTO','EM_ANDAMENTO'] } } }); }
  catch { return 0; }
}

type MetaKey = 'home'|'tickets'|'ticketNew'|'ticket'|'leads'|'cases'|'clients'|'services'|'agenda'|'news'|'config';
const META: Record<MetaKey, { eyebrow:string; title:string; icon:string; cta:string; ctaHref?:string }> = {
  home:      { eyebrow:'Portal',       title:'Início',            icon:'home',                  cta:'Ações rápidas' },
  tickets:   { eyebrow:'Suporte TI',   title:'Chamados',          icon:'support_agent',         cta:'Novo chamado', ctaHref:'/chamados/novo' },
  ticketNew: { eyebrow:'Suporte TI',   title:'Abrir chamado',     icon:'add_task',              cta:'Abrir outro',  ctaHref:'/chamados/novo' },
  ticket:    { eyebrow:'Suporte TI',   title:'Detalhe do chamado',icon:'confirmation_number',   cta:'Novo chamado', ctaHref:'/chamados/novo' },
  leads:     { eyebrow:'CRM',          title:'Prospecção jurídica', icon:'trending_up',         cta:'Novo lead' },
  cases:     { eyebrow:'CRM',          title:'Casos',             icon:'gavel',                 cta:'Novo caso' },
  clients:   { eyebrow:'CRM',          title:'Clientes',          icon:'apartment',             cta:'Novo cliente' },
  services:  { eyebrow:'CRM',          title:'Serviços jurídicos',icon:'checklist',             cta:'Novo serviço' },
  agenda:    { eyebrow:'Escritório',   title:'Agenda',            icon:'event',                 cta:'Novo compromisso' },
  news:      { eyebrow:'Escritório',   title:'Comunicados',       icon:'campaign',              cta:'Novo comunicado' },
  config:    { eyebrow:'Configurações',title:'Preferências',      icon:'settings',              cta:'Salvar' }
};

export async function Shell({ active, children }: { active: MetaKey; children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const badge = active === 'tickets' ? undefined : await ticketCount();
  const meta = META[active];
  const initials = ((user?.name ?? user?.email ?? '?').split(' ').map(s=>s[0]).slice(0,2).join('')).toUpperCase();
  const isTi = (user as any)?.role === 'TI' || (user as any)?.role === 'ADMIN';

  const menuMain = [
    { href:'/',           label:'Início',      icon:'home',           k:'home'    as MetaKey },
    { href:'/chamados',   label:'Chamados TI', icon:'support_agent',  k:'tickets' as MetaKey, badge: badge && badge > 0 ? String(badge) : undefined },
    { href:'/comunicados',label:'Comunicados', icon:'campaign',       k:'news'    as MetaKey },
    { href:'/agenda',     label:'Agenda',      icon:'event',          k:'agenda'  as MetaKey }
  ];
  const menuCrm = [
    { href:'/leads',      label:'Leads',       icon:'trending_up',    k:'leads'    as MetaKey },
    { href:'/casos',      label:'Casos',       icon:'gavel',          k:'cases'    as MetaKey },
    { href:'/clientes',   label:'Clientes',    icon:'apartment',      k:'clients'  as MetaKey },
    { href:'/servicos',   label:'Serviços',    icon:'checklist',      k:'services' as MetaKey },
    { href:'/config',     label:'Configurações',icon:'settings',      k:'config'   as MetaKey }
  ];

  return (
    <div className="min-h-screen text-ink-100 font-sans" style={{ display:'grid', gridTemplateColumns:'236px 1fr', gridTemplateRows:'64px 1fr' }}>
      <aside className="row-span-2 flex flex-col gap-1 border-r border-[rgba(212,175,55,.15)] bg-sidebar-gradient p-4">
        <div className="flex items-center gap-3 px-2 pb-4">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gold-gradient font-display font-bold text-navy-900">M</div>
          <span className="font-display text-[11px] font-bold leading-tight uppercase tracking-[.16em]">
            MOTA<br/><span className="font-normal text-gold-300">&nbsp;&amp;&nbsp;</span>ADVOGADOS
          </span>
        </div>

        <div className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[.24em] text-ink-500">Menu</div>
        {menuMain.map(m => (
          <NavItem key={m.href} href={m.href} label={m.label} icon={m.icon} active={active === m.k} badge={m.badge} />
        ))}

        <div className="px-2 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[.24em] text-ink-500">CRM Jurídico</div>
        {menuCrm.map(m => (
          <NavItem key={m.href} href={m.href} label={m.label} icon={m.icon} active={active === m.k} />
        ))}

        <div className="mt-auto flex items-center gap-3 border-t border-white/5 pt-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gold-gradient font-display text-[11px] font-bold text-navy-900">{initials}</div>
          <div className="min-w-0 flex-1 leading-tight">
            <b className="block truncate text-[13px] font-semibold text-ink-100">{user?.name ?? '—'}</b>
            <span className="text-[11px] text-ink-500">{isTi ? 'Admin TI' : 'Colaborador'}</span>
          </div>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/entrar' }); }}>
            <button className="text-ink-500 hover:text-gold-300" aria-label="Sair"><Icon name="logout" size={18} /></button>
          </form>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-[rgba(212,175,55,.15)] bg-[rgba(6,13,31,.4)] px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <Icon name={meta.icon} size={22} className="text-gold-300" />
          <div className="leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-[.24em] text-gold-300">{meta.eyebrow}</div>
            <h1 className="font-display text-lg font-medium">{meta.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex min-w-[280px] items-center gap-2 rounded-lg border border-white/10 bg-white/[.03] px-3 py-1.5">
            <Icon name="search" size={18} className="text-ink-500" />
            <input placeholder="Buscar clientes, casos, chamados..." className="flex-1 bg-transparent text-sm outline-none" />
            <span className="rounded border border-white/10 px-1 text-[10px] text-ink-500">⌘K</span>
          </div>
          {meta.ctaHref ? (
            <Link href={meta.ctaHref} className="flex items-center gap-2 rounded-lg bg-gold-gradient px-3.5 py-2 text-[13px] font-semibold text-navy-900 shadow-gold-glow hover:brightness-110">
              <Icon name="add" size={16} /> {meta.cta}
            </Link>
          ) : (
            <button className="flex items-center gap-2 rounded-lg bg-gold-gradient px-3.5 py-2 text-[13px] font-semibold text-navy-900 shadow-gold-glow">
              <Icon name="add" size={16} /> {meta.cta}
            </button>
          )}
          <Icon name="notifications" size={22} className="text-ink-300" />
        </div>
      </header>

      <main className="overflow-y-auto px-7 pt-6 pb-10">{children}</main>
    </div>
  );
}

function NavItem({ href, label, icon, active, badge }: { href:string; label:string; icon:string; active?:boolean; badge?:string }) {
  const cls = active
    ? 'bg-[rgba(212,175,55,.09)] border-[rgba(212,175,55,.28)] text-ink-100 font-semibold'
    : 'border-transparent text-ink-300 font-medium hover:bg-[rgba(212,175,55,.06)] hover:text-ink-100';
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-lg border px-2.5 py-2 text-sm ${cls}`}>
      <Icon name={icon} size={20} className={active ? 'text-gold-300' : 'text-ink-500'} />
      <span>{label}</span>
      {badge && <span className="ml-auto rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">{badge}</span>}
    </Link>
  );
}
