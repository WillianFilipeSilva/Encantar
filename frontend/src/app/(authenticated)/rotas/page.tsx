'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls } from "@/components/PaginationControls"
import { ConfirmDialog, useConfirmDialog } from "@/components/ConfirmDialog"
import { usePagination } from "@/hooks/usePagination"
import { api } from "@/lib/axios"
import { formatDate } from "@/lib/utils"
import { logError } from "@/lib/errorUtils"
import { showErrorToast } from "@/components/ErrorToast"
import { Eye, PenLine, Plus, Printer, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from 'react-hot-toast'
import { PrintModal } from "@/components/PrintModal"

interface Rota {
  id: string
  nome: string
  descricao?: string
  dataEntrega?: string
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
    dataEntrega: ''
  })
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [selectedRotaForPrint, setSelectedRotaForPrint] = useState<Rota | null>(null)

  const queryClient = useQueryClient()

  const {
    openDialog: openDeleteDialog,
    ConfirmDialogComponent: DeleteConfirmDialog,
    isLoading: isDeleting
  } = useConfirmDialog({
    title: "Excluir Rota",
    description: "Esta ação não pode ser desfeita. A rota e todos os atendimentos associados serão removidos permanentemente.",
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

  const createRotaMutation = useMutation({
    mutationFn: async (newRota: any) => {
      const response = await api.post('/rotas', newRota)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/rotas'] })
      setPage(1)
      setFormData({ nome: '', descricao: '', dataEntrega: '' })
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
      const { id, ...data } = updatedRota
      const response = await api.put(`/rotas/${id}`, data)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/rotas'] })
      setFormData({ nome: '', descricao: '', dataEntrega: '' })
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
      const response = await api.delete(`/rotas/${rotaId}`)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/rotas'] })
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
    setEditingRota(rota)
    setFormData({
      nome: rota.nome,
      descricao: rota.descricao || '',
      dataEntrega: rota.dataEntrega ? rota.dataEntrega.split('T')[0] : ''
    })
    setDialogOpen(true)
  }

  const handleDelete = (rota: Rota) => {
    openDeleteDialog(() => {
      deleteRotaMutation.mutate(rota.id);
    });
  }

  const handlePrint = (rota: Rota) => {
    setSelectedRotaForPrint(rota)
    setPrintModalOpen(true)
  }

  const handleClosePrintModal = () => {
    setPrintModalOpen(false)
    setSelectedRotaForPrint(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRota(null)
    setFormData({ nome: '', descricao: '', dataEntrega: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rotas</h1>
          <p className="text-muted-foreground">
            Gerencie as rotas de atendimento
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova rota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRota ? 'Editar rota' : 'Nova rota'}</DialogTitle>
              <DialogDescription>
                {editingRota
                  ? 'Altere os dados da rota conforme necessário'
                  : 'Preencha os dados para cadastrar uma nova rota no sistema'
                }
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="nome">Nome *</label>
                <Input id="nome" placeholder="Ex: Bairro Centro - Semana 1" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="descricao">Descrição</label>
                <Input id="descricao" placeholder="Descrição da rota" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="dataEntrega">Data de atendimento</label>
                <Input id="dataEntrega" type="date" value={formData.dataEntrega} onChange={(e) => handleInputChange('dataEntrega', e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={createRotaMutation.isPending || updateRotaMutation.isPending}>
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
              <TableHead>Data de atendimento</TableHead>
              <TableHead>Qtd. Atendimentos</TableHead>
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
                    <Button variant="ghost" size="icon" title="Imprimir" onClick={() => handlePrint(rota)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => handleEdit(rota)}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Excluir" 
                      onClick={() => handleDelete(rota)} 
                      disabled={deleteRotaMutation.isPending || isDeleting}
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
      
      {selectedRotaForPrint && (
        <PrintModal
          rotaId={selectedRotaForPrint.id}
          rotaNome={selectedRotaForPrint.nome}
          isOpen={printModalOpen}
          onClose={handleClosePrintModal}
        />
      )}
    </div>
  )
}