'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { TemplateDialog } from './TemplateDialog'
import { TemplatePreviewDialog } from './TemplatePreviewDialog'
import { templateService } from '@/lib/services/templateService'
import { TemplatePDF } from '@/lib/types'
import { toast } from 'sonner'

export default function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePDF | null>(null)

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['templates', search],
    queryFn: async () => {
      if (search) {
        return await templateService.search(search)
      } else {
        return await templateService.findAll()
      }
    },
  })

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditTemplate = (template: TemplatePDF) => {
    setSelectedTemplate(template)
    setIsEditDialogOpen(true)
  }

  const handlePreviewTemplate = (template: TemplatePDF) => {
    setSelectedTemplate(template)
    setIsPreviewDialogOpen(true)
  }

  const handleToggleAtivo = async (template: TemplatePDF) => {
    try {
      await templateService.toggleAtivo(template.id)
      toast.success(`Template ${template.ativo ? 'desativado' : 'ativado'} com sucesso`)
      refetch()
    } catch (error) {
      toast.error('Erro ao alterar status do template')
    }
  }

  const handleDeleteTemplate = async (template: TemplatePDF) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return
    
    try {
      await templateService.delete(template.id)
      toast.success('Template excluído com sucesso')
      refetch()
    } catch (error) {
      toast.error('Erro ao excluir template')
    }
  }

  const handleDialogSuccess = () => {
    refetch()
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedTemplate(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Gerencie templates HTML para impressão de rotas
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates?.data?.map((template: TemplatePDF) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.nome}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {template.descricao || 'Sem descrição'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.ativo ? 'default' : 'secondary'}>
                        {template.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(template.criadoEm).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAtivo(template)}
                        >
                          {template.ativo ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) || []}
              </TableBody>
            </Table>
          )}

          {!isLoading && (!templates?.data || (templates.data && templates.data.length === 0)) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {search ? 'Nenhum template encontrado' : 'Nenhum template cadastrado'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <TemplateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        template={null}
      />

      <TemplateDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        template={selectedTemplate}
      />

      <TemplatePreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        template={selectedTemplate}
      />
    </div>
  )
}