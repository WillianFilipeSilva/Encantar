'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Clock, Mail, Phone, UserPlus, CheckCircle, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inviteService, type InviteData } from "@/lib/services/inviteService"
import toast from 'react-hot-toast'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [formData, setFormData] = useState<InviteData>({
    email: '',
    telefone: ''
  })
  const [copied, setCopied] = useState(false)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: ['active-invite'] })
    }
  }, [isOpen, queryClient])

  const { data: activeInvite, isLoading, refetch } = useQuery({
    queryKey: ['active-invite'],
    queryFn: inviteService.getActiveInvite,
    enabled: isOpen,
    refetchInterval: 10000,
    staleTime: 0,
  })

  const createInviteMutation = useMutation({
    mutationFn: inviteService.createInvite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['active-invite'] })
      toast.success('Convite criado com sucesso!')
      setFormData({ email: '', telefone: '' })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erro ao criar convite'
      toast.error(message)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email?.trim() && !formData.telefone?.trim()) {
      toast.error('Informe pelo menos o email OU telefone para validação')
      return
    }

    createInviteMutation.mutate(formData)
  }

  const handleCopyLink = async () => {
    if (!activeInvite) return

    const inviteLink = inviteService.generateInviteLink(activeInvite.token)
    
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success('Link copiado para a área de transferência!')
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Erro ao copiar link')
    }
  }

  const getTimeRemaining = () => {
    if (!activeInvite) return null

    const now = new Date()
    const expires = new Date(activeInvite.expiraEm)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) {
      queryClient.invalidateQueries({ queryKey: ['active-invite'] })
      return 'Expirado'
    }

    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Novo Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Verificando convites...</span>
            </div>
          ) : activeInvite ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Convite Ativo</span>
                  <Button
                    onClick={() => refetch()}
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs px-2 py-1 h-6"
                  >
                    🔄 Atualizar
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Clock className="h-4 w-4" />
                  <span>Expira em: {getTimeRemaining()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Link do Convite:</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteService.generateInviteLink(activeInvite.token)}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Compartilhe este link com a pessoa que você deseja convidar. 
                O convite expira em 15 minutos.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Validação de Segurança:</strong> Informe o email OU telefone da pessoa. 
                  Ela precisará confirmar esses dados ao se cadastrar.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email da pessoa
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone da pessoa
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                ℹ️ Preencha <strong>pelo menos um campo</strong> (email OU telefone). A pessoa precisará confirmar esses dados no cadastro.
              </p>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={createInviteMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createInviteMutation.isPending}
                >
                  {createInviteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Convite
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}