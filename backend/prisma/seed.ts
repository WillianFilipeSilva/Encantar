import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar administrador padrão
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

  // Criar itens de exemplo
  const itens = await Promise.all([
    prisma.item.upsert({
      where: { id: 'item-1' },
      update: {},
      create: {
        id: 'item-1',
        nome: 'Arroz',
        descricao: 'Arroz branco tipo 1',
        unidade: 'kg',
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
        unidade: 'kg',
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
        unidade: 'litro',
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
        unidade: 'kg',
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
        unidade: 'pacote',
        criadoPorId: admin.id,
      },
    }),
  ])

  console.log('📦 Itens criados:', itens.length)

  // Criar beneficiários de exemplo
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
  ])

  console.log('👥 Beneficiários criados:', beneficiarios.length)

  // Criar rotas de exemplo
  const rotas = await Promise.all([
    prisma.rota.upsert({
      where: { id: 'rota-1' },
      update: {},
      create: {
        id: 'rota-1',
        nome: 'Rota Centro',
        descricao: 'Entregas no centro da cidade',
        dataEntrega: new Date('2025-09-25'),
        observacoes: 'Entregar pela manhã',
        criadoPorId: admin.id,
      },
    }),
    prisma.rota.upsert({
      where: { id: 'rota-2' },
      update: {},
      create: {
        id: 'rota-2',
        nome: 'Rota Jardim',
        descricao: 'Entregas no bairro Jardim',
        dataEntrega: new Date('2025-09-26'),
        observacoes: 'Entregar à tarde',
        criadoPorId: admin.id,
      },
    }),
  ])

  console.log('🗺️ Rotas criadas:', rotas.length)

  // Criar entregas de exemplo
  const entregas = await Promise.all([
    prisma.entrega.upsert({
      where: { id: 'ent-1' },
      update: {},
      create: {
        id: 'ent-1',
        beneficiarioId: beneficiarios[0].id,
        rotaId: rotas[0].id,
        observacoes: 'Entrega prioritária',
        criadoPorId: admin.id,
      },
    }),
    prisma.entrega.upsert({
      where: { id: 'ent-2' },
      update: {},
      create: {
        id: 'ent-2',
        beneficiarioId: beneficiarios[1].id,
        rotaId: rotas[0].id,
        observacoes: 'Cuidado com escadas',
        criadoPorId: admin.id,
      },
    }),
    prisma.entrega.upsert({
      where: { id: 'ent-3' },
      update: {},
      create: {
        id: 'ent-3',
        beneficiarioId: beneficiarios[2].id,
        rotaId: rotas[1].id,
        observacoes: 'Entregar após 14h',
        criadoPorId: admin.id,
      },
    }),
  ])

  console.log('📋 Entregas criadas:', entregas.length)

  // Criar itens das entregas
  const entregaItems = await Promise.all([
    // Entrega 1
    prisma.entregaItem.upsert({
      where: { id: 'ei-1' },
      update: {},
      create: {
        id: 'ei-1',
        entregaId: entregas[0].id,
        itemId: itens[0].id, // Arroz
        quantidade: 5,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-2' },
      update: {},
      create: {
        id: 'ei-2',
        entregaId: entregas[0].id,
        itemId: itens[1].id, // Feijão
        quantidade: 2,
      },
    }),
    // Entrega 2
    prisma.entregaItem.upsert({
      where: { id: 'ei-3' },
      update: {},
      create: {
        id: 'ei-3',
        entregaId: entregas[1].id,
        itemId: itens[2].id, // Óleo
        quantidade: 1,
      },
    }),
    prisma.entregaItem.upsert({
      where: { id: 'ei-4' },
      update: {},
      create: {
        id: 'ei-4',
        entregaId: entregas[1].id,
        itemId: itens[3].id, // Açúcar
        quantidade: 1,
      },
    }),
    // Entrega 3
    prisma.entregaItem.upsert({
      where: { id: 'ei-5' },
      update: {},
      create: {
        id: 'ei-5',
        entregaId: entregas[2].id,
        itemId: itens[4].id, // Macarrão
        quantidade: 3,
      },
    }),
  ])

  console.log('📦 Itens de entrega criados:', entregaItems.length)

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