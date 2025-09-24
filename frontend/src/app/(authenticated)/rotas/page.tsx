'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls } from "@/components/PaginationControls"
import { usePagination } from "@/hooks/usePagination"
import { api } from "@/lib/axios"
import { formatDate } from "@/lib/utils"
import { getErrorMessage, logError } from "@/lib/errorUtils"
import { showErrorToast } from "@/components/ErrorToast"
import { Eye, PenLine, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from 'react-hot-toast'

interface Rota {
  id: string
  nome: string
  descricao?: string
  dataEntrega?: string
  observacoes?: string
  criadoEm: string
  entregas: Array<{
    id: string
    status: string
    beneficiario: {
      nome: string
      endereco: string
    }
  }>
}

export default function RotasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRota, setEditingRota] = useState<Rota | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataEntrega: '',
    observacoes: ''
  })

  const queryClient = useQueryClient()

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
  } = usePagination<Rota>('/rotas')

  const filterConfig = [
    {
      key: 'dataInicio',
      label: 'Data de Início',
      type: 'date' as const,
      placeholder: 'Data de início'
    },
    {
      key: 'dataFim',
      label: 'Data de Fim',
      type: 'date' as const,
      placeholder: 'Data de fim'
    }
  ]

  const handleFiltersChange = (filters: Record<string, string>) => {
    const processedFilters = { ...filters }
    // Remove filtros vazios
    Object.keys(processedFilters).forEach(key => {
      if (!processedFilters[key]) {
        delete processedFilters[key]
      }
    })
    setFilters(processedFilters)
  }

  const createRotaMutation = useMutation({
    mutationFn: async (newRota: any) => {
      const response = await api.post('/rotas', newRota)
      return response.data
    },
    onSuccess: () => {
      // Invalida todas as queries que começam com '/rotas'
      queryClient.invalidateQueries({ 
        queryKey: ['/rotas'],
        exact: false 
      })
      refresh()
      setFormData({ nome: '', descricao: '', dataEntrega: '', observacoes: '' })
      setDialogOpen(false)
      toast.success('Rota cadastrada com sucesso')
    },
    onError: (error: any) => {
      logError('CriarRota', error)
      showErrorToast('Erro ao cadastrar rota', error)
    }
  })

  const updateRotaMutation = useMutation({
    mutationFn: async (updatedRota: any) => {
      try {
        const { id, ...data } = updatedRota
        const response = await api.put(`/rotas/${id}`, data)
        return response.data
      } catch (error: any) {
        console.error('Erro detalhado ao atualizar rota:', error)
        if (error.response?.status === 400 && error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
        throw error
      }
    },
    onSuccess: () => {
      // Invalida todas as queries que começam com '/rotas'
      queryClient.invalidateQueries({ 
        queryKey: ['/rotas'],
        exact: false 
      })
      refresh()
      setFormData({ nome: '', descricao: '', dataEntrega: '', observacoes: '' })
      setEditingRota(null)
      setDialogOpen(false)
      toast.success('Rota atualizada com sucesso')
    },
    onError: (error: any) => {
      logError('AtualizarRota', error)
      showErrorToast('Erro ao atualizar rota', error)
    }
  })

  const deleteRotaMutation = useMutation({
    mutationFn: async (rotaId: string) => {
      try {
        const response = await api.delete(`/rotas/${rotaId}`)
        return response.data
      } catch (error: any) {
        throw error
      }
    },
    onSuccess: () => {
      // Invalida todas as queries que começam com '/rotas'
      queryClient.invalidateQueries({ 
        queryKey: ['/rotas'],
        exact: false 
      })
      refresh()
      toast.success('Rota excluída com sucesso')
    },
    onError: (error: any) => {
      logError('ExcluirRota', error)
      showErrorToast('Erro ao excluir rota', error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    const submitData = {
      ...formData,
      dataEntrega: formData.dataEntrega || null
    }

    if (editingRota) {
      updateRotaMutation.mutate({ ...submitData, id: editingRota.id })
    } else {
      createRotaMutation.mutate(submitData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEdit = (rota: Rota) => {
    try {
      console.log("Iniciando edição da rota:", rota)
      setEditingRota(rota)
      setFormData({
        nome: rota.nome,
        descricao: rota.descricao || '',
        dataEntrega: rota.dataEntrega ? rota.dataEntrega.split('T')[0] : '',
        observacoes: rota.observacoes || ''
      })
      setTimeout(() => {
        setDialogOpen(true)
      }, 0)
    } catch (error) {
      console.error("Erro ao preparar rota para edição:", error)
      toast.error("Erro ao abrir formulário de edição")
    }
  }

  const handleDelete = (rota: Rota) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Tem certeza que deseja excluir a rota "{rota.nome}"?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteRotaMutation.mutate(rota.id);
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
    setEditingRota(null)
    setFormData({ nome: '', descricao: '', dataEntrega: '', observacoes: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rotas</h1>
          <p className="text-muted-foreground">
            Gerencie as rotas de entrega
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) handleCloseDialog();
          }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova rota
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>{editingRota ? 'Editar rota' : 'Nova rota'}</DialogTitle>
              <p id="dialog-description" className="text-sm text-muted-foreground">
                {editingRota 
                  ? 'Altere os dados da rota conforme necessário' 
                  : 'Preencha os dados para cadastrar uma nova rota no sistema'
                }
              </p>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="nome">Nome *</label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Bairro Centro - Semana 1" 
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="descricao">Descrição</label>
                <Input 
                  id="descricao" 
                  placeholder="Descrição da rota" 
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dataEntrega">Data de entrega</label>
                <Input 
                  id="dataEntrega" 
                  type="date" 
                  value={formData.dataEntrega}
                  onChange={(e) => handleInputChange('dataEntrega', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="observacoes">Observações</label>
                <Input 
                  id="observacoes" 
                  placeholder="Observações sobre a rota" 
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createRotaMutation.isPending || updateRotaMutation.isPending}
              >
                {editingRota 
                  ? (updateRotaMutation.isPending ? 'Atualizando...' : 'Atualizar rota')
                  : (createRotaMutation.isPending ? 'Cadastrando...' : 'Cadastrar rota')
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
        searchPlaceholder="Buscar por nome, descrição ou observações..."
        isLoading={isLoading}
        filters={filterConfig}
        onFiltersChange={handleFiltersChange}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data de entrega</TableHead>
              <TableHead>Qtd. Entregas</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando rotas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-red-600">
                    Erro ao carregar rotas: {error?.message || 'Erro desconhecido'}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {params.search ? 'Nenhuma rota encontrada para a busca.' : 'Nenhuma rota cadastrada.'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((rota) => (
                <TableRow key={rota.id}>
                  <TableCell className="font-medium">{rota.nome}</TableCell>
                  <TableCell>{rota.descricao || '-'}</TableCell>
                  <TableCell>
                    {rota.dataEntrega 
                      ? formatDate(rota.dataEntrega)
                      : 'Não definida'
                    }
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{rota.entregas?.length || 0}</span>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Link href={`/rotas/${rota.id}`}>
                      <Button variant="ghost" size="icon" title="Ver detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Editar"
                      onClick={() => handleEdit(rota)}
                    >
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Excluir"
                      onClick={() => handleDelete(rota)}
                      disabled={deleteRotaMutation.isPending}
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