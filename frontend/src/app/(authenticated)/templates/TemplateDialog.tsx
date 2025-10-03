'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { templateService } from '@/lib/services/templateService'
import { TemplatePDF } from '@/lib/types'
import { toast } from 'sonner'

interface TemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  template: TemplatePDF | null
}

export function TemplateDialog({ isOpen, onClose, onSuccess, template }: TemplateDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    conteudo: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (template) {
      setFormData({
        nome: template.nome,
        descricao: template.descricao || '',
        conteudo: template.conteudo
      })
    } else {
      setFormData({
        nome: '',
        descricao: '',
        conteudo: ''
      })
    }
  }, [template, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (template) {
        await templateService.update(template.id, formData)
        toast.success('Template atualizado com sucesso')
      } else {
        await templateService.create(formData)
        toast.success('Template criado com sucesso')
      }
      onSuccess()
    } catch (error) {
      toast.error('Erro ao salvar template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
          <DialogDescription>
            {template 
              ? 'Edite as informações do template HTML' 
              : 'Crie um novo template HTML para impressão de rotas'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Template Padrão"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descrição do template"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo HTML *</Label>
            <Textarea
              id="conteudo"
              value={formData.conteudo}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('conteudo', e.target.value)}
              placeholder="Cole ou digite o código HTML do template aqui..."
              className="min-h-[400px] font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use variáveis como: {'{'}{'{'} nomeRota {'}'}{'}'},  {'{'}{'{'} dataEntrega {'}'}{'}'},  {'{'}{'{'} beneficiarios {'}'}{'}'},  {'{'}{'{'} itens {'}'}{'}'} 
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? 'Salvando...' 
                : template 
                  ? 'Atualizar' 
                  : 'Criar'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}