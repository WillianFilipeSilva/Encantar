'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, X } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'danger',
  onConfirm,
  loading = false
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="h-8 w-8 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />
      default:
        return <AlertTriangle className="h-8 w-8 text-blue-500" />
    }
  }

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive'
      case 'warning':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            {getIcon()}
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-3 justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-6"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            disabled={loading}
            className="px-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processando...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'

interface UseConfirmDialogProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

export function useConfirmDialog({
  title,
  description,
  confirmText,
  cancelText,
  variant
}: UseConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)

  const openDialog = (callback: () => void) => {
    setOnConfirmCallback(() => callback)
    setOpen(true)
  }

  const handleConfirm = async () => {
    if (onConfirmCallback) {
      setLoading(true)
      try {
        await onConfirmCallback()
      } finally {
        setLoading(false)
        setOpen(false)
        setOnConfirmCallback(null)
      }
    }
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
      onConfirm={handleConfirm}
      loading={loading}
    />
  )

  return {
    openDialog,
    ConfirmDialogComponent,
    isOpen: open,
    isLoading: loading
  }
}