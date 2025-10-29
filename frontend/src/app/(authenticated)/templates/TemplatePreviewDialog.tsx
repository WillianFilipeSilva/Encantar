'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { TemplatePDF } from '@/lib/types'
import { SanitizeUtil } from '@/lib/sanitizeUtil'

interface TemplatePreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  template: TemplatePDF | null
}

export function TemplatePreviewDialog({ isOpen, onClose, template }: TemplatePreviewDialogProps) {
  if (!template) return null

  const renderPreview = () => {
    const mockData = {
      nomeRota: "Rota Centro - Exemplo",
      dataAtendimento: "15/10/2025",
      beneficiarios: [
        { nome: "João Silva", endereco: "Rua A, 123" },
        { nome: "Maria Santos", endereco: "Rua B, 456" }
      ],
      itens: [
        { nome: "Arroz", quantidade: 5 },
        { nome: "Feijão", quantidade: 3 }
      ]
    }

    let htmlContent = template.conteudo
    
    htmlContent = htmlContent.replace(/\{\{nomeRota\}\}/g, mockData.nomeRota)
    htmlContent = htmlContent.replace(/\{\{dataAtendimento\}\}/g, mockData.dataAtendimento)
    htmlContent = htmlContent.replace(/\{\{dataAtendimento\}\}/g, mockData.dataAtendimento)
    
    return SanitizeUtil.sanitizeTemplate(htmlContent)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Preview: {template.nome}</DialogTitle>
            <Badge variant={template.ativo ? 'default' : 'secondary'}>
              {template.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <DialogDescription>
            {template.descricao || 'Sem descrição'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Código HTML:</h3>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-48">
              <code>{template.conteudo}</code>
            </pre>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Preview (com dados de exemplo):</h3>
            <div 
              className="border rounded bg-white p-4 min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Este é um preview com dados fictícios. O template final será renderizado com dados reais.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
