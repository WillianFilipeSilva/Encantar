import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TEMPLATE_CLEAN = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>{{nomeRota}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.4; margin: 20px; color: #2c3e50; background: #fff; }
        .info-rota { background: #f8f9fa; padding: 15px; margin-bottom: 25px; border-left: 4px solid #3498db; }
        .nome-rota { font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 8px; }
        .detalhes-rota { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; font-size: 11px; color: #5a6c7d; }
        .detalhe-item { display: flex; flex-direction: column; }
        .detalhe-label { font-weight: 600; color: #34495e; margin-bottom: 2px; }
        .detalhe-valor { font-size: 13px; color: #2c3e50; }
        .entrega-card { border: 1px solid #e1e8ed; margin-bottom: 20px; background: #fff; page-break-inside: avoid; }
        .entrega-numero { background: #34495e; color: #fff; padding: 10px 15px; font-size: 13px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
        .checkbox { width: 16px; height: 16px; border: 2px solid #fff; border-radius: 2px; }
        .beneficiario-dados { padding: 20px; }
        .nome-beneficiario { font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ecf0f1; }
        .dados-pessoais { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 15px; }
        .campo { margin-bottom: 8px; }
        .campo-label { font-size: 10px; text-transform: uppercase; color: #7f8c8d; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 3px; }
        .campo-valor { font-size: 12px; color: #2c3e50; font-weight: 400; }
        .observacoes { background: #fff3cd; border-left: 3px solid #ffc107; padding: 10px; margin-bottom: 15px; }
        .observacoes-label { font-size: 10px; text-transform: uppercase; color: #856404; font-weight: 600; margin-bottom: 4px; }
        .observacoes-texto { font-size: 11px; color: #856404; line-height: 1.3; }
        .secao-itens { border-top: 1px solid #ecf0f1; padding-top: 15px; }
        .titulo-itens { font-size: 12px; font-weight: 600; color: #34495e; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .lista-itens { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
        .item { background: #f8f9fa; padding: 8px 12px; border-left: 3px solid #3498db; display: flex; justify-content: space-between; align-items: center; }
        .item-info { flex: 1; }
        .item-nome { font-size: 11px; color: #2c3e50; font-weight: 500; }
        .item-detalhes { font-size: 10px; color: #7f8c8d; margin-top: 1px; }
        .item-quantidade { font-size: 14px; font-weight: 700; color: #2980b9; min-width: 40px; text-align: right; }
        .rodape { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e1e8ed; text-align: center; font-size: 10px; color: #95a5a6; }
        @media print { body { margin: 15px; } .entrega-card { page-break-inside: avoid; margin-bottom: 15px; } }
    </style>
</head>
<body>
    <div class="info-rota">
        <div class="nome-rota">{{nomeRota}}</div>
        <div class="detalhes-rota">
            <div class="detalhe-item"><div class="detalhe-label">Data da Entrega</div><div class="detalhe-valor">{{dataEntrega}}</div></div>
            <div class="detalhe-item"><div class="detalhe-label">Total de Beneficiários</div><div class="detalhe-valor">{{totalBeneficiarios}}</div></div>
            <div class="detalhe-item"><div class="detalhe-label">Total de Itens</div><div class="detalhe-valor">{{totalItens}}</div></div>
        </div>
    </div>
    {{#each beneficiarios}}
    <div class="entrega-card">
        <div class="entrega-numero"><span>ENTREGA {{@index_1}}</span><div class="checkbox"></div></div>
        <div class="beneficiario-dados">
            <div class="nome-beneficiario">{{nome}}</div>
            <div class="dados-pessoais">
                <div>
                    <div class="campo"><div class="campo-label">Endereço</div><div class="campo-valor">{{endereco}}</div></div>
                    {{#if email}}<div class="campo"><div class="campo-label">E-mail</div><div class="campo-valor">{{email}}</div></div>{{/if}}
                </div>
                <div>{{#if telefone}}<div class="campo"><div class="campo-label">Telefone</div><div class="campo-valor">{{telefone}}</div></div>{{/if}}</div>
            </div>
            {{#if observacoes}}<div class="observacoes"><div class="observacoes-label">Observações</div><div class="observacoes-texto">{{observacoes}}</div></div>{{/if}}
            {{#if itens}}
            <div class="secao-itens">
                <div class="titulo-itens">Itens para Entrega</div>
                <div class="lista-itens">
                    {{#each itens}}<div class="item"><div class="item-info"><div class="item-nome">{{nome}}</div><div class="item-detalhes">{{unidade}}</div></div><div class="item-quantidade">{{quantidade}}</div></div>{{/each}}
                </div>
            </div>
            {{/if}}
        </div>
    </div>
    {{/each}}
</body>
</html>`;

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  const senhaHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.administrador.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      nome: 'Administrador',
      login: 'admin',
      senha: senhaHash,
      ativo: true,
    },
  })

  console.log('👤 Administrador criado:', admin.login)

  // Criar 12 itens
  const itens = await Promise.all([
    prisma.item.upsert({
      where: { id: 'item-1' },
      update: {},
      create: {
        id: 'item-1',
        nome: 'Arroz',
        descricao: 'Arroz branco tipo 1',
        unidade: 'KG',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-2' },
      update: {},
      create: {
        id: 'item-2',
        nome: 'Feijão',
        descricao: 'Feijão carioca',
        unidade: 'KG',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-3' },
      update: {},
      create: {
        id: 'item-3',
        nome: 'Óleo',
        descricao: 'Óleo de soja',
        unidade: 'L',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-4' },
      update: {},
      create: {
        id: 'item-4',
        nome: 'Açúcar',
        descricao: 'Açúcar cristal',
        unidade: 'KG',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-5' },
      update: {},
      create: {
        id: 'item-5',
        nome: 'Macarrão',
        descricao: 'Macarrão espaguete',
        unidade: 'PCT',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-6' },
      update: {},
      create: {
        id: 'item-6',
        nome: 'Sal',
        descricao: 'Sal refinado',
        unidade: 'KG',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-7' },
      update: {},
      create: {
        id: 'item-7',
        nome: 'Farinha de Trigo',
        descricao: 'Farinha de trigo especial',
        unidade: 'KG',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-8' },
      update: {},
      create: {
        id: 'item-8',
        nome: 'Molho de Tomate',
        descricao: 'Molho de tomate tradicional',
        unidade: 'LATA',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-9' },
      update: {},
      create: {
        id: 'item-9',
        nome: 'Leite em Pó',
        descricao: 'Leite em pó integral',
        unidade: 'LATA',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-10' },
      update: {},
      create: {
        id: 'item-10',
        nome: 'Café',
        descricao: 'Café torrado e moído',
        unidade: 'PCT',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-11' },
      update: {},
      create: {
        id: 'item-11',
        nome: 'Biscoito',
        descricao: 'Biscoito cream cracker',
        unidade: 'PCT',
        criadoPorId: admin.id,
      },
    }),
    prisma.item.upsert({
      where: { id: 'item-12' },
      update: {},
      create: {
        id: 'item-12',
        nome: 'Sardinha',
        descricao: 'Sardinha em conserva',
        unidade: 'LATA',
        criadoPorId: admin.id,
      },
    }),
  ])

  console.log('📦 Itens criados:', itens.length)

  // Criar 8 beneficiários
  const beneficiarios = await Promise.all([
    prisma.beneficiario.upsert({
      where: { id: 'ben-1' },
      update: {},
      create: {
        id: 'ben-1',
        nome: 'Maria da Silva',
        endereco: 'Rua das Flores, 123 - Centro',
        telefone: '(11) 99999-1111',
        email: 'maria.silva@email.com',
        observacoes: 'Família com 3 crianças',
        criadoPorId: admin.id,
      },
    }),
    prisma.beneficiario.upsert({
      where: { id: 'ben-2' },
      update: {},
      create: {
        id: 'ben-2',
        nome: 'João Santos',
        endereco: 'Av. Principal, 456 - Jardim',
        telefone: '(11) 88888-2222',
        email: 'joao.santos@email.com',
        observacoes: 'Idoso, mora sozinho',
        criadoPorId: admin.id,
      },
    }),
    prisma.beneficiario.upsert({
      where: { id: 'ben-3' },
      update: {},
      create: {
        id: 'ben-3',
        nome: 'Ana Costa',
        endereco: 'Rua do Sol, 789 - Vila Nova',
        telefone: '(11) 77777-3333',
        email: 'ana.costa@email.com',
        observacoes: 'Mãe solteira com 2 filhos',
        criadoPorId: admin.id,
      },
    }),
    prisma.beneficiario.upsert({
      where: { id: 'ben-4' },
      update: {},
      create: {
        id: 'ben-4',
        nome: 'Carlos Oliveira',
        endereco: 'Rua Esperança, 321 - Bela Vista',
        telefone: '(11) 66666-4444',
        email: 'carlos.oliveira@email.com',
        observacoes: 'Pessoa com deficiência',
        criadoPorId: admin.id,
      },
    }),
    prisma.beneficiario.upsert({
      where: { id: 'ben-5' },
      update: {},
      create: {
        id: 'ben-5',
        nome: 'Lucia Pereira',
        endereco: 'Av. Brasil, 567 - Copacabana',
        telefone: '(21) 55555-5555',
        email: 'lucia.pereira@email.com',
        observacoes: 'Família numerosa - 5 filhos',
        criadoPorId: admin.id,
      },
    }),
    prisma.beneficiario.upsert({
      where: { id: 'ben-6' },
      update: {},
      create: {
        id: 'ben-6',
        nome: 'Roberto Lima',
        endereco: 'Rua da Paz, 890 - Ipanema',
        telefone: '(21) 44444-6666',
        email: 'roberto.lima@email.com',
        observacoes: 'Desempregado',
        criadoPorId: admin.id,
      },
    }),
    prisma.beneficiario.upsert({
      where: { id: 'ben-7' },
      update: {},
      create: {
        id: 'ben-7',
        nome: 'Fernanda Souza',
        endereco: 'Rua das Palmeiras, 432 - Botafogo',
        telefone: '(21) 33333-7777',
        email: 'fernanda.souza@email.com',
        observacoes: 'Gestante',
        criadoPorId: admin.id,
      },
    }),
    prisma.beneficiario.upsert({
      where: { id: 'ben-8' },
      update: {},
      create: {
        id: 'ben-8',
        nome: 'Pedro Almeida',
        endereco: 'Av. Atlântica, 654 - Leblon',
        telefone: '(21) 22222-8888',
        email: 'pedro.almeida@email.com',
        observacoes: 'Casal de idosos',
        criadoPorId: admin.id,
      },
    }),
  ])

  console.log('👥 Beneficiários criados:', beneficiarios.length)

  // Criar 1 rota para teste
  const rota = await prisma.rota.upsert({
    where: { id: 'rota-teste' },
    update: {},
    create: {
      id: 'rota-teste',
      nome: 'Rota de Teste - 7 Entregas',
      descricao: 'Rota completa para testar o template PDF com 7 entregas',
      dataEntrega: new Date('2025-10-05'),
      criadoPorId: admin.id,
    },
  })

  console.log('🗺️ Rota criada:', rota.nome)

  // Criar 7 entregas (uma para cada beneficiário, exceto o 8º)
  const entregas = await Promise.all([
    prisma.entrega.upsert({
      where: { id: 'ent-1' },
      update: {},
      create: {
        id: 'ent-1',
        beneficiarioId: beneficiarios[0].id, // Maria
        rotaId: rota.id,
        observacoes: 'Primeira entrega - família com crianças',
        criadoPorId: admin.id,
      },
    }),
    prisma.entrega.upsert({
      where: { id: 'ent-2' },
      update: {},
      create: {
        id: 'ent-2',
        beneficiarioId: beneficiarios[1].id, // João
        rotaId: rota.id,
        observacoes: 'Cuidado com escadas, idoso',
        criadoPorId: admin.id,
      },
    }),
    prisma.entrega.upsert({
      where: { id: 'ent-3' },
      update: {},
      create: {
        id: 'ent-3',
        beneficiarioId: beneficiarios[2].id, // Ana
        rotaId: rota.id,
        observacoes: 'Entregar após 14h',
        criadoPorId: admin.id,
      },
    }),
    prisma.entrega.upsert({
      where: { id: 'ent-4' },
      update: {},
      create: {
        id: 'ent-4',
        beneficiarioId: beneficiarios[3].id, // Carlos
        rotaId: rota.id,
        observacoes: 'Pessoa com deficiência, campainha especial',
        criadoPorId: admin.id,
      },
    }),
    prisma.entrega.upsert({
      where: { id: 'ent-5' },
      update: {},
      create: {
        id: 'ent-5',
        beneficiarioId: beneficiarios[4].id, // Lucia
        rotaId: rota.id,
        observacoes: 'Família grande, cesta reforçada',
        criadoPorId: admin.id,
      },
    }),
    prisma.entrega.upsert({
      where: { id: 'ent-6' },
      update: {},
      create: {
        id: 'ent-6',
        beneficiarioId: beneficiarios[5].id, // Roberto
        rotaId: rota.id,
        observacoes: 'Desempregado, prioridade',
        criadoPorId: admin.id,
      },
    }),
    prisma.entrega.upsert({
      where: { id: 'ent-7' },
      update: {},
      create: {
        id: 'ent-7',
        beneficiarioId: beneficiarios[6].id, // Fernanda
        rotaId: rota.id,
        observacoes: 'Gestante, incluir leite em pó',
        criadoPorId: admin.id,
      },
    }),
  ])

  console.log('🚚 Entregas criadas:', entregas.length)

  // Criar itens para cada entrega (4 itens diferentes por entrega)
  const entregaItems = await Promise.all([
    // Entrega 1 - Maria (Arroz, Feijão, Óleo, Açúcar)
    prisma.entregaItem.upsert({
      where: { id: 'ei-1-1' },
      update: {},
      create: {
        id: 'ei-1-1',
        entregaId: entregas[0].id,
        itemId: itens[0].id, // Arroz
        quantidade: 2,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-1-2' },
      update: {},
      create: {
        id: 'ei-1-2',
        entregaId: entregas[0].id,
        itemId: itens[1].id, // Feijão
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-1-3' },
      update: {},
      create: {
        id: 'ei-1-3',
        entregaId: entregas[0].id,
        itemId: itens[2].id, // Óleo
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-1-4' },
      update: {},
      create: {
        id: 'ei-1-4',
        entregaId: entregas[0].id,
        itemId: itens[3].id, // Açúcar
        quantidade: 1,
      },
    }),

    // Entrega 2 - João (Macarrão, Sal, Farinha, Molho)
    prisma.entregaItem.upsert({
      where: { id: 'ei-2-1' },
      update: {},
      create: {
        id: 'ei-2-1',
        entregaId: entregas[1].id,
        itemId: itens[4].id, // Macarrão
        quantidade: 2,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-2-2' },
      update: {},
      create: {
        id: 'ei-2-2',
        entregaId: entregas[1].id,
        itemId: itens[5].id, // Sal
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-2-3' },
      update: {},
      create: {
        id: 'ei-2-3',
        entregaId: entregas[1].id,
        itemId: itens[6].id, // Farinha
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-2-4' },
      update: {},
      create: {
        id: 'ei-2-4',
        entregaId: entregas[1].id,
        itemId: itens[7].id, // Molho
        quantidade: 2,
      },
    }),

    // Entrega 3 - Ana (Leite, Café, Biscoito, Sardinha)
    prisma.entregaItem.upsert({
      where: { id: 'ei-3-1' },
      update: {},
      create: {
        id: 'ei-3-1',
        entregaId: entregas[2].id,
        itemId: itens[8].id, // Leite
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-3-2' },
      update: {},
      create: {
        id: 'ei-3-2',
        entregaId: entregas[2].id,
        itemId: itens[9].id, // Café
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-3-3' },
      update: {},
      create: {
        id: 'ei-3-3',
        entregaId: entregas[2].id,
        itemId: itens[10].id, // Biscoito
        quantidade: 3,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-3-4' },
      update: {},
      create: {
        id: 'ei-3-4',
        entregaId: entregas[2].id,
        itemId: itens[11].id, // Sardinha
        quantidade: 2,
      },
    }),

    // Entrega 4 - Carlos (Arroz, Macarrão, Leite, Café)
    prisma.entregaItem.upsert({
      where: { id: 'ei-4-1' },
      update: {},
      create: {
        id: 'ei-4-1',
        entregaId: entregas[3].id,
        itemId: itens[0].id, // Arroz
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-4-2' },
      update: {},
      create: {
        id: 'ei-4-2',
        entregaId: entregas[3].id,
        itemId: itens[4].id, // Macarrão
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-4-3' },
      update: {},
      create: {
        id: 'ei-4-3',
        entregaId: entregas[3].id,
        itemId: itens[8].id, // Leite
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-4-4' },
      update: {},
      create: {
        id: 'ei-4-4',
        entregaId: entregas[3].id,
        itemId: itens[9].id, // Café
        quantidade: 1,
      },
    }),

    // Entrega 5 - Lucia (Feijão, Óleo, Sal, Biscoito)
    prisma.entregaItem.upsert({
      where: { id: 'ei-5-1' },
      update: {},
      create: {
        id: 'ei-5-1',
        entregaId: entregas[4].id,
        itemId: itens[1].id, // Feijão
        quantidade: 2,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-5-2' },
      update: {},
      create: {
        id: 'ei-5-2',
        entregaId: entregas[4].id,
        itemId: itens[2].id, // Óleo
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-5-3' },
      update: {},
      create: {
        id: 'ei-5-3',
        entregaId: entregas[4].id,
        itemId: itens[5].id, // Sal
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-5-4' },
      update: {},
      create: {
        id: 'ei-5-4',
        entregaId: entregas[4].id,
        itemId: itens[10].id, // Biscoito
        quantidade: 4,
      },
    }),

    // Entrega 6 - Roberto (Açúcar, Farinha, Molho, Sardinha)
    prisma.entregaItem.upsert({
      where: { id: 'ei-6-1' },
      update: {},
      create: {
        id: 'ei-6-1',
        entregaId: entregas[5].id,
        itemId: itens[3].id, // Açúcar
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-6-2' },
      update: {},
      create: {
        id: 'ei-6-2',
        entregaId: entregas[5].id,
        itemId: itens[6].id, // Farinha
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-6-3' },
      update: {},
      create: {
        id: 'ei-6-3',
        entregaId: entregas[5].id,
        itemId: itens[7].id, // Molho
        quantidade: 3,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-6-4' },
      update: {},
      create: {
        id: 'ei-6-4',
        entregaId: entregas[5].id,
        itemId: itens[11].id, // Sardinha
        quantidade: 2,
      },
    }),

    // Entrega 7 - Fernanda (Arroz, Feijão, Leite, Biscoito)
    prisma.entregaItem.upsert({
      where: { id: 'ei-7-1' },
      update: {},
      create: {
        id: 'ei-7-1',
        entregaId: entregas[6].id,
        itemId: itens[0].id, // Arroz
        quantidade: 2,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-7-2' },
      update: {},
      create: {
        id: 'ei-7-2',
        entregaId: entregas[6].id,
        itemId: itens[1].id, // Feijão
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-7-3' },
      update: {},
      create: {
        id: 'ei-7-3',
        entregaId: entregas[6].id,
        itemId: itens[8].id, // Leite
        quantidade: 2,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-7-4' },
      update: {},
      create: {
        id: 'ei-7-4',
        entregaId: entregas[6].id,
        itemId: itens[10].id, // Biscoito
        quantidade: 3,
      },
    }),
  ])

  console.log('📦 Itens de entrega criados:', entregaItems.length)

  const templateClean = await prisma.templatePDF.upsert({
    where: { id: 'template-clean' },
    update: {},
    create: {
      id: 'template-clean',
      nome: 'Clean',
      descricao: 'Template profissional e limpo, sem ícones, foco na organização das informações',
      conteudo: TEMPLATE_CLEAN,
      ativo: true
    }
  })

  console.log('📄 Template Clean criado:', templateClean.nome)

  console.log('✅ Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })