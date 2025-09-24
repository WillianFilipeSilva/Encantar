'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls } from "@/components/PaginationControls"
import { usePagination } from "@/hooks/usePagination"
import { api } from "@/lib/axios"
import { getErrorMessage, logError } from "@/lib/errorUtils"
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
    data,
    pagination,
    params,
    setPage,
    setSearch,
    setLimit,
    isLoading,
    error,
    refresh
  } = usePagination<Item>('/items')

  const createItemMutation = useMutation({
    mutationFn: async (newItem: { nome: string; descricao: string; unidade: string }) => {
      const response = await api.post('/items', newItem)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/items'] })
      refresh()
      setFormData({ nome: '', descricao: '', unidade: '' })
      setDialogOpen(false)
      toast.success('Item cadastrado com sucesso!', {
        duration: 3000,
      })
    },
    onError: (error: any) => {
      logError('CriarItem', error)
      showErrorToast('Erro ao cadastrar item', error)
    }
  })

  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem: { id: string; nome: string; descricao: string; unidade: string }) => {
      try {
        const { id, ...data } = updatedItem
        const response = await api.put(`/items/${id}`, data)
        return response.data
      } catch (error: any) {
        console.error('Erro detalhado ao atualizar item:', error)
        if (error.response?.status === 400 && error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/items'] })
      refresh()
      setFormData({ nome: '', descricao: '', unidade: '' })
      setEditingItem(null)
      setDialogOpen(false)
      toast.success('Item atualizado com sucesso!', {
        duration: 3000,
      })
    },
    onError: (error: any) => {
      logError('AtualizarItem', error)
      showErrorToast('Erro ao atualizar item', error)
    }
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      try {
        console.log(`Tentando excluir item com ID: ${itemId}`);
        const response = await api.delete(`/items/${itemId}`);
        return response.data;
      } catch (error: any) {
        console.error(`Erro ao excluir item com ID: ${itemId}`);
        if (error.config) {
          console.error(`URL da requisição: ${error.config.url}`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/items'] });
      refresh();
      toast.success('Item excluído com sucesso!', {
        duration: 3000,
      });
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
    
    if (!formData.unidade.trim()) {
      toast.error('Unidade é obrigatória')
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
    try {
      console.log("Iniciando edição do item:", item)
      setEditingItem(item)
      setFormData({
        nome: item.nome,
        descricao: item.descricao || '',
        unidade: item.unidade
      })
      setTimeout(() => {
        setDialogOpen(true)
      }, 0)
    } catch (error) {
      console.error("Erro ao preparar item para edição:", error)
      toast.error("Erro ao abrir formulário de edição")
    }
  }

  const handleDelete = (item: Item) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Tem certeza que deseja excluir o item "{item.nome}"?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteItemMutation.mutate(item.id);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
          >
            Excluir
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 px-3 py-1 rounded-md text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
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
            setDialogOpen(open);
            if (!open) handleCloseDialog();
          }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo item
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar item' : 'Novo item'}</DialogTitle>
              <p id="dialog-description" className="text-sm text-muted-foreground">
                {editingItem 
                  ? 'Altere os dados do item conforme necessário' 
                  : 'Preencha os dados para cadastrar um novo item no sistema'
                }
              </p>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="nome">Nome *</label>
                <Input 
                  id="nome" 
                  placeholder="Nome do item" 
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="descricao">Descrição</label>
                <Input 
                  id="descricao" 
                  placeholder="Descrição do item" 
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="unidade">Unidade *</label>
                <Input 
                  id="unidade" 
                  placeholder="Ex: kg, unidade, litro, caixa" 
                  value={formData.unidade}
                  onChange={(e) => handleInputChange('unidade', e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createItemMutation.isPending || updateItemMutation.isPending}
              >
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
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, descrição ou unidade..."
        isLoading={isLoading}
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Editar item"
                      onClick={() => handleEdit(item)}
                    >
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Excluir item"
                      onClick={() => handleDelete(item)}
                      disabled={deleteItemMutation.isPending}
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
    </div>
  )
}