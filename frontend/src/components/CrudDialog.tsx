'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import toast from "react-hot-toast"
import { ReactNode, useState } from "react"

interface CrudDialogProps<T> {
  title: string
  endpoint: string
  children: (params: {
    formData: T
    setFormData: (updater: (prev: T) => T) => void
    isSubmitting: boolean
  }) => ReactNode
  initialData: T
  editingItem: any | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  setEditingItem: (item: any | null) => void
  onSuccess?: () => void
  refreshData: () => void
  buttonLabel?: string
  buttonIcon?: ReactNode
  setPage?: (page: number) => void 
}

export function CrudDialog<T extends Record<string, any>>({
  title,
  endpoint,
  children,
  initialData,
  editingItem,
  dialogOpen,
  setDialogOpen,
  setEditingItem,
  onSuccess,
  refreshData,
  buttonLabel = "Novo item",
  buttonIcon,
  setPage
}: CrudDialogProps<T>) {
  const [formData, setFormData] = useState<T>(initialData)
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (newItem: T) => {
      const response = await api.post(endpoint, newItem)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: [endpoint],
      })
      
      await queryClient.refetchQueries({
        queryKey: [endpoint],
        exact: false
      })
      
      // Volta para página 1 se função setPage for fornecida (apenas para CREATE)
      if (setPage) {
        setPage(1)
      }
      resetForm()
      setDialogOpen(false)
      toast.success(`Item cadastrado com sucesso`)
      if (onSuccess) onSuccess()
    },
    onError: (error: any) => {
      console.error(`Erro ao criar item:`, error)
      toast.error(`Erro ao cadastrar: ${error.response?.data?.message || error.message}`)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (updatedItem: T & { id: string }) => {
      const { id, ...data } = updatedItem
      const response = await api.put(`${endpoint}/${id}`, data)
      return response.data
    },
    onSuccess: async () => {
      // FORÇA invalidação e refetch para UPDATE
      await queryClient.invalidateQueries({ 
        queryKey: [endpoint],
        exact: false,
        refetchType: 'all'
      })
      
      await queryClient.refetchQueries({
        queryKey: [endpoint],
        exact: false
      })
      
      resetForm()
      setEditingItem(null)
      setDialogOpen(false)
      toast.success(`Item atualizado com sucesso`)
      if (onSuccess) onSuccess()
    },
    onError: (error: any) => {
      console.error(`Erro ao atualizar item:`, error)
      toast.error(`Erro ao atualizar: ${error.response?.data?.message || error.message}`)
    }
  })

  const resetForm = () => {
    setFormData(initialData)
    setEditingItem(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    resetForm()
  }

  const handleFormDataChange = (updater: (prev: T) => T) => {
    setFormData(updater)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingItem) {
      updateMutation.mutate({ ...formData, id: editingItem.id } as T & { id: string })
    } else {
      createMutation.mutate(formData)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
      <DialogTrigger asChild>
        <Button onClick={() => setDialogOpen(true)}>
          {buttonIcon}
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>{editingItem ? `Editar ${title}` : `Novo ${title}`}</DialogTitle>
          <p id="dialog-description" className="text-sm text-muted-foreground">
            {editingItem 
              ? `Altere os dados do ${title.toLowerCase()} conforme necessário` 
              : `Preencha os dados para cadastrar um novo ${title.toLowerCase()} no sistema`
            }
          </p>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {children({ 
            formData, 
            setFormData: handleFormDataChange,
            isSubmitting
          })}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {editingItem 
              ? (updateMutation.isPending ? 'Atualizando...' : `Atualizar ${title.toLowerCase()}`)
              : (createMutation.isPending ? 'Cadastrando...' : `Cadastrar ${title.toLowerCase()}`)
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}