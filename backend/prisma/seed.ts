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
        .atendimento-card { border: 1px solid #e1e8ed; margin-bottom: 20px; background: #fff; page-break-inside: avoid; }
        .atendimento-numero { background: #34495e; color: #fff; padding: 10px 15px; font-size: 13px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
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
        @media print { body { margin: 15px; } .atendimento-card { page-break-inside: avoid; margin-bottom: 15px; } }
    </style>
</head>
<body>
    <div class="info-rota">
        <div class="nome-rota">{{nomeRota}}</div>
        <div class="detalhes-rota">
            <div class="detalhe-item"><div class="detalhe-label">Data da Atendimento</div><div class="detalhe-valor">{{dataAtendimento}}</div></div>
            <div class="detalhe-item"><div class="detalhe-label">Total de Beneficiários</div><div class="detalhe-valor">{{totalBeneficiarios}}</div></div>
            <div class="detalhe-item"><div class="detalhe-label">Total de Itens</div><div class="detalhe-valor">{{totalItens}}</div></div>
        </div>
    </div>
    {{#each beneficiarios}}
    <div class="atendimento-card">
        <div class="atendimento-numero"><span>ATENDIMENTO {{@index_1}}</span><div class="checkbox"></div></div>
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
                <div class="titulo-itens">Itens para Atendimento</div>
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

  const senhaHash = await bcrypt.hash('admin', 10)
  const admin = await prisma.administrador.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      nome: '',
      login: 'admin',
      senha: senhaHash,
      ativo: true,
    },
  })

  console.log('👤 Administrador criado:', admin.login)

  const templateClean = await prisma.templatePDF.upsert({
    where: { id: 'template-clean' },
    update: {},
    create: {
      id: 'template-clean',
      nome: 'Clean',
      descricao: 'Template limo com foco na organização das informações',
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