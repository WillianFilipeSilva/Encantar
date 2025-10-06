'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle, UserPlus, Loader2, Lock, Mail, User } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { inviteService } from "@/lib/services/inviteService"
import { useAuth } from "@/hooks/useAuth"
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const { login } = useAuth()
  
  const token = params.token as string

  const [formData, setFormData] = useState({
    nome: '',
    login: '',
    senha: '',
    confirmarSenha: '',
    emailValidacao: '',
    telefoneValidacao: ''
  })

  // Query para validar o convite
  const { data: inviteData, isLoading: isValidating, error } = useQuery({
    queryKey: ['validate-invite', token],
    queryFn: () => inviteService.validateInvite(token),
    enabled: !!token,
    retry: false,
  })

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: (data: {
      nome: string
      login: string
      senha: string
      token: string
      emailValidacao?: string
      telefoneValidacao?: string
    }) => inviteService.register(data),
    onSuccess: (result) => {
      // Salvar token no localStorage e redirecionar
      localStorage.setItem('@encantar:token', result.accessToken)
      localStorage.setItem('@encantar:refresh-token', result.refreshToken)
      
      login(result.user, result.accessToken, result.refreshToken)

      toast.success('Cadastro realizado com sucesso!')
      router.push('/dashboard')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erro ao realizar cadastro'
      toast.error(message)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (formData.login.length < 3) {
      toast.error('Login deve ter pelo menos 3 caracteres')
      return
    }

    if (formData.senha.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast.error('Senhas não coincidem')
      return
    }

    // Validações de segurança (email/telefone)
    if (inviteData?.email && !formData.emailValidacao.trim()) {
      toast.error('Email de validação é obrigatório')
      return
    }

    if (inviteData?.telefone && !formData.telefoneValidacao.trim()) {
      toast.error('Telefone de validação é obrigatório')
      return
    }

    registerMutation.mutate({
      nome: formData.nome,
      login: formData.login,
      senha: formData.senha,
      token,
      emailValidacao: formData.emailValidacao || undefined,
      telefoneValidacao: formData.telefoneValidacao || undefined
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
            <p className="text-muted-foreground">Validando convite...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image 
                src="/logo.png" 
                alt="Encantar" 
                width={60} 
                height={60}
                className="object-contain"
              />
            </div>
            <CardTitle className="text-red-600">Convite Inválido</CardTitle>
            <CardDescription>
              Este convite não é válido ou já expirou
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {(error as any)?.response?.data?.error || 'Convite não encontrado ou expirado'}
                </span>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full mt-4"
              variant="outline"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="Encantar" 
              width={60} 
              height={60}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Você foi convidado por <strong>{inviteData.enviadoPor}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                Convite válido! Preencha os dados abaixo para criar sua conta.
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome completo
              </Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Login
              </Label>
              <Input
                id="login"
                type="text"
                placeholder="Escolha um login"
                value={formData.login}
                onChange={(e) => handleInputChange('login', e.target.value)}
                required
                minLength={3}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 3 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder="Crie uma senha"
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmarSenha}
                onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                required
              />
            </div>

            {/* Campos de validação de segurança */}
            {(inviteData?.email || inviteData?.telefone) && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800">
                  Validação de Segurança
                </div>
                <p className="text-xs text-blue-700">
                  Para sua segurança, confirme os dados associados ao convite:
                </p>
                
                {inviteData.email && (
                  <div className="space-y-2">
                    <Label htmlFor="emailValidacao" className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      Email do convite
                    </Label>
                    <Input
                      id="emailValidacao"
                      type="email"
                      placeholder="Digite o email usado no convite"
                      value={formData.emailValidacao}
                      onChange={(e) => handleInputChange('emailValidacao', e.target.value)}
                      required
                    />
                  </div>
                )}
                
                {inviteData.telefone && (
                  <div className="space-y-2">
                    <Label htmlFor="telefoneValidacao" className="text-sm">
                      Telefone do convite
                    </Label>
                    <Input
                      id="telefoneValidacao"
                      type="tel"
                      placeholder="Digite o telefone usado no convite"
                      value={formData.telefoneValidacao}
                      onChange={(e) => handleInputChange('telefoneValidacao', e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar conta
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => router.push('/login')}
              className="text-sm"
            >
              Já tem uma conta? Fazer login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}