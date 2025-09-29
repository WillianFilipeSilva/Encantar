'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls } from "@/components/PaginationControls"
import { ConfirmDialog, useConfirmDialog } from "@/components/ConfirmDialog"
import { usePagination } from "@/hooks/usePagination"
import { api } from "@/lib/axios"
import { logError } from "@/lib/errorUtils"
import { showErrorToast } from "@/components/ErrorToast"
import { PenLine, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from 'react-hot-toast'

interface Item {
  id: string
  nome: string
  descricao: string
  unidade: string
}

export default function ItensPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    unidade: ''
  })

  const queryClient = useQueryClient()

  const {
    openDialog: openDeleteDialog,
    ConfirmDialogComponent: DeleteConfirmDialog,
    isLoading: isDeleting
  } = useConfirmDialog({
    title: "Excluir Item",
    description: "Esta ação não pode ser desfeita. O item será removido permanentemente do sistema.",
    confirmText: "Sim, excluir",
    cancelText: "Cancelar",
    variant: 'danger'
  })

  const {
    data,
    pagination,
    params,
    setPage,
    setSearch,
    setLimit,
    setFilters,
    isLoading,
    error,
    refresh
  } = usePagination<Item>('/items')

  const filterConfig = [
    {
      key: 'unidade',
      label: 'Unidade',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Todas' },
        { value: 'kg', label: 'Quilograma (kg)' },
        { value: 'g', label: 'Grama (g)' },
        { value: 'l', label: 'Litro (l)' },
        { value: 'ml', label: 'Mililitro (ml)' },
        { value: 'un', label: 'Unidade (un)' },
        { value: 'cx', label: 'Caixa (cx)' },
        { value: 'pct', label: 'Pacote (pct)' },
        { value: 'lata', label: 'Lata (lata)' },
      ],
      defaultValue: 'all'
    },
    {
      key: 'ativo',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'true', label: 'Ativos' },
        { value: 'false', label: 'Inativos' },
      ],
      defaultValue: 'all'
    }
  ]

  const createItemMutation = useMutation({
    mutationFn: async (newItem: { nome: string; descricao: string; unidade: string }) => {
      const response = await api.post('/items', newItem)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/items'] })
      setFormData({ nome: '', descricao: '', unidade: '' })
      setDialogOpen(false)
      toast.success('Item cadastrado com sucesso!')
    },
    onError: (error: any) => {
      logError('CriarItem', error)
      showErrorToast('Erro ao cadastrar item', error)
    }
  })

  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem: { id: string; nome: string; descricao: string; unidade: string }) => {
      const { id, ...data } = updatedItem
      const response = await api.put(`/items/${id}`, data)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/items'] })
      setFormData({ nome: '', descricao: '', unidade: '' })
      setEditingItem(null)
      setDialogOpen(false)
      toast.success('Item atualizado com sucesso!')
    },
    onError: (error: any) => {
      logError('AtualizarItem', error)
      showErrorToast('Erro ao atualizar item', error)
    }
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await api.delete(`/items/${itemId}`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/items'] });
      toast.success('Item excluído com sucesso!');
    },
    onError: (error: any) => {
      logError('ExcluirItem', error);
      showErrorToast('Erro ao excluir item', error);
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (formData.nome.trim().length > 100) {
      toast.error('Nome deve ter no máximo 100 caracteres')
      return
    }
    if (!formData.unidade.trim()) {
      toast.error('Unidade é obrigatória')
      return
    }
    if (formData.unidade.trim().length > 20) {
      toast.error('Unidade deve ter no máximo 20 caracteres')
      return
    }
    if (formData.descricao && formData.descricao.trim().length > 500) {
      toast.error('Descrição deve ter no máximo 500 caracteres')
      return
    }
    if (editingItem) {
      updateItemMutation.mutate({ ...formData, id: editingItem.id })
    } else {
      createItemMutation.mutate(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      nome: item.nome,
      descricao: item.descricao || '',
      unidade: item.unidade
    })
    setDialogOpen(true)
  }

  const handleDelete = (item: Item) => {
    openDeleteDialog(() => {
      deleteItemMutation.mutate(item.id);
    });
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setFormData({ nome: '', descricao: '', unidade: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Itens</h1>
          <p className="text-muted-foreground">
            Gerencie os itens disponíveis para entrega
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar item' : 'Novo item'}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? 'Altere os dados do item conforme necessário'
                  : 'Preencha os dados para cadastrar um novo item no sistema'
                }
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="nome">Nome *</label>
                <Input id="nome" placeholder="Nome do item" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="descricao">Descrição</label>
                <Input id="descricao" placeholder="Descrição do item" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="unidade">Unidade *</label>
                <Input id="unidade" placeholder="Ex: kg, unidade, litro, caixa" value={formData.unidade} onChange={(e) => handleInputChange('unidade', e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={createItemMutation.isPending || updateItemMutation.isPending}>
                {editingItem
                  ? (updateItemMutation.isPending ? 'Atualizando...' : 'Atualizar item')
                  : (createItemMutation.isPending ? 'Cadastrando...' : 'Cadastrar item')
                }
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <PaginationControls
        pagination={pagination}
        searchValue={params.search}
        filterValues={params}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, descrição ou unidade..."
        isLoading={isLoading}
        filters={filterConfig}
        onFiltersChange={setFilters}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando itens...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="text-red-600">
                    Erro ao carregar itens: {error?.message || 'Erro desconhecido'}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {params.search ? 'Nenhum item encontrado para a busca.' : 'Nenhum item cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.descricao || '-'}</TableCell>
                  <TableCell>{item.unidade}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Editar item" onClick={() => handleEdit(item)}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Excluir item" 
                      onClick={() => handleDelete(item)} 
                      disabled={deleteItemMutation.isPending || isDeleting}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <DeleteConfirmDialog />
    </div>
  )
}