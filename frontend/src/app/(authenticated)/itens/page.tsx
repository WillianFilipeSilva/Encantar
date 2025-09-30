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
  unidade: 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'CX' | 'PCT' | 'LATA'
  ativo: boolean
}

export default function ItensPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    unidade: 'UN' as 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'CX' | 'PCT' | 'LATA'
  })

  const queryClient = useQueryClient()

  const {
    openDialog: openInactivateDialog,
    ConfirmDialogComponent: InactivateConfirmDialog
  } = useConfirmDialog({
    title: "Inativar Item",
    description: "O item será inativado e não poderá mais ser usado em novas entregas.",
    confirmText: "Sim, inativar",
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
        { value: 'KG', label: 'Quilograma (kg)' },
        { value: 'G', label: 'Grama (g)' },
        { value: 'L', label: 'Litro (l)' },
        { value: 'ML', label: 'Mililitro (ml)' },
        { value: 'UN', label: 'Unidade (un)' },
        { value: 'CX', label: 'Caixa (cx)' },
        { value: 'PCT', label: 'Pacote (pct)' },
        { value: 'LATA', label: 'Lata (lata)' },
      ],
      defaultValue: 'all'
    },
    {
      key: 'ativo',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Ativos' },
        { value: 'false', label: 'Inativos' },
        { value: 'all', label: 'Todos' },
      ],
      defaultValue: 'true'
    }
  ]

  const createItemMutation = useMutation({
    mutationFn: async (newItem: { nome: string; descricao: string; unidade: string }) => {
      const response = await api.post('/items', newItem)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/items'] })
      setFormData({ nome: '', descricao: '', unidade: 'UN' })
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
      setFormData({ nome: '', descricao: '', unidade: 'UN' })
      setEditingItem(null)
      setDialogOpen(false)
      toast.success('Item atualizado com sucesso!')
    },
    onError: (error: any) => {
      logError('AtualizarItem', error)
      showErrorToast('Erro ao atualizar item', error)
    }
  })

  const inactivateItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await api.patch(`/items/${itemId}/inactivate`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/items'] });
      toast.success('Item inativado com sucesso!');
    },
    onError: (error: any) => {
      logError('InativarItem', error);
      showErrorToast('Erro ao inativar item', error);
    }
  })

  const activateItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await api.patch(`/items/${itemId}/activate`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/items'] });
      toast.success('Item ativado com sucesso!');
    },
    onError: (error: any) => {
      logError('AtivarItem', error);
      showErrorToast('Erro ao ativar item', error);
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
    if (!formData.unidade) {
      toast.error('Unidade é obrigatória')
      return
    }
    const validUnidades = ['KG', 'G', 'L', 'ML', 'UN', 'CX', 'PCT', 'LATA'];
    if (!validUnidades.includes(formData.unidade)) {
      toast.error('Unidade deve ser uma das opções válidas')
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

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setFormData({ nome: '', descricao: '', unidade: 'UN' })
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
                <select 
                  id="unidade" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.unidade} 
                  onChange={(e) => handleInputChange('unidade', e.target.value as any)}
                  required
                >
                  <option value="KG">Quilograma (kg)</option>
                  <option value="G">Grama (g)</option>
                  <option value="L">Litro (l)</option>
                  <option value="ML">Mililitro (ml)</option>
                  <option value="UN">Unidade (un)</option>
                  <option value="CX">Caixa (cx)</option>
                  <option value="PCT">Pacote (pct)</option>
                  <option value="LATA">Lata (lata)</option>
                </select>
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
        searchPlaceholder="Buscar por nome ou descrição..."
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
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando itens...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-red-600">
                    Erro ao carregar itens: {error?.message || 'Erro desconhecido'}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {params.search ? 'Nenhum item encontrado para a busca.' : 'Nenhum item cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.descricao || '-'}</TableCell>
                  <TableCell>{item.unidade}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Editar item" onClick={() => handleEdit(item)}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                    {item.ativo ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Inativar item" 
                        onClick={() => openInactivateDialog(() => inactivateItemMutation.mutate(item.id))}
                        disabled={inactivateItemMutation.isPending}
                        className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Ativar item" 
                        onClick={() => activateItemMutation.mutate(item.id)}
                        disabled={activateItemMutation.isPending}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <InactivateConfirmDialog />
    </div>
  )
}