import Handlebars from 'handlebars'

export interface PDFData {
  nomeRota: string
  descricaoRota: string
  dataAtendimento: string
  totalBeneficiarios: number
  totalItens: number
  dataGeracao: string
  beneficiarios: {
    ordem: number
    id: string
    nome: string
    endereco: string
    telefone: string
    cpf: string
    observacoes: string
    status: string
    itens: {
      nome: string
      quantidade: number
      unidade: string
    }[]
    totalItens: number
  }[]
  resumoItens: {
    nome: string
    quantidade: number
    unidade: string
  }[]
}

export async function generatePDF(data: PDFData, templateHtml: string, filename: string): Promise<void> {
  // Importa html2pdf dinamicamente (client-side only)
  const html2pdf = (await import('html2pdf.js')).default

  // Compila o template com Handlebars
  const template = Handlebars.compile(templateHtml)
  const html = template(data)

  // Cria um container temporário
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  try {
    // Configurações do PDF
    const options = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const
      }
    }

    // Gera e baixa o PDF
    await html2pdf().set(options).from(container).save()
  } finally {
    // Remove o container temporário
    document.body.removeChild(container)
  }
}

export async function previewPDF(data: PDFData, templateHtml: string): Promise<string> {
  // Importa html2pdf dinamicamente (client-side only)
  const html2pdf = (await import('html2pdf.js')).default

  // Compila o template com Handlebars
  const template = Handlebars.compile(templateHtml)
  const html = template(data)

  // Cria um container temporário
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  try {
    // Configurações do PDF
    const options = {
      margin: 0,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const
      }
    }

    // Gera o PDF como blob e retorna URL
    const blob = await html2pdf().set(options).from(container).outputPdf('blob')
    return URL.createObjectURL(blob)
  } finally {
    // Remove o container temporário
    document.body.removeChild(container)
  }
}
