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

interface Beneficiario {
  id: string
  nome: string
  endereco: string
  telefone?: string
  email?: string
  dataNascimento?: string
  observacoes?: string
  ativo: boolean
}

export default function BeneficiariosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBeneficiario, setEditingBeneficiario] = useState<Beneficiario | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    observacoes: ''
  })

  const queryClient = useQueryClient()

  const {
    data: beneficiarios,
    pagination,
    isLoading,
    params,
    setPage,
    setSearch,
    setLimit,
    refresh
  } = usePagination<Beneficiario>('/beneficiarios')

  const createBeneficiarioMutation = useMutation({
    mutationFn: async (newBeneficiario: any) => {
      const response = await api.post('/beneficiarios', newBeneficiario)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/beneficiarios'] })
      refresh()
      setFormData({ nome: '', endereco: '', telefone: '', email: '', dataNascimento: '', observacoes: '' })
      setDialogOpen(false)
      toast.success('Beneficiário cadastrado com sucesso')
    },
    onError: (error: any) => {
      logError('CriarBeneficiario', error)
      showErrorToast('Erro ao cadastrar beneficiário', error)
    }
  })

  const updateBeneficiarioMutation = useMutation({
    mutationFn: async (updatedBeneficiario: any) => {
      try {
        const { id, ...data } = updatedBeneficiario
        const response = await api.put(`/beneficiarios/${id}`, data)
        return response.data
      } catch (error: any) {
        console.error('Erro detalhado ao atualizar beneficiário:', error)
        if (error.response?.status === 400 && error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/beneficiarios'] })
      refresh()
      setFormData({ nome: '', endereco: '', telefone: '', email: '', dataNascimento: '', observacoes: '' })
      setEditingBeneficiario(null)
      setDialogOpen(false)
      toast.success('Beneficiário atualizado com sucesso')
    },
    onError: (error: any) => {
      logError('AtualizarBeneficiario', error)
      showErrorToast('Erro ao atualizar beneficiário', error)
    }
  })

  const deleteBeneficiarioMutation = useMutation({
    mutationFn: async (beneficiarioId: string) => {
      try {
        const response = await api.delete(`/beneficiarios/${beneficiarioId}`)
        return response.data
      } catch (error: any) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/beneficiarios'] })
      refresh()
      toast.success('Beneficiário excluído com sucesso')
    },
    onError: (error: any) => {
      logError('ExcluirBeneficiario', error)
      showErrorToast('Erro ao excluir beneficiário', error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    
    if (!formData.endereco.trim()) {
      toast.error('Endereço é obrigatório')
      return
    }

    const submitData = {
      ...formData,
      dataNascimento: formData.dataNascimento || null
    }

    if (editingBeneficiario) {
      updateBeneficiarioMutation.mutate({ ...submitData, id: editingBeneficiario.id })
    } else {
      createBeneficiarioMutation.mutate(submitData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEdit = (beneficiario: Beneficiario) => {
    try {
      console.log("Iniciando edição do beneficiário:", beneficiario)
      setEditingBeneficiario(beneficiario)
      setFormData({
        nome: beneficiario.nome,
        endereco: beneficiario.endereco,
        telefone: beneficiario.telefone || '',
        email: beneficiario.email || '',
        dataNascimento: beneficiario.dataNascimento ? beneficiario.dataNascimento.split('T')[0] : '',
        observacoes: beneficiario.observacoes || ''
      })
      setTimeout(() => {
        setDialogOpen(true)
      }, 0)
    } catch (error) {
      console.error("Erro ao preparar beneficiário para edição:", error)
      toast.error("Erro ao abrir formulário de edição")
    }
  }

  const handleDelete = (beneficiario: Beneficiario) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Tem certeza que deseja excluir o beneficiário "{beneficiario.nome}"?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteBeneficiarioMutation.mutate(beneficiario.id);
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
    setEditingBeneficiario(null)
    setFormData({ nome: '', endereco: '', telefone: '', email: '', dataNascimento: '', observacoes: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiários</h1>
          <p className="text-muted-foreground">
            Gerencie os beneficiários do sistema
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) handleCloseDialog();
          }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo beneficiário
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>{editingBeneficiario ? 'Editar beneficiário' : 'Novo beneficiário'}</DialogTitle>
              <p id="dialog-description" className="text-sm text-muted-foreground">
                {editingBeneficiario 
                  ? 'Altere os dados do beneficiário conforme necessário' 
                  : 'Preencha os dados para cadastrar um novo beneficiário no sistema'
                }
              </p>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="nome">Nome *</label>
                <Input 
                  id="nome" 
                  placeholder="Nome do beneficiário" 
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endereco">Endereço *</label>
                <Input 
                  id="endereco" 
                  placeholder="Endereço do beneficiário" 
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="telefone">Telefone (opcional)</label>
                <Input 
                  id="telefone" 
                  placeholder="Telefone do beneficiário" 
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email">Email (opcional)</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Email do beneficiário" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dataNascimento">Data de nascimento (opcional)</label>
                <Input 
                  id="dataNascimento" 
                  type="date" 
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="observacoes">Observações (opcional)</label>
                <Input 
                  id="observacoes" 
                  placeholder="Observações" 
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createBeneficiarioMutation.isPending || updateBeneficiarioMutation.isPending}
              >
                {editingBeneficiario 
                  ? (updateBeneficiarioMutation.isPending ? 'Atualizando...' : 'Atualizar beneficiário')
                  : (createBeneficiarioMutation.isPending ? 'Cadastrando...' : 'Cadastrar beneficiário')
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
        searchPlaceholder="Buscar por nome, endereço, telefone, email ou observações..."
        isLoading={isLoading}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data de nascimento</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando beneficiários...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : beneficiarios?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {params.search ? 'Nenhum beneficiário encontrado para a busca.' : 'Nenhum beneficiário cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              beneficiarios?.map((beneficiario) => (
                <TableRow key={beneficiario.id}>
                  <TableCell>{beneficiario.nome}</TableCell>
                  <TableCell>{beneficiario.endereco}</TableCell>
                  <TableCell>{beneficiario.telefone || '-'}</TableCell>
                  <TableCell>
                    {beneficiario.dataNascimento 
                      ? new Date(beneficiario.dataNascimento).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 max-w-xs truncate block">
                      {beneficiario.observacoes || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Editar beneficiário"
                      onClick={() => handleEdit(beneficiario)}
                    >
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Excluir beneficiário"
                      onClick={() => handleDelete(beneficiario)}
                      disabled={deleteBeneficiarioMutation.isPending}
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