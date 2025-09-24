'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
}

interface Item {
  id: string
  nome: string
  descricao: string
  unidade: string
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
  const [salvarComoModelo, setSalvarComoModelo] = useState(false)
  const [nomeModelo, setNomeModelo] = useState('')
  const [usarModelo, setUsarModelo] = useState(false)
  const [modeloSelecionado, setModeloSelecionado] = useState<string>('')
  const [itemsSelecionados, setItemsSelecionados] = useState<Array<{id: string, quantidade: number}>>([])

  const { data: rota, isLoading, error } = useQuery<RotaDetalhes>({
    queryKey: ['rota', params.id],
    queryFn: async () => {
      const response = await api.get(`/rotas/${params.id}`)
      console.log('Dados da rota recebidos:', response.data)
      return response.data.data || response.data
    }
  })

  const { data: beneficiarios } = useQuery<Beneficiario[]>({
    queryKey: ['beneficiarios'],
    queryFn: async () => {
      const response = await api.get('/beneficiarios?page=1&limit=1000')
      return response.data.data || response.data
    }
  })

  const { data: itens } = useQuery<Item[]>({
    queryKey: ['itens'],
    queryFn: async () => {
      try {
        // Corrigindo o endpoint para listar todos os itens
        const response = await api.get('/items?page=1&limit=1000')
        console.log('Dados de itens recebidos:', response.data)
        return response.data.data || response.data
      } catch (error) {
        console.error('Erro ao buscar itens:', error)
        throw error
      }
    }
  })

  const { data: modelos } = useQuery<ModeloEntrega[]>({
    queryKey: ['modelos'],
    queryFn: async () => {
      const response = await api.get('/modelos-entrega?page=1&limit=1000')
      return response.data.data || response.data
    }
  })

  // Mutations para CRUD de entregas
  const createEntregaMutation = useMutation({
    mutationFn: async (newEntrega: any) => {
      const response = await api.post('/entregas', {
        ...newEntrega,
        rotaId: params.id
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rota', params.id] })
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
      queryClient.invalidateQueries({ queryKey: ['rota', params.id] })
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
      queryClient.invalidateQueries({ queryKey: ['rota', params.id] })
      toast.success('Entrega excluída com sucesso!', {
        duration: 3000,
      })
    },
    onError: (error: any) => {
      logError('ExcluirEntrega', error)
      showErrorToast('Erro ao excluir entrega', error)
    }
  })

  // Inicializar itemsSelecionados quando itens carregarem
  useEffect(() => {
    if (itens && itemsSelecionados.length === 0) {
      setItemsSelecionados(itens.map(item => ({ id: item.id, quantidade: 0 })))
    }
  }, [itens, itemsSelecionados.length])

  const resetForm = () => {
    setFormData({ beneficiarioId: '', observacoes: '' })
    setSalvarComoModelo(false)
    setNomeModelo('')
    setUsarModelo(false)
    setModeloSelecionado('')
    if (itens) {
      setItemsSelecionados(itens.map(item => ({ id: item.id, quantidade: 0 })))
    }
  }

  const handleSubmitEntrega = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.beneficiarioId) {
      toast.error('Selecione um beneficiário')
      return
    }

    const itensComQuantidade = itemsSelecionados.filter(item => item.quantidade > 0)
    if (itensComQuantidade.length === 0) {
      toast.error('Adicione pelo menos um item com quantidade')
      return
    }

    const entregaData = {
      beneficiarioId: formData.beneficiarioId,
      observacoes: formData.observacoes,
      items: itensComQuantidade.map(item => ({
        itemId: item.id,
        quantidade: item.quantidade
      }))
    }

    createEntregaMutation.mutate(entregaData)
  }

  const handleCarregarModelo = () => {
    const modelo = modelos?.find(m => m.id === modeloSelecionado)
    if (modelo) {
      setItemsSelecionados(prev => 
        prev.map(item => {
          const modeloItem = modelo.modeloItems.find(mi => mi.item.id === item.id)
          return {
            ...item,
            quantidade: modeloItem ? modeloItem.quantidade : 0
          }
        })
      )
      toast.success('Modelo carregado com sucesso!')
    }
  }

  const updateQuantidade = (itemId: string, quantidade: number) => {
    setItemsSelecionados(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantidade: Math.max(0, quantidade) } : item
      )
    )
  }

  const alterarStatusTodasEntregas = async (novoStatus: string) => {
    try {
      await api.patch(`/rotas/${params.id}/entregas/status`, { status: novoStatus })
      // Refetch dos dados
    } catch (error) {
      console.error('Erro ao alterar status das entregas:', error)
    }
  }

  if (isLoading) return <div className="p-4 text-center">Carregando detalhes da rota...</div>
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
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.beneficiarioId}
                  onChange={(e) => setFormData(prev => ({ ...prev, beneficiarioId: e.target.value }))}
                  required
                >
                  <option value="">Selecione o beneficiário</option>
                  {beneficiarios?.map(beneficiario => (
                    <option key={beneficiario.id} value={beneficiario.id}>
                      {beneficiario.nome} - {beneficiario.endereco}
                    </option>
                  ))}
                </select>
              </div>

              {/* Itens da entrega */}
              <div className="space-y-2">
                <label>Itens da Entrega</label>
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead className="w-32">Quantidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens?.map(itemData => {
                        const itemSelecionado = itemsSelecionados.find(i => i.id === itemData.id)
                        return (
                          <TableRow key={itemData.id}>
                            <TableCell className="font-medium">{itemData.nome}</TableCell>
                            <TableCell>{itemData.unidade}</TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.1"
                                placeholder="0"
                                className="w-full"
                                value={itemSelecionado?.quantidade || 0}
                                onChange={(e) => updateQuantidade(itemData.id, parseFloat(e.target.value) || 0)}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
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

              {/* Salvar como modelo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="salvarModelo"
                    checked={salvarComoModelo}
                    onChange={(e) => setSalvarComoModelo(e.target.checked)}
                  />
                  <label 
                    htmlFor="salvarModelo" 
                    className="text-sm font-medium cursor-pointer"
                    title="Marcando esta opção os itens e quantidades serão salvos como modelos padrões"
                  >
                    Salvar como modelo
                  </label>
                </div>
                <Button 
                  type="submit"
                  disabled={createEntregaMutation.isPending}
                >
                  {createEntregaMutation.isPending ? 'Cadastrando...' : 'Confirmar Entrega'}
                </Button>
              </div>

              {salvarComoModelo && (
                <div className="space-y-2">
                  <label htmlFor="nomeModelo">Nome do modelo</label>
                  <Input 
                    id="nomeModelo" 
                    placeholder="Ex: Cesta Básica Padrão"
                    value={nomeModelo}
                    onChange={(e) => setNomeModelo(e.target.value)}
                  />
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline"
          onClick={() => alterarStatusTodasEntregas('ENTREGUE')}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Marcar Todas como Entregues
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
            {rota.entregas?.length > 0 ? (
              rota.entregas?.map((entrega) => (
                <TableRow key={entrega.id}>
                  <TableCell className="font-medium">
                    {entrega.beneficiario.nome}
                  </TableCell>
                  <TableCell>{entrega.beneficiario.endereco}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {entrega.entregaItems?.map((entregaItem, index) => (
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
                        title="Marcar como pendente"
                        onClick={() => updateEntregaStatusMutation.mutate({ entregaId: entrega.id, status: 'PENDENTE' })}
                      >
                        <XCircle className="h-4 w-4 text-yellow-600" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Excluir entrega"
                      onClick={() => {
                        // Substituindo window.confirm por toast com confirmação
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