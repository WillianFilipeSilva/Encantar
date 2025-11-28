import puppeteer, { Browser, Page } from 'puppeteer';
import Handlebars from 'handlebars';
import { TemplatePDF, Rota, Beneficiario, Atendimento } from '@prisma/client';
import { formatBrazilDateTime } from './dateUtils';
import { SanitizeService } from './sanitizeService';

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
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--disable-crash-reporter',
          '--disable-breakpad',
          '--disable-component-update',
          '--disable-domain-reliability',
          '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process',
          '--single-process'
        ]
      });
    }
    return this.browser;
  }

  static async generateRotaPDF(data: PDFGenerationData): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Sanitizar o conteúdo do template antes de usar
      const sanitizedContent = SanitizeService.sanitizeTemplate(data.template.conteudo);
      
      const template = Handlebars.compile(sanitizedContent);
      const templateData = this.prepareTemplateData(data.rota);
      const html = template(templateData);
      
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

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
      dataAtendimento: rota.dataAtendimento ? new Date(rota.dataAtendimento).toLocaleDateString('pt-BR') : 'Não definida',
      criadoEm: formatBrazilDateTime(rota.criadoEm),
      
      // Estatísticas
      totalBeneficiarios: rota.atendimentos?.length || 0,
      totalItens: rota.atendimentos?.reduce((total: number, atendimento: any) => 
        total + (atendimento.atendimentoItems?.reduce((sum: number, item: any) => sum + item.quantidade, 0) || 0), 0
      ) || 0,
      
      // Data de geração
      dataGeracao: formatBrazilDateTime(new Date()),
      
      // Lista de beneficiários com suas atendimentos
      beneficiarios: rota.atendimentos?.map((atendimento: any) => ({
        id: atendimento.beneficiario.id,
        nome: atendimento.beneficiario.nome,
        endereco: atendimento.beneficiario.endereco,
        telefone: atendimento.beneficiario.telefone || '',
        cpf: atendimento.beneficiario.cpf || '',
        observacoes: atendimento.observacoes || '',
        status: atendimento.status,
        
        // Itens para este beneficiário
        itens: atendimento.atendimentoItems?.map((atendimentoItem: any) => ({
          nome: atendimentoItem.item.nome,
          quantidade: atendimentoItem.quantidade,
          unidade: atendimentoItem.item.unidade
        })) || [],
        
        // Total de itens para este beneficiário
        totalItens: atendimento.atendimentoItems?.reduce((sum: number, item: any) => sum + item.quantidade, 0) || 0
      })) || [],
      
      // Resumo de itens (agrupado)
      resumoItens: this.getResumoItens(rota.atendimentos || [])
    };
  }

  private static getResumoItens(atendimentos: any[]) {
    const resumo = new Map<string, { nome: string; quantidade: number; unidade: string }>();
    
    atendimentos.forEach((atendimento: any) => {
      atendimento.atendimentoItems?.forEach((atendimentoItem: any) => {
        const key = atendimentoItem.item.nome;
        if (resumo.has(key)) {
          resumo.get(key)!.quantidade += atendimentoItem.quantidade;
        } else {
          resumo.set(key, {
            nome: atendimentoItem.item.nome,
            quantidade: atendimentoItem.quantidade,
            unidade: atendimentoItem.item.unidade
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