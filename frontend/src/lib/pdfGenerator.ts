import { jsPDF } from 'jspdf';

export interface PDFBeneficiario {
  ordem: number;
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  cpf: string;
  observacoes: string;
  status: string;
  itens: Array<{
    nome: string;
    quantidade: number;
    unidade: string;
  }>;
  totalItens: number;
}

export interface PDFData {
  nomeRota: string;
  descricaoRota: string;
  dataAtendimento: string;
  totalBeneficiarios: number;
  totalItens: number;
  dataGeracao: string;
  beneficiarios: PDFBeneficiario[];
  resumoItens: Array<{
    nome: string;
    quantidade: number;
    unidade: string;
  }>;
}

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 15;
  private currentY: number = 15;
  private lineHeight: number = 6;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private checkPageBreak(neededSpace: number = 30): void {
    if (this.currentY + neededSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private setFont(style: 'normal' | 'bold' = 'normal', size: number = 10): void {
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', style);
  }

  private drawText(text: string, x: number, y: number, maxWidth?: number): void {
    if (maxWidth) {
      const lines = this.doc.splitTextToSize(text, maxWidth);
      this.doc.text(lines, x, y);
    } else {
      this.doc.text(text, x, y);
    }
  }

  private drawLine(y: number): void {
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, y, this.pageWidth - this.margin, y);
  }

  public generate(data: PDFData): void {
    // Cabeçalho da rota
    this.drawHeader(data);
    
    // Lista de beneficiários/atendimentos
    data.beneficiarios.forEach((beneficiario, index) => {
      this.drawAtendimento(beneficiario, index + 1);
    });

    // Resumo de itens no final
    this.drawResumo(data.resumoItens);
  }

  private drawHeader(data: PDFData): void {
    // Título
    this.setFont('bold', 16);
    this.doc.setTextColor(44, 62, 80);
    this.drawText(data.nomeRota, this.margin, this.currentY);
    this.currentY += 8;

    // Informações da rota
    this.setFont('normal', 10);
    this.doc.setTextColor(100, 100, 100);
    
    const infoY = this.currentY;
    this.drawText(`Data do Atendimento: ${data.dataAtendimento}`, this.margin, infoY);
    this.drawText(`Total de Beneficiários: ${data.totalBeneficiarios}`, this.margin + 70, infoY);
    this.drawText(`Total de Itens: ${data.totalItens}`, this.margin + 130, infoY);
    
    this.currentY += 8;

    if (data.descricaoRota) {
      this.setFont('normal', 9);
      this.drawText(data.descricaoRota, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
      this.currentY += 6;
    }

    this.drawLine(this.currentY);
    this.currentY += 8;
  }

  private drawAtendimento(beneficiario: PDFBeneficiario, numero: number): void {
    // Verifica se precisa de nova página (estima altura do card)
    const estimatedHeight = 50 + (beneficiario.itens.length * 6);
    this.checkPageBreak(estimatedHeight);

    // Cabeçalho do atendimento
    this.doc.setFillColor(52, 73, 94);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 'F');
    
    this.setFont('bold', 11);
    this.doc.setTextColor(255, 255, 255);
    this.drawText(`ATENDIMENTO ${numero}`, this.margin + 3, this.currentY + 5.5);
    
    // Checkbox
    this.doc.setDrawColor(255, 255, 255);
    this.doc.rect(this.pageWidth - this.margin - 8, this.currentY + 1.5, 5, 5);
    
    this.currentY += 12;

    // Nome do beneficiário
    this.setFont('bold', 12);
    this.doc.setTextColor(44, 62, 80);
    this.drawText(beneficiario.nome, this.margin, this.currentY);
    this.currentY += 7;

    // Dados do beneficiário
    this.setFont('normal', 9);
    this.doc.setTextColor(80, 80, 80);

    // Endereço
    this.drawText(`Endereço: ${beneficiario.endereco}`, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    this.currentY += 5;

    // CPF e Telefone na mesma linha
    const dadosLinha = [];
    if (beneficiario.cpf) dadosLinha.push(`CPF: ${beneficiario.cpf}`);
    if (beneficiario.telefone) dadosLinha.push(`Telefone: ${beneficiario.telefone}`);
    if (dadosLinha.length > 0) {
      this.drawText(dadosLinha.join('    |    '), this.margin, this.currentY);
      this.currentY += 5;
    }

    // Observações
    if (beneficiario.observacoes) {
      this.currentY += 2;
      this.doc.setFillColor(255, 243, 205);
      const obsHeight = Math.ceil(beneficiario.observacoes.length / 80) * 5 + 6;
      this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, obsHeight, 'F');
      
      this.setFont('bold', 8);
      this.doc.setTextColor(133, 100, 4);
      this.drawText('OBSERVAÇÕES:', this.margin + 2, this.currentY);
      this.currentY += 4;
      
      this.setFont('normal', 8);
      this.drawText(beneficiario.observacoes, this.margin + 2, this.currentY, this.pageWidth - 2 * this.margin - 4);
      this.currentY += Math.ceil(beneficiario.observacoes.length / 80) * 4 + 2;
    }

    // Itens
    if (beneficiario.itens.length > 0) {
      this.currentY += 3;
      this.setFont('bold', 9);
      this.doc.setTextColor(52, 73, 94);
      this.drawText('ITENS PARA ENTREGA:', this.margin, this.currentY);
      this.currentY += 5;

      beneficiario.itens.forEach((item) => {
        this.checkPageBreak(8);
        
        // Fundo do item
        this.doc.setFillColor(248, 249, 250);
        this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 7, 'F');
        
        // Borda esquerda azul
        this.doc.setFillColor(52, 152, 219);
        this.doc.rect(this.margin, this.currentY - 3, 1.5, 7, 'F');
        
        this.setFont('normal', 9);
        this.doc.setTextColor(44, 62, 80);
        this.drawText(`${item.nome} (${item.unidade})`, this.margin + 4, this.currentY);
        
        this.setFont('bold', 11);
        this.doc.setTextColor(41, 128, 185);
        this.drawText(String(item.quantidade), this.pageWidth - this.margin - 15, this.currentY);
        
        this.currentY += 8;
      });
    }

    // Linha separadora
    this.currentY += 3;
    this.drawLine(this.currentY);
    this.currentY += 8;
  }

  private drawResumo(resumoItens: PDFData['resumoItens']): void {
    if (resumoItens.length === 0) return;

    this.checkPageBreak(40 + resumoItens.length * 6);

    // Título do resumo
    this.setFont('bold', 12);
    this.doc.setTextColor(44, 62, 80);
    this.drawText('RESUMO TOTAL DE ITENS', this.margin, this.currentY);
    this.currentY += 8;

    // Tabela de resumo
    resumoItens.forEach((item) => {
      this.doc.setFillColor(236, 240, 241);
      this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 7, 'F');
      
      this.setFont('normal', 9);
      this.doc.setTextColor(44, 62, 80);
      this.drawText(`${item.nome} (${item.unidade})`, this.margin + 3, this.currentY);
      
      this.setFont('bold', 10);
      this.drawText(String(item.quantidade), this.pageWidth - this.margin - 15, this.currentY);
      
      this.currentY += 8;
    });
  }

  public download(filename: string): void {
    this.doc.save(filename);
  }

  public getBlob(): Blob {
    return this.doc.output('blob');
  }
}

export function generateRotaPDF(data: PDFData, filename: string): void {
  const generator = new PDFGenerator();
  generator.generate(data);
  generator.download(filename);
}
