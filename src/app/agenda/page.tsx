import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';

const week = [
  { weekday:'SEG', day:'08', dayColor:'text-ink-100', isToday:false, border:'border-white/10', events:[
    { time:'10:00', title:'Reunião com Vale do Guaíba', bg:'bg-violet-500/10', color:'border-violet-400' },
    { time:'15:30', title:'Deadline: parecer LGPD',      bg:'bg-amber-500/10',   color:'border-amber-400' }
  ]},
  { weekday:'TER', day:'09', dayColor:'text-gold-300', isToday:true,  border:'border-gold-300/35', events:[
    { time:'14:00', title:'Audiência · 2ª Vara Cível',    bg:'bg-gold-300/15', color:'border-gold-300' },
    { time:'16:00', title:'Meet · Sindicato',             bg:'bg-sky-500/10',  color:'border-sky-400' }
  ]},
  { weekday:'QUA', day:'10', dayColor:'text-ink-100', isToday:false, border:'border-white/10', events:[
    { time:'09:00', title:'Café com sócios', bg:'bg-emerald-500/10', color:'border-emerald-400' }
  ]},
  { weekday:'QUI', day:'11', dayColor:'text-ink-100', isToday:false, border:'border-white/10', events:[
    { time:'11:00', title:'Aniversário: Fernanda', bg:'bg-rose-500/10', color:'border-rose-400' },
    { time:'14:00', title:'Prazo: Recurso Ordinário', bg:'bg-amber-500/10', color:'border-amber-400' }
  ]},
  { weekday:'SEX', day:'12', dayColor:'text-ink-100', isToday:false, border:'border-white/10', events:[
    { time:'10:00', title:'Reunião geral (auditório)', bg:'bg-gold-300/15', color:'border-gold-300' }
  ]},
  { weekday:'SAB', day:'13', dayColor:'text-ink-500', isToday:false, border:'border-white/10', events:[] },
  { weekday:'DOM', day:'14', dayColor:'text-ink-500', isToday:false, border:'border-white/10', events:[
    { time:'—', title:'Aniversário: João Ricardo', bg:'bg-rose-500/10', color:'border-rose-400' }
  ]}
];

export default function AgendaPage() {
  return (
    <Shell active="agenda">
      <div className="fade-up">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-base">
            <Icon name="chevron_left" className="cursor-pointer text-ink-500" />
            Setembro 2026
            <Icon name="chevron_right" className="cursor-pointer text-ink-500" />
          </div>
          <div className="flex gap-1 text-xs">
            <span className="cursor-pointer rounded-lg bg-gold-300/15 px-3 py-1 text-gold-300">Semana</span>
            <span className="cursor-pointer rounded-lg px-3 py-1 text-ink-500">Mês</span>
            <span className="cursor-pointer rounded-lg px-3 py-1 text-ink-500">Lista</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {week.map(d => (
            <div key={d.day} className={`panel flex min-h-[220px] flex-col gap-1.5 border p-3 ${d.border}`}>
              <div className="flex items-baseline justify-between border-b border-white/5 pb-1.5">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink-500">{d.weekday}</div>
                  <b className={`font-display text-lg ${d.dayColor}`}>{d.day}</b>
                </div>
                {d.isToday && <span className="rounded bg-gold-300 px-1.5 text-[10px] font-bold text-navy-900">HOJE</span>}
              </div>
              {d.events.map((ev,i) => (
                <div key={i} className={`rounded border-l-2 px-2 py-1 text-[10px] leading-tight ${ev.bg} ${ev.color}`}>
                  <b className="block">{ev.time}</b>
                  <span className="text-ink-300">{ev.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
