'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AutocompleteInput } from "@/components/AutocompleteInput"
import { api } from "@/lib/axios"
import { formatDate } from "@/lib/utils"
import { getErrorMessage, logError } from "@/lib/errorUtils"
import { showErrorToast } from "@/components/ErrorToast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle, Package, PenLine, Plus, Printer, Trash2, XCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import toast from 'react-hot-toast'

interface RotaDetalhes {
  id: string
  nome: string
  descricao?: string
  observacoes?: string
  dataEntrega?: string
  entregas: Array<{
    id: string
    status: 'PENDENTE' | 'ENTREGUE' | 'CANCELADA'
    observacoes?: string
    beneficiario: {
      nome: string
      endereco: string
      telefone?: string
    }
    entregaItems: Array<{
      quantidade: number
      item: {
        nome: string
        unidade: string
      }
    }>
  }>
}

interface Beneficiario {
  id: string
  nome: string
  endereco: string
  telefone?: string
  ativo: boolean
}

interface Item {
  id: string
  nome: string
  descricao: string
  unidade: 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'CX' | 'PCT' | 'LATA'
  ativo: boolean
}

interface ModeloEntrega {
  id: string
  nome: string
  descricao?: string
  modeloItems: Array<{
    quantidade: number
    item: {
      id: string
      nome: string
      unidade: string
    }
  }>
}

const statusMap = {
  PENDENTE: 'Pendente',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
}

const statusColorMap = {
  PENDENTE: 'text-yellow-600 bg-yellow-50',
  ENTREGUE: 'text-green-600 bg-green-50',
  CANCELADA: 'text-red-600 bg-red-50',
}

export default function RotaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    beneficiarioId: '',
    observacoes: ''
  })
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<Beneficiario | null>(null)
  const [usarModelo, setUsarModelo] = useState(false)
  const [modeloSelecionado, setModeloSelecionado] = useState<string>('')
  const [entregaItems, setEntregaItems] = useState<Array<{itemId: string, quantidade: number}>>([])
  const [isSearchingBeneficiarios, setIsSearchingBeneficiarios] = useState(false)
  const [isSearchingItens, setIsSearchingItens] = useState(false)

  const { data: rota, isLoading, error } = useQuery<RotaDetalhes>({
    queryKey: ['rota', params.id],
    queryFn: async () => {
      const response = await api.get(`/rotas/${params.id}`)
      console.log('Dados da rota recebidos:', response.data)
      return response.data.data || response.data
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  // Query de beneficiários corrigida com limit máximo de 500
  const { data: beneficiarios, isLoading: isLoadingBeneficiarios } = useQuery<Beneficiario[]>({
    queryKey: ['beneficiarios'],
    queryFn: async () => {
      const response = await api.get('/beneficiarios?page=1&limit=500')
      return response.data.data || response.data || []
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  const { data: itens, isLoading: isLoadingItens } = useQuery<Item[]>({
    queryKey: ['itens-ativos'],
    queryFn: async () => {
      try {
        const response = await api.get('/items/active?page=1&limit=500')
        console.log('Dados de itens ativos recebidos:', response.data)
        return response.data.data || response.data || []
      } catch (error) {
        console.error('Erro ao buscar itens ativos:', error)
        return []
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1
  })

  const { data: modelos, isLoading: isLoadingModelos } = useQuery<ModeloEntrega[]>({
    queryKey: ['modelos'],
    queryFn: async () => {
      const response = await api.get('/modelos-entrega?page=1&limit=500')
      return response.data.data || response.data || []
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  // Funções de busca para autocomplete
  const searchBeneficiarios = async (searchTerm: string) => {
    if (searchTerm.length < 1) return []
    setIsSearchingBeneficiarios(true)
    try {
      const response = await api.get(`/entregas/beneficiarios/search?q=${encodeURIComponent(searchTerm)}`)
      return response.data?.data || response.data || []
    } catch (error) {
      console.error('Erro ao buscar beneficiários:', error)
      return []
    } finally {
      setIsSearchingBeneficiarios(false)
    }
  }

  const searchItens = async (searchTerm: string) => {
    if (searchTerm.length < 1) return []
    setIsSearchingItens(true)
    try {
      const response = await api.get(`/entregas/itens/search?q=${encodeURIComponent(searchTerm)}`)
      return response.data?.data || response.data || []
    } catch (error) {
      console.error('Erro ao buscar itens:', error)
      return []
    } finally {
      setIsSearchingItens(false)
    }
  }

  const createEntregaMutation = useMutation({
    mutationFn: async (newEntrega: any) => {
      const response = await api.post('/entregas', {
        ...newEntrega,
        rotaId: params.id
      })
      return response.data
    },
    onSuccess: () => {
      // Invalida queries relacionadas à rota específica
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'rota' || 
          query.queryKey[0] === '/rotas'
      })
      resetForm()
      setDialogOpen(false)
      toast.success('Entrega cadastrada com sucesso!', {
        duration: 3000,
      })
    },
    onError: (error: any) => {
      logError('CriarEntrega', error)
      showErrorToast('Erro ao cadastrar entrega', error)
    }
  })

  const updateEntregaStatusMutation = useMutation({
    mutationFn: async ({ entregaId, status }: { entregaId: string, status: string }) => {
      const response = await api.patch(`/entregas/${entregaId}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      // Invalida queries relacionadas à rota específica
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'rota' || 
          query.queryKey[0] === '/rotas'
      })
      toast.success('Status da entrega atualizado!', {
        duration: 3000,
      })
    },
    onError: (error: any) => {
      logError('AtualizarStatus', error)
      showErrorToast('Erro ao atualizar status', error)
    }
  })

  const deleteEntregaMutation = useMutation({
    mutationFn: async (entregaId: string) => {
      const response = await api.delete(`/entregas/${entregaId}`)
      return response.data
    },
    onSuccess: () => {
      // Invalida queries relacionadas à rota específica
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'rota' || 
          query.queryKey[0] === '/rotas'
      })
      toast.success('Entrega excluída com sucesso!', {
        duration: 3000,
      })
    },
    onError: (error: any) => {
      logError('ExcluirEntrega', error)
      showErrorToast('Erro ao excluir entrega', error)
    }
  })

  useEffect(() => {
    // Não precisamos mais inicializar itemsSelecionados
  }, [])

  const resetForm = () => {
    setFormData({ beneficiarioId: '', observacoes: '' })
    setSelectedBeneficiario(null)
    setUsarModelo(false)
    setModeloSelecionado('')
    setEntregaItems([])
  }

  const handleSubmitEntrega = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.beneficiarioId) {
      toast.error('Selecione um beneficiário')
      return
    }

    const itensComQuantidade = entregaItems.filter(item => item.quantidade > 0)
    if (itensComQuantidade.length === 0) {
      toast.error('Adicione pelo menos um item com quantidade')
      return
    }

    const entregaData = {
      beneficiarioId: formData.beneficiarioId,
      observacoes: formData.observacoes,
      items: itensComQuantidade.map(item => ({
        itemId: item.itemId,
        quantidade: item.quantidade
      }))
    }

    createEntregaMutation.mutate(entregaData)
  }

  const handleCarregarModelo = () => {
    const modelo = modelos?.find(m => m.id === modeloSelecionado)
    if (modelo) {
      setEntregaItems(modelo.modeloItems.map(mi => ({
        itemId: mi.item.id,
        quantidade: mi.quantidade
      })))
      toast.success('Modelo carregado com sucesso!')
    }
  }

  // Funções para gerenciar itens da entrega
  const addEntregaItem = () => {
    setEntregaItems(prev => [...prev, { itemId: '', quantidade: 1 }])
  }

  const removeEntregaItem = (index: number) => {
    setEntregaItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateEntregaItem = (index: number, field: string, value: any) => {
    setEntregaItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const updateAllEntregasStatusMutation = useMutation({
    mutationFn: async (novoStatus: string) => {
      const response = await api.patch(`/rotas/${params.id}/entregas/status`, { status: novoStatus })
      return response.data
    },
    onSuccess: () => {
      // Invalida queries relacionadas à rota específica
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'rota' || 
          query.queryKey[0] === '/rotas'
      })
      toast.success('Status de todas as entregas atualizado!', {
        duration: 3000,
      })
    },
    onError: (error: any) => {
      logError('AtualizarStatusTodas', error)
      showErrorToast('Erro ao atualizar status das entregas', error)
    }
  })

  if (isLoading || isLoadingBeneficiarios || isLoadingItens || isLoadingModelos) {
    return <div className="p-4 text-center">Carregando detalhes da rota...</div>
  }
  if (error) return <div className="p-4 text-center text-red-600">Erro ao carregar rota: {error?.message}</div>
  if (!rota) return <div className="p-4 text-center">Rota não encontrada</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{rota.nome}</h1>
          <p className="text-muted-foreground">{rota.descricao}</p>
        </div>
      </div>

      {/* Informações da Rota */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Data de Entrega</p>
          <p className="text-lg font-semibold">
            {rota.dataEntrega 
              ? formatDate(rota.dataEntrega)
              : 'Não definida'
            }
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total de Entregas</p>
          <p className="text-lg font-semibold">{rota.entregas?.length || 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Entregas Concluídas</p>
          <p className="text-lg font-semibold">
            {rota.entregas?.filter(e => e.status === 'ENTREGUE').length || 0}
          </p>
        </div>
      </div>

      {/* Observações */}
      {rota.observacoes && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Observações</h3>
          <p>{rota.observacoes}</p>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-4">
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Entrega
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl" aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>Nova Entrega - {rota.nome}</DialogTitle>
              <p id="dialog-description" className="text-sm text-muted-foreground">
                Cadastre uma nova entrega para esta rota
              </p>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmitEntrega}>
              {/* Switch para usar modelo */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Usar modelo de entrega</h3>
                  <p className="text-sm text-gray-600">
                    Carregue automaticamente os itens de um modelo existente
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={usarModelo}
                    onChange={(e) => setUsarModelo(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Seleção de modelo */}
              {usarModelo && (
                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-2 border rounded-md"
                    value={modeloSelecionado}
                    onChange={(e) => setModeloSelecionado(e.target.value)}
                  >
                    <option value="">Selecione um modelo</option>
                    {modelos?.map(modelo => (
                      <option key={modelo.id} value={modelo.id}>
                        {modelo.nome} - {modelo.descricao}
                      </option>
                    ))}
                  </select>
                  <Button 
                    type="button" 
                    onClick={handleCarregarModelo}
                    disabled={!modeloSelecionado}
                  >
                    Carregar
                  </Button>
                </div>
              )}

              {/* Seleção de beneficiário */}
              <div className="space-y-2">
                <label htmlFor="beneficiario">Beneficiário *</label>
                <AutocompleteInput
                  placeholder="Digite pelo menos 1 letra para buscar beneficiários..."
                  value={selectedBeneficiario ? selectedBeneficiario.nome : ''}
                  onSearch={async (searchTerm) => {
                    if (searchTerm.length < 1) return []
                    const results = await searchBeneficiarios(searchTerm)
                    return results.map((beneficiario: Beneficiario) => ({
                      id: beneficiario.id,
                      label: beneficiario.nome,
                      sublabel: beneficiario.endereco
                    }))
                  }}
                  onSelect={(option) => {
                    if (option) {
                      setSelectedBeneficiario({ 
                        id: option.id, 
                        nome: option.label, 
                        endereco: option.sublabel || '',
                        ativo: true 
                      })
                      setFormData(prev => ({ ...prev, beneficiarioId: option.id }))
                    }
                  }}
                  isLoading={isSearchingBeneficiarios}
                />
              </div>

              {/* Itens da entrega */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Itens da Entrega</h3>
                    {isLoadingItens && <p className="text-sm text-blue-600">Carregando itens disponíveis...</p>}
                    {!isLoadingItens && Array.isArray(itens) && (
                      <p className="text-sm text-green-600">{itens.length} itens disponíveis</p>
                    )}
                  </div>
                  <Button type="button" onClick={addEntregaItem} size="sm" disabled={isLoadingItens}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {entregaItems.map((entregaItem, index) => {
                    // Filtrar itens disponíveis excluindo os já selecionados (exceto o atual)
                    const itensDisponiveis = Array.isArray(itens) ? itens.filter(item => 
                      item.id === entregaItem.itemId || // Manter o item atual selecionado
                      !entregaItems.some(ei => ei.itemId === item.id) // Excluir itens já selecionados
                    ) : []

                    return (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <select
                          className="flex-1 p-2 border rounded"
                          value={entregaItem.itemId}
                          onChange={(e) => updateEntregaItem(index, 'itemId', e.target.value)}
                        >
                          <option value="">Selecione um item</option>
                          {isLoadingItens && <option disabled>Carregando itens...</option>}
                          {!isLoadingItens && itensDisponiveis.length === 0 && (
                            <option disabled>Nenhum item disponível</option>
                          )}
                          {itensDisponiveis.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.nome} ({item.unidade})
                            </option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Qtd"
                          className="w-24"
                          value={entregaItem.quantidade}
                          onChange={(e) => updateEntregaItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeEntregaItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                  {entregaItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                    </p>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <label htmlFor="observacoes">Observações</label>
                <Input 
                  id="observacoes" 
                  placeholder="Observações sobre a entrega"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                />
              </div>

              {/* Botão de submit */}
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={createEntregaMutation.isPending}
                >
                  {createEntregaMutation.isPending ? 'Cadastrando...' : 'Confirmar Entrega'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline"
          onClick={() => updateAllEntregasStatusMutation.mutate('ENTREGUE')}
          disabled={updateAllEntregasStatusMutation.isPending}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {updateAllEntregasStatusMutation.isPending ? 'Atualizando...' : 'Marcar Todas como Entregues'}
        </Button>

        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Rota
        </Button>
      </div>

      {/* Lista de Entregas */}
      <div className="rounded-md border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Entregas desta Rota</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiário</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(rota.entregas) && rota.entregas.length > 0 ? (
              rota.entregas.map((entrega) => (
                <TableRow key={entrega.id}>
                  <TableCell className="font-medium">
                    {entrega.beneficiario.nome}
                  </TableCell>
                  <TableCell>{entrega.beneficiario.endereco}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {Array.isArray(entrega.entregaItems) && entrega.entregaItems.map((entregaItem, index) => (
                        <div key={index} className="text-sm">
                          {entregaItem.quantidade} {entregaItem.item.unidade} - {entregaItem.item.nome}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorMap[entrega.status]}`}>
                      {statusMap[entrega.status]}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {entrega.status === 'PENDENTE' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Marcar como entregue"
                        onClick={() => updateEntregaStatusMutation.mutate({ entregaId: entrega.id, status: 'ENTREGUE' })}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {entrega.status === 'ENTREGUE' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Marcar como cancelada"
                        onClick={() => updateEntregaStatusMutation.mutate({ entregaId: entrega.id, status: 'CANCELADA' })}
                      >
                        <XCircle className="h-4 w-4 text-yellow-600" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Excluir entrega"
                      onClick={() => {
                        toast((t) => (
                          <div className="flex flex-col gap-2">
                            <span>Tem certeza que deseja excluir esta entrega?</span>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  toast.dismiss(t.id);
                                  deleteEntregaMutation.mutate(entrega.id);
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
                      }}
                      disabled={deleteEntregaMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma entrega cadastrada para esta rota
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}