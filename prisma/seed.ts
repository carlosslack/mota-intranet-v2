import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Admin de TI
  const admin = await prisma.user.upsert({
    where: { email: 'ti@mota.adv.br' },
    update: { role: 'TI' },
    create: { email: 'ti@mota.adv.br', name: 'Carlos Eduardo (TI)', role: 'TI' }
  });

  // Colaboradores
  const users: Record<string, string> = {};
  for (const u of [
    { email:'ana.mota@mota.adv.br', name:'Ana Mota' },
    { email:'fernanda.prado@mota.adv.br', name:'Fernanda Zaffari Prado' },
    { email:'carlos.fontanive@mota.adv.br', name:'Carlos Eduardo Fontanive' },
    { email:'luis.nascimento@mota.adv.br', name:'Luís Henrique Nascimento' },
    { email:'bruno.alvim@mota.adv.br', name:'Bruno Alvim' },
    { email:'joao.souza@mota.adv.br', name:'João Ricardo Souza' }
  ]) {
    const created = await prisma.user.upsert({ where:{email:u.email}, update:{name:u.name}, create:{...u, role:'USER'} });
    users[u.email] = created.id;
  }

  // Serviços
  const services = [
    ['ADV-TRAB-RESCISAO','TRABALHISTA','Rescisão contratual','Análise, cálculo e ajuizamento de reclamatória por rescisão indireta ou dispensa sem justa causa.',3500],
    ['ADV-TRAB-COLETIVA','TRABALHISTA','Ação coletiva sindical','Representação de sindicatos em ações coletivas, reajustes e cumprimento de acordos.',8000],
    ['ADV-CIVEL-CONTRATO','CIVEL','Revisão contratual','Auditoria de contratos com empresas, revisão de cláusulas e negociação de reajustes.',2800],
    ['ADV-CIVEL-COBRANCA','CIVEL','Ação de cobrança','Cobrança judicial ou extrajudicial de valores devidos por pessoa física ou jurídica.',2200],
    ['ADV-ADM-CONCURSO','ADMINISTRATIVO','Anulação de questões','Impugnação de gabarito, questões objetivas e provas discursivas em concursos públicos.',1200],
    ['ADV-PREV-INSS','PREVIDENCIARIO','Revisão de aposentadoria','Cálculo revisional, tempo especial, atividade rural e concessão de benefícios.',3200],
    ['ADV-FAM-DIVORCIO','FAMILIA_SUCESSOES','Divórcio consensual','Divórcio extrajudicial ou judicial consensual com partilha e guarda dos filhos.',2500],
    ['ADV-CONS-LGPD','CONSULTIVO','Consultoria LGPD anual','Retainer mensal para pequenas e médias empresas — DPO externo, relatórios e treinamento.',34000],
    ['ADV-TRIB-EMPR','TRIBUTARIO_EMPRESARIAL','Recuperação de tributos','Restituição de PIS/Cofins, ICMS, exclusão da base de cálculo e compensações.',6500]
  ] as const;
  for (const [sku,area,title,description,price] of services) {
    await prisma.service.upsert({
      where:{sku}, update:{},
      create:{sku, area: area as any, title, description, priceBrl: price}
    });
  }

  // Clientes
  const clientDefs = [
    { name:'Construtora Vale do Guaíba Ltda.', type:'EMPRESA', document:'12.345.678/0001-90', email:'juridico@valedoguaiba.com.br' },
    { name:'Sindicato dos Servidores POA', type:'EMPRESA', document:'87.654.321/0001-11', email:'contato@sindiservpoa.org.br' },
    { name:'Prefeitura Municipal de Canoas', type:'PODER_PUBLICO', document:null, email:'proc.geral@canoas.rs.gov.br' },
    { name:'BRQ Digital', type:'EMPRESA', document:'55.412.899/0001-00', email:'compliance@brq.digital' },
    { name:'Ricardo Camargo', type:'PESSOA', document:'123.456.789-00', email:'ricardo.camargo@gmail.com' },
    { name:'Maria Pinho', type:'PESSOA', document:'987.654.321-00', email:'maria.p@outlook.com' }
  ] as const;
  const clientIds: Record<string,string> = {};
  for (const c of clientDefs) {
    const existing = await prisma.client.findFirst({ where:{ name: c.name } });
    if (existing) { clientIds[c.name] = existing.id; continue; }
    const created = await prisma.client.create({ data:{...c, type: c.type as any, document: c.document ?? undefined, email: c.email ?? undefined } });
    clientIds[c.name] = created.id;
  }

  // Casos
  const caseDefs = [
    { title:'Rescisão contratual — Construtora Vale do Guaíba', cnj:'0034127-45.2025.8.21.0001', client:'Construtora Vale do Guaíba Ltda.', area:'TRABALHISTA', court:'2ª Vara do Trabalho POA', valueBrl: 42000 },
    { title:'Ação Coletiva · Reajuste Servidores', cnj:'0021988-12.2025.8.21.0002', client:'Sindicato dos Servidores POA', area:'ADMINISTRATIVO', court:'3ª Vara Fazendária', valueBrl: 85000 },
    { title:'Anulação de Questões · Concurso Público', cnj:'0005612-33.2026.8.21.0005', client:'Prefeitura Municipal de Canoas', area:'ADMINISTRATIVO', court:'Vara Única de Canoas', valueBrl: 12000 },
    { title:'Consultivo LGPD anual', cnj:'0088731-90.2025.8.21.0001', client:'BRQ Digital', area:'CONSULTIVO', court:null, valueBrl: 34000 }
  ] as const;
  for (const cs of caseDefs) {
    const existing = await prisma.case.findFirst({ where:{ title: cs.title } });
    if (existing) continue;
    await prisma.case.create({ data:{
      title: cs.title, cnj: cs.cnj, area: cs.area as any, court: cs.court ?? undefined, valueBrl: cs.valueBrl,
      clientId: clientIds[cs.client]
    }});
  }

  // Leads
  const leadDefs = [
    { title:'Consulta trabalhista',    contactName:'Rafael Machado', stage:'NOVO',       area:'TRABALHISTA',    valueBrl: null },
    { title:'Rescisão contratual',     contactName:'Vale do Guaíba',  stage:'FOLLOW_UP',  area:'TRABALHISTA',    valueBrl: 42000 },
    { title:'Ação coletiva · reajuste',contactName:'Sindicato Servidores POA', stage:'PROPOSTA', area:'ADMINISTRATIVO', valueBrl: 85000 },
    { title:'Anulação de concurso',    contactName:'Prefeitura de Canoas', stage:'NEGOCIACAO', area:'ADMINISTRATIVO', valueBrl: 12000 },
    { title:'Consultivo LGPD anual',   contactName:'BRQ Digital',      stage:'GANHO',     area:'CONSULTIVO',     valueBrl: 34000 },
    { title:'Divórcio consensual',     contactName:'Ricardo Camargo',  stage:'PERDIDO',   area:'FAMILIA_SUCESSOES', valueBrl: null }
  ] as const;
  for (const l of leadDefs) {
    const existing = await prisma.lead.findFirst({ where:{ title: l.title } });
    if (existing) continue;
    await prisma.lead.create({ data:{ title:l.title, contactName:l.contactName, stage:l.stage as any, area:l.area as any, valueBrl: l.valueBrl ?? undefined }});
  }

  // Chamados TI
  const fernanda = users['fernanda.prado@mota.adv.br'];
  const carlosF = users['carlos.fontanive@mota.adv.br'];
  const luis = users['luis.nascimento@mota.adv.br'];
  const ana = users['ana.mota@mota.adv.br'];
  const bruno = users['bruno.alvim@mota.adv.br'];

  const ticketDefs = [
    { subject:'Impressora do 3º andar fora do ar', category:'IMPRESSORA', priority:'ALTA', status:'EM_ANDAMENTO', requesterId: fernanda,
      description:'Já tentei religar a impressora HP do corredor 3 duas vezes, ela mostra "erro E0" e não sai da tela. Preciso imprimir contrato para audiência às 16h. Alguém consegue subir?',
      comments: [
        { authorId: admin.id, body:'Oi Fernanda, já estou subindo pro 3º andar. O E0 costuma ser papel encravado no fusor — se conseguires imprimir do teu notebook direto no PDF por email, resolve a audiência das 16h.' },
        { authorId: fernanda, body:'Perfeito, muito obrigada! Vou imprimir pelo PDF por e-mail enquanto isso.' },
        { authorId: admin.id, body:'Impressora normalizada. Era papel amassado no fusor mesmo. Fecho o chamado após tuas próximas duas impressões, tudo bem?' }
      ]
    },
    { subject:'Não consigo acessar SAJ 5', category:'SOFTWARE_JURIDICO', priority:'MEDIA', status:'ABERTO', requesterId: carlosF, description:'O sistema SAJ 5 devolve erro de token na hora do login. Já limpei cache e cookies.', comments: [] },
    { subject:'VPN caindo intermitente', category:'REDE', priority:'MEDIA', status:'AGUARDANDO_USUARIO', requesterId: luis, description:'A VPN cai a cada 30 min quando estou trabalhando remoto.', comments: [] },
    { subject:'Redefinir senha do e-mail', category:'ACESSO', priority:'BAIXA', status:'RESOLVIDO', requesterId: ana, description:'Preciso redefinir a senha do e-mail corporativo.', comments: [] },
    { subject:'Notebook não liga', category:'HARDWARE', priority:'ALTA', status:'EM_ANDAMENTO', requesterId: bruno, description:'Notebook Dell não liga desde ontem à noite.', comments: [] }
  ] as const;

  // Reset e recria pra ficar consistente
  const existingCount = await prisma.ticket.count();
  if (existingCount === 0) {
    let n = 143;
    for (const t of ticketDefs) {
      n++;
      const created = await prisma.ticket.create({ data:{
        protocol: 'MOTA-' + String(n).padStart(4,'0'),
        subject: t.subject, description: t.description,
        category: t.category as any, priority: t.priority as any, status: t.status as any,
        requesterId: t.requesterId, assigneeId: admin.id
      }});
      for (const c of t.comments) {
        await prisma.ticketComment.create({ data:{ ticketId: created.id, authorId: c.authorId, body: c.body }});
      }
    }
  }

  // Comunicados
  const anncDefs = [
    { title:'Reunião geral · 12/09 às 10h', tag:'GERAL', body:'Todos os sócios e associados no auditório do 5º andar. Pauta: metas do 4º trimestre, resultados YTD e apresentação do novo sistema interno de gestão. Café e reforço às 9h45.' },
    { title:'Recesso interno · 17/09 a 20/09', tag:'ADMIN', body:'O escritório ficará fechado para reforma da recepção. Apenas plantão de prazos urgentes será mantido, via Meet, pela equipe de sobreaviso.' },
    { title:'Nova área: Consultivo LGPD', tag:'NOVA_AREA', body:'A partir desta semana começamos a atender demandas de adequação à LGPD e DPO externo para pequenas e médias empresas. Coordenação da Dra. Ana Mota.' },
    { title:'🎉 Aniversariantes de setembro', tag:'CELEBRACAO', body:'Fernanda Zaffari Prado (11/09), João Ricardo Souza (14/09) e Bruno Alvim (28/09). Confraternização coletiva no dia 30, sexta à tarde, no lounge.' }
  ] as const;
  const existingAnnc = await prisma.announcement.count();
  if (existingAnnc === 0) {
    for (const a of anncDefs) {
      await prisma.announcement.create({ data:{ ...a, authorId: ana }});
    }
  }

  console.log('✔ Seed concluído');
}

main().then(()=>prisma.$disconnect()).catch(async(e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });
