'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls } from "@/components/PaginationControls"
import { usePagination } from "@/hooks/usePagination"
import { api } from "@/lib/axios"
import { logError } from "@/lib/errorUtils"
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
    data,
    pagination,
    params,
    setPage,
    setSearch,
    setLimit,
    setFilters,
    isLoading,
    error,
  } = usePagination<Beneficiario>('/beneficiarios')

  const filterConfig = [
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

  const createBeneficiarioMutation = useMutation({
    mutationFn: async (newBeneficiario: { nome: string; endereco: string; telefone?: string; email?: string; dataNascimento?: string; observacoes?: string }) => {
      // Limpar campos vazios para evitar erro do Prisma
      const cleanData = {
        nome: newBeneficiario.nome,
        endereco: newBeneficiario.endereco,
        telefone: newBeneficiario.telefone?.trim() || undefined,
        email: newBeneficiario.email?.trim() || undefined,
        dataNascimento: newBeneficiario.dataNascimento?.trim() || undefined,
        observacoes: newBeneficiario.observacoes?.trim() || undefined
      }
      
      // Remove campos undefined
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key as keyof typeof cleanData] === undefined) {
          delete cleanData[key as keyof typeof cleanData]
        }
      })
      
      const response = await api.post('/beneficiarios', cleanData)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/beneficiarios'] })
      setFormData({ nome: '', endereco: '', telefone: '', email: '', dataNascimento: '', observacoes: '' })
      setDialogOpen(false)
      toast.success('Beneficiário cadastrado com sucesso!')
    },
    onError: (error: any) => {
      logError('CriarBeneficiario', error)
      showErrorToast('Erro ao cadastrar beneficiário', error)
    }
  })

  const updateBeneficiarioMutation = useMutation({
    mutationFn: async (updatedBeneficiario: { id: string; nome: string; endereco: string; telefone?: string; email?: string; dataNascimento?: string; observacoes?: string }) => {
      const { id, ...data } = updatedBeneficiario
      
      // Limpar campos vazios para evitar erro do Prisma
      const cleanData = {
        nome: data.nome,
        endereco: data.endereco,
        telefone: data.telefone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        dataNascimento: data.dataNascimento?.trim() || undefined,
        observacoes: data.observacoes?.trim() || undefined
      }
      
      // Remove campos undefined
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key as keyof typeof cleanData] === undefined) {
          delete cleanData[key as keyof typeof cleanData]
        }
      })
      
      const response = await api.put(`/beneficiarios/${id}`, cleanData)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/beneficiarios'] })
      setFormData({ nome: '', endereco: '', telefone: '', email: '', dataNascimento: '', observacoes: '' })
      setEditingBeneficiario(null)
      setDialogOpen(false)
      toast.success('Beneficiário atualizado com sucesso!')
    },
    onError: (error: any) => {
      logError('AtualizarBeneficiario', error)
      showErrorToast('Erro ao atualizar beneficiário', error)
    }
  })

  const deleteBeneficiarioMutation = useMutation({
    mutationFn: async (beneficiarioId: string) => {
      const response = await api.delete(`/beneficiarios/${beneficiarioId}`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/beneficiarios'] });
      toast.success('Beneficiário excluído com sucesso!');
    },
    onError: (error: any) => {
      logError('ExcluirBeneficiario', error);
      showErrorToast('Erro ao excluir beneficiário', error);
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (formData.nome.trim().length < 2) {
      toast.error('Nome deve ter pelo menos 2 caracteres')
      return
    }
    if (formData.nome.trim().length > 100) {
      toast.error('Nome deve ter no máximo 100 caracteres')
      return
    }
    if (!formData.endereco.trim()) {
      toast.error('Endereço é obrigatório')
      return
    }
    if (formData.endereco.trim().length <= 5) {
      toast.error('Endereço deve ter mais de 5 caracteres')
      return
    }
    if (formData.telefone && (formData.telefone.trim().length < 10 || formData.telefone.trim().length > 15)) {
      toast.error('Telefone deve ter entre 10 e 15 caracteres')
      return
    }
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error('Email deve ter um formato válido')
      return
    }
    if (formData.observacoes && formData.observacoes.trim().length > 500) {
      toast.error('Observações deve ter no máximo 500 caracteres')
      return
    }
    if (editingBeneficiario) {
      updateBeneficiarioMutation.mutate({ ...formData, id: editingBeneficiario.id })
    } else {
      createBeneficiarioMutation.mutate(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEdit = (beneficiario: Beneficiario) => {
    setEditingBeneficiario(beneficiario)
    setFormData({
      nome: beneficiario.nome,
      endereco: beneficiario.endereco,
      telefone: beneficiario.telefone || '',
      email: beneficiario.email || '',
      dataNascimento: beneficiario.dataNascimento || '',
      observacoes: beneficiario.observacoes || ''
    })
    setDialogOpen(true)
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
            Gerencie os beneficiários cadastrados no sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo beneficiário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBeneficiario ? 'Editar beneficiário' : 'Novo beneficiário'}</DialogTitle>
              <DialogDescription>
                {editingBeneficiario 
                  ? 'Altere os dados do beneficiário conforme necessário' 
                  : 'Preencha os dados para cadastrar um novo beneficiário no sistema'
                }
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="nome">Nome *</label>
                <Input id="nome" placeholder="Nome do beneficiário" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="endereco">Endereço *</label>
                <Input id="endereco" placeholder="Endereço completo" value={formData.endereco} onChange={(e) => handleInputChange('endereco', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="telefone">Telefone</label>
                <Input id="telefone" placeholder="Telefone para contato" value={formData.telefone} onChange={(e) => handleInputChange('telefone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input id="email" placeholder="Email para contato" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange('dataNascimento', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="observacoes">Observações</label>
                <Input id="observacoes" placeholder="Observações adicionais" value={formData.observacoes} onChange={(e) => handleInputChange('observacoes', e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={createBeneficiarioMutation.isPending || updateBeneficiarioMutation.isPending}>
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
        filterValues={params}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, endereço, telefone ou email..."
        isLoading={isLoading}
        filters={filterConfig}
        onFiltersChange={setFilters}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando beneficiários...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-red-600">
                    Erro ao carregar beneficiários: {error?.message || 'Erro desconhecido'}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {params.search ? 'Nenhum beneficiário encontrado para a busca.' : 'Nenhum beneficiário cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((beneficiario) => (
                <TableRow key={beneficiario.id}>
                  <TableCell className="font-medium">{beneficiario.nome}</TableCell>
                  <TableCell>{beneficiario.endereco}</TableCell>
                  <TableCell>{beneficiario.telefone || '-'}</TableCell>
                  <TableCell>{beneficiario.email || '-'}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Editar beneficiário" onClick={() => handleEdit(beneficiario)}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir beneficiário" onClick={() => handleDelete(beneficiario)} disabled={deleteBeneficiarioMutation.isPending}>
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