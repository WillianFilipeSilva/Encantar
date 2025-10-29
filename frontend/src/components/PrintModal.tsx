'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Printer, FileText, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { templateService } from "@/lib/services/templateService"
import { rotaService } from "@/lib/services/rotaService"
import toast from 'react-hot-toast'
import { TemplatePDF } from "@/lib/types"

interface PrintModalProps {
  rotaId: string
  rotaNome: string
  isOpen: boolean
  onClose: () => void
}

export function PrintModal({ rotaId, rotaNome, isOpen, onClose }: PrintModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates-ativos'],
    queryFn: async () => {
      const response = await templateService.findActive()
      return response.data || []
    },
    enabled: isOpen,
    staleTime: 30000,
  })

  const handleGeneratePDF = async () => {
    if (!selectedTemplate) {
      toast.error("Selecione um template para gerar o PDF")
      return
    }

    setIsGenerating(true)
    try {
      toast.loading("Gerando PDF... Por favor, aguarde.")
      
      await rotaService.downloadPDF(rotaId, selectedTemplate, `${rotaNome.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`)
      
      toast.dismiss()
      toast.success("PDF gerado e baixado com sucesso!")
      onClose()
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.dismiss()
      toast.error("Erro ao gerar PDF. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Imprimir Rota: {rotaNome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Selecione o template:</h4>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando templates...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {templates && templates.length > 0 ? (
                  templates.map((template: TemplatePDF) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 mt-1 text-gray-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{template.nome}</div>
                          {template.descricao && (
                            <div className="text-xs text-gray-600 mt-1">{template.descricao}</div>
                          )}
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum template disponível</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={!selectedTemplate || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Gerar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}