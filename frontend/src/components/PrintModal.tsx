'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Loader2 } from "lucide-react"
import { rotaService } from "@/lib/services/rotaService"
import { templateService } from "@/lib/services/templateService"
import { TemplatePDF } from "@/lib/types"
import toast from 'react-hot-toast'

interface PrintModalProps {
  rotaId: string
  rotaNome: string
  isOpen: boolean
  onClose: () => void
}

export function PrintModal({ rotaId, rotaNome, isOpen, onClose }: PrintModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [templates, setTemplates] = useState<TemplatePDF[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [autoGenerating, setAutoGenerating] = useState(false)

  const handleGeneratePDF = useCallback(async (templateId?: string) => {
    setIsGenerating(true)
    try {
      toast.loading("Gerando PDF... Por favor, aguarde.")
      
      // Gera o PDF no frontend usando os dados do backend
      await rotaService.downloadPDF(rotaId, templateId || selectedTemplateId, `${rotaNome.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`)
      
      toast.dismiss()
      toast.success("PDF gerado e baixado com sucesso!")
      onClose()
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.dismiss()
      toast.error("Erro ao gerar PDF. Tente novamente.")
    } finally {
      setIsGenerating(false)
      setAutoGenerating(false)
    }
  }, [rotaId, rotaNome, selectedTemplateId, onClose])

  useEffect(() => {
    if (isOpen) {
      setIsLoadingTemplates(true)
      setAutoGenerating(false)
      templateService.findActive()
        .then((response) => {
          const activeTemplates = response.data || []
          setTemplates(activeTemplates)
          
          // Se tiver apenas 1 template, seleciona e gera automaticamente
          if (activeTemplates.length === 1) {
            setSelectedTemplateId(activeTemplates[0].id)
            setAutoGenerating(true)
          } else if (activeTemplates.length > 1) {
            setSelectedTemplateId(activeTemplates[0].id)
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar templates:', error)
          toast.error('Erro ao carregar templates')
        })
        .finally(() => {
          setIsLoadingTemplates(false)
        })
    }
  }, [isOpen])

  // Gera PDF automaticamente quando há apenas 1 template
  useEffect(() => {
    if (autoGenerating && templates.length === 1 && !isLoadingTemplates && !isGenerating) {
      handleGeneratePDF(templates[0].id)
    }
  }, [autoGenerating, templates, isLoadingTemplates, isGenerating, handleGeneratePDF])

  // Se estiver gerando automaticamente (1 template), não mostra a modal
  if (autoGenerating || (isOpen && templates.length === 1 && !isLoadingTemplates)) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" title="Imprimir rota" aria-hidden="true" />
            Imprimir Rota
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Será gerado um PDF com a rota:
            </p>
            <p className="font-semibold text-lg">{rotaNome}</p>
          </div>

          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-destructive">
                Nenhum template ativo encontrado. Crie um template na página de Templates.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione o Template:</label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Os atendimentos serão listados na ordem em que aparecem na rota.
          </p>
          
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
              onClick={() => handleGeneratePDF()}
              disabled={isGenerating || isLoadingTemplates || templates.length === 0 || !selectedTemplateId}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" title="Gerando PDF" aria-label="Gerando PDF" />
                  Gerando...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" title="Gerar PDF" aria-hidden="true" />
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