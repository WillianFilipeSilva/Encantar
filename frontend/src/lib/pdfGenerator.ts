import Handlebars from 'handlebars'
import { jsPDF } from 'jspdf'

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

/**
 * Injeta CSS para evitar quebra de página no meio de atendimentos
 */
function injectPageBreakCSS(doc: Document): void {
  const style = doc.createElement('style')
  style.textContent = `
    .entrega, .atendimento, .beneficiario-card, .card {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    @media print {
      .entrega, .atendimento, .beneficiario-card, .card {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `
  doc.head.appendChild(style)
}

/**
 * Gera PDF renderizando cada atendimento separadamente para evitar quebras no meio
 */
export async function generatePDF(data: PDFData, templateHtml: string, filename: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default

  const template = Handlebars.compile(templateHtml)
  const html = template(data)

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.left = '0'
  iframe.style.top = '0'
  iframe.style.width = '794px'
  iframe.style.height = '10000px'
  iframe.style.border = 'none'
  iframe.style.visibility = 'hidden'
  document.body.appendChild(iframe)

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve()
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(html)
      iframeDoc.close()
    }
    setTimeout(resolve, 100)
  })

  await new Promise(resolve => setTimeout(resolve, 300))

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc || !iframeDoc.body) {
      throw new Error('Não foi possível acessar o documento do iframe')
    }

    injectPageBreakCSS(iframeDoc)

    const atendimentoSelectors = '.entrega, .atendimento, .beneficiario-card, [data-atendimento]'
    const atendimentos = iframeDoc.querySelectorAll(atendimentoSelectors)

    if (atendimentos.length === 0) {
      await generatePDFFromBody(iframeDoc.body, html2canvas, filename)
    } else {
      await generatePDFWithSmartBreaks(iframeDoc, atendimentos, html2canvas, filename)
    }
  } finally {
    document.body.removeChild(iframe)
  }
}

/**
 * Gera PDF do body completo com paginação simples
 */
async function generatePDFFromBody(
  body: HTMLElement, 
  html2canvas: typeof import('html2canvas').default,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(body, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: 794,
    windowWidth: 794
  })

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 5
  const usableHeight = pageHeight - (margin * 2)
  
  const imgWidth = pageWidth - (margin * 2)
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  if (imgHeight <= usableHeight) {
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight)
  } else {
    const totalPages = Math.ceil(imgHeight / usableHeight)
    const sourceHeightPerPage = canvas.height / totalPages

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage()

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceHeightPerPage
      
      const ctx = pageCanvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        ctx.drawImage(
          canvas,
          0, page * sourceHeightPerPage,
          canvas.width, sourceHeightPerPage,
          0, 0,
          pageCanvas.width, pageCanvas.height
        )
        
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95)
        const pageImgHeight = (pageCanvas.height * imgWidth) / pageCanvas.width
        pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight)
      }
    }
  }

  pdf.save(filename)
}

/**
 * Gera PDF respeitando quebras de página entre atendimentos
 */
async function generatePDFWithSmartBreaks(
  doc: Document,
  atendimentos: NodeListOf<Element>,
  html2canvas: typeof import('html2canvas').default,
  filename: string
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 5
  const pixelsPerMm = 794 / 210

  let currentY = margin

  const firstAtendimento = atendimentos[0]
  const headerElements: Element[] = []
  let sibling = doc.body.firstElementChild
  
  while (sibling && sibling !== firstAtendimento && !sibling.contains(firstAtendimento)) {
    headerElements.push(sibling)
    sibling = sibling.nextElementSibling
  }

  if (headerElements.length > 0 || firstAtendimento.previousElementSibling) {
    const headerContainer = doc.createElement('div')
    headerContainer.style.width = '794px'
    headerContainer.style.backgroundColor = '#ffffff'
    
    const cabecalho = doc.querySelector('.cabecalho, .header, header')
    if (cabecalho) {
      headerContainer.appendChild(cabecalho.cloneNode(true))
      doc.body.appendChild(headerContainer)
      
      const headerCanvas = await html2canvas(headerContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794
      })
      
      const headerImgWidth = pageWidth - (margin * 2)
      const headerImgHeight = (headerCanvas.height / 2) / pixelsPerMm
      
      const headerImgData = headerCanvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(headerImgData, 'JPEG', margin, currentY, headerImgWidth, headerImgHeight)
      currentY += headerImgHeight + 2
      
      doc.body.removeChild(headerContainer)
    }
  }

  for (let i = 0; i < atendimentos.length; i++) {
    const atendimento = atendimentos[i] as HTMLElement
    
    const canvas = await html2canvas(atendimento, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794
    })

    const imgWidth = pageWidth - (margin * 2)
    const imgHeight = (canvas.height / 2) / pixelsPerMm

    if (currentY + imgHeight > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight)
    currentY += imgHeight + 1
  }

  pdf.save(filename)
}

/**
 * Retorna URL de preview do HTML compilado com os dados
 */
export async function previewPDF(data: PDFData, templateHtml: string): Promise<string> {
  const template = Handlebars.compile(templateHtml)
  const html = template(data)
  const blob = new Blob([html], { type: 'text/html' })
  return URL.createObjectURL(blob)
}
