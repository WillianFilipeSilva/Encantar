'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Printer, Loader2 } from "lucide-react"
import { rotaService } from "@/lib/services/rotaService"
import toast from 'react-hot-toast'

interface PrintModalProps {
  rotaId: string
  rotaNome: string
  isOpen: boolean
  onClose: () => void
}

export function PrintModal({ rotaId, rotaNome, isOpen, onClose }: PrintModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      toast.loading("Gerando PDF... Por favor, aguarde.")
      
      // Gera o PDF no frontend usando os dados do backend
      await rotaService.downloadPDF(rotaId, '', `${rotaNome.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`)
      
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
            <p className="text-xs text-muted-foreground mt-2">
              Os atendimentos serão listados na ordem em que aparecem na rota.
            </p>
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
              disabled={isGenerating}
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