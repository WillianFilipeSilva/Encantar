import puppeteer, { Browser, Page } from 'puppeteer';
import Handlebars from 'handlebars';
import { TemplatePDF, Rota, Beneficiario, Entrega } from '@prisma/client';
import { formatBrazilDateTime } from './dateUtils';

export interface PDFGenerationData {
  rota: any; // Tipo com todas as relações necessárias
  template: TemplatePDF;
}

export class PDFService {
  private static browser: Browser | null = null;

  private static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
    return this.browser;
  }

  static async generateRotaPDF(data: PDFGenerationData): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Compila o template Handlebars
      const template = Handlebars.compile(data.template.conteudo);
      
      // Prepara os dados para o template
      const templateData = this.prepareTemplateData(data.rota);
      
      // Gera o HTML final
      const html = template(templateData);
      
      // Configura a página
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Configura as opções do PDF
      const pdfOptions = {
        format: 'A4' as const,
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        displayHeaderFooter: false
      };

      // Gera o PDF
      const pdf = await page.pdf(pdfOptions);
      
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  private static prepareTemplateData(rota: any) {
    return {
      // Informações da rota
      nomeRota: rota.nome,
      descricaoRota: rota.descricao || '',
      dataEntrega: rota.dataEntrega ? new Date(rota.dataEntrega).toLocaleDateString('pt-BR') : 'Não definida',
      criadoEm: formatBrazilDateTime(rota.criadoEm),
      
      // Estatísticas
      totalBeneficiarios: rota.entregas?.length || 0,
      totalItens: rota.entregas?.reduce((total: number, entrega: any) => 
        total + (entrega.entregaItems?.reduce((sum: number, item: any) => sum + item.quantidade, 0) || 0), 0
      ) || 0,
      
      // Data de geração
      dataGeracao: formatBrazilDateTime(new Date()),
      
      // Lista de beneficiários com suas entregas
      beneficiarios: rota.entregas?.map((entrega: any) => ({
        id: entrega.beneficiario.id,
        nome: entrega.beneficiario.nome,
        endereco: entrega.beneficiario.endereco,
        telefone: entrega.beneficiario.telefone || '',
        email: entrega.beneficiario.email || '',
        observacoes: entrega.observacoes || '',
        status: entrega.status,
        
        // Itens para este beneficiário
        itens: entrega.entregaItems?.map((entregaItem: any) => ({
          nome: entregaItem.item.nome,
          quantidade: entregaItem.quantidade,
          unidade: entregaItem.item.unidade
        })) || [],
        
        // Total de itens para este beneficiário
        totalItens: entrega.entregaItems?.reduce((sum: number, item: any) => sum + item.quantidade, 0) || 0
      })) || [],
      
      // Resumo de itens (agrupado)
      resumoItens: this.getResumoItens(rota.entregas || [])
    };
  }

  private static getResumoItens(entregas: any[]) {
    const resumo = new Map<string, { nome: string; quantidade: number; unidade: string }>();
    
    entregas.forEach((entrega: any) => {
      entrega.entregaItems?.forEach((entregaItem: any) => {
        const key = entregaItem.item.nome;
        if (resumo.has(key)) {
          resumo.get(key)!.quantidade += entregaItem.quantidade;
        } else {
          resumo.set(key, {
            nome: entregaItem.item.nome,
            quantidade: entregaItem.quantidade,
            unidade: entregaItem.item.unidade
          });
        }
      });
    });
    
    return Array.from(resumo.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }

  static async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Helpers do Handlebars
Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});

Handlebars.registerHelper('gt', function(a: number, b: number) {
  return a > b;
});

Handlebars.registerHelper('add', function(a: number, b: number) {
  return a + b;
});

Handlebars.registerHelper('formatPhone', function(phone: string) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
});

Handlebars.registerHelper('capitalize', function(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
});

// Limpa o browser quando o processo termina
process.on('beforeExit', async () => {
  await PDFService.cleanup();
});

process.on('SIGINT', async () => {
  await PDFService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await PDFService.cleanup();
  process.exit(0);
});