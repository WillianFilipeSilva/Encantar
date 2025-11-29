import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Template Simples - Lista vertical compacta e elegante
const TEMPLATE_SIMPLES = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>{{nomeRota}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; font-size: 10px; line-height: 1.4; margin: 12px 16px; color: #000; }
        
        .cabecalho { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 15px; padding-bottom: 6px; border-bottom: 1px solid #000; }
        .titulo-rota { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; }
        .info-header { font-size: 9px; display: flex; gap: 12px; }
        
        .entregas-lista { }
        
        .entrega { 
            padding: 10px 0; 
            break-inside: avoid; 
            page-break-inside: avoid;
            border-bottom: 1px dotted #aaa;
        }
        .entrega:last-child { border-bottom: none; }
        
        .linha-principal { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 4px;
        }
        .info-beneficiario { flex: 1; }
        .nome { font-size: 11px; font-weight: bold; letter-spacing: 0.3px; }
        .telefone { font-size: 9px; color: #444; margin-left: 10px; }
        .checkbox { width: 10px; height: 10px; border: 1px solid #000; margin-left: 8px; flex-shrink: 0; }
        
        .endereco { font-size: 9px; color: #333; margin-bottom: 3px; }
        
        .observacoes { 
            font-size: 9px; 
            font-style: italic; 
            color: #444; 
            margin: 4px 0;
            padding-left: 8px;
            border-left: 1.5px solid #999;
            word-wrap: break-word;
            white-space: pre-wrap;
            line-height: 1.3;
        }
        
        .itens { 
            margin: 6px 0 4px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 3px 12px;
        }
        .item { 
            font-size: 9px;
            display: inline-flex;
            align-items: center;
            gap: 3px;
        }
        .item-qtd { font-weight: bold; }
        
        .anotacoes { margin-top: 6px; }
        .anotacoes-label { font-size: 7px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .linha { height: 14px; border-bottom: 1px dotted #bbb; }
        
        @media print {
            body { margin: 8mm 10mm; }
            .entrega { break-inside: avoid; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="cabecalho">
        <span class="titulo-rota">{{nomeRota}}</span>
        <div class="info-header">
            <span>{{dataAtendimento}}</span>
            <span>{{totalBeneficiarios}} atend.</span>
            <span>{{totalItens}} itens</span>
        </div>
    </div>
    
    <div class="entregas-lista">
        {{#each beneficiarios}}
        <div class="entrega">
            <div class="linha-principal">
                <div class="info-beneficiario">
                    <span class="nome">{{nome}}</span>{{#if telefone}}<span class="telefone">{{telefone}}</span>{{/if}}
                </div>
                <div class="checkbox"></div>
            </div>
            <div class="endereco">{{endereco}}</div>
            {{#if observacoes}}<div class="observacoes">{{observacoes}}</div>{{/if}}
            {{#if itens}}
            <div class="itens">
                {{#each itens}}
                <span class="item"><span class="item-qtd">{{quantidade}}</span> {{nome}}</span>
                {{/each}}
            </div>
            {{/if}}
            <div class="anotacoes">
                <div class="anotacoes-label">Obs:</div>
                <div class="linha"></div>
            </div>
        </div>
        {{/each}}
    </div>
</body>
</html>`;

// Template Clean - Lista vertical minimalista
const TEMPLATE_CLEAN = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>{{nomeRota}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 11px; line-height: 1.4; margin: 15px 20px; color: #000; }
        
        .cabecalho { display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 18px; padding-bottom: 10px; font-size: 9px; }
        .titulo-rota { font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        
        .entregas-lista { margin-top: 10px; }
        
        .entrega { 
            padding: 12px 0; 
            margin-bottom: 8px; 
            break-inside: avoid; 
            page-break-inside: avoid;
            border-bottom: 1px dotted #999;
        }
        
        .entrega-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 6px;
        }
        .nome-telefone { display: flex; align-items: center; gap: 10px; }
        .beneficiario-nome { font-size: 12px; font-weight: bold; }
        .telefone-header { font-size: 10px; color: #333; }
        .checkbox { width: 11px; height: 11px; border: 1px solid #000; }
        
        .info-linha { margin-bottom: 3px; font-size: 10px; }
        
        .observacao-beneficiario { 
            margin: 3px 0; 
            padding-left: 8px; 
            font-size: 10px;
            font-style: italic;
            color: #333;
            word-wrap: break-word;
            white-space: pre-wrap;
            line-height: 1.3;
        }
        .obs-titulo { font-weight: bold; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1px; font-style: normal; }
        
        .itens-section { 
            margin: 10px 0; 
            padding-left: 5px;
        }
        .itens-titulo { font-weight: bold; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        
        .item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 2px 0;
            font-size: 10px;
        }
        .item-nome { }
        .item-qtd { font-weight: bold; text-align: right; min-width: 50px; }
        
        .campo-anotacoes { 
            margin-top: 10px;
        }
        .campo-anotacoes-label { 
            font-size: 8px; 
            color: #666; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .linha-anotacao { 
            height: 18px; 
            border-bottom: 1px dotted #999;
        }
        
        @media print {
            body { margin: 10mm 12mm; }
            .entrega { break-inside: avoid; page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="cabecalho">
        <span class="titulo-rota">{{nomeRota}}</span>
        <span>{{dataAtendimento}}</span>
        <span>{{totalBeneficiarios}} Atendimentos</span>
        <span>{{totalItens}} Itens</span>
    </div>
    
    <div class="entregas-lista">
        {{#each beneficiarios}}
        <div class="entrega">
            <div class="entrega-header">
                <div class="nome-telefone">
                    <span class="beneficiario-nome">{{nome}}</span>
                    {{#if telefone}}<span class="telefone-header">{{telefone}}</span>{{/if}}
                </div>
                <div class="checkbox"></div>
            </div>
            <div class="info-linha">{{endereco}}</div>
            
            {{#if observacoes}}
            <div class="observacao-beneficiario">
                <div class="obs-titulo">Observações</div>
                {{observacoes}}
            </div>
            {{/if}}
            
            {{#if itens}}
            <div class="itens-section">
                <div class="itens-titulo">Itens</div>
                {{#each itens}}
                <div class="item">
                    <span class="item-nome">• {{nome}}</span>
                    <span class="item-qtd">{{quantidade}} {{unidade}}</span>
                </div>
                {{/each}}
            </div>
            {{/if}}
            
            <div class="campo-anotacoes">
                <div class="campo-anotacoes-label">Anotações</div>
                <div class="linha-anotacao"></div>
                <div class="linha-anotacao"></div>
            </div>
        </div>
        {{/each}}
    </div>
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

  // Template Simples - Grid compacto 2 colunas
  const templateSimples = await prisma.templatePDF.upsert({
    where: { id: 'template-simples' },
    update: {
      conteudo: TEMPLATE_SIMPLES,
    },
    create: {
      id: 'template-simples',
      nome: 'Simples',
      descricao: 'Layout em grid de 2 colunas - mais entregas por página',
      conteudo: TEMPLATE_SIMPLES,
      ativo: true
    }
  })

  console.log('📄 Template Simples criado:', templateSimples.nome)

  // Template Clean - Lista vertical limpa
  const templateClean = await prisma.templatePDF.upsert({
    where: { id: 'template-clean' },
    update: {
      conteudo: TEMPLATE_CLEAN,
    },
    create: {
      id: 'template-clean',
      nome: 'Clean',
      descricao: 'Layout em lista vertical - maior legibilidade',
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