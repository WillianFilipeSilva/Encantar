'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/axios"
import { formatDate } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { FileText, PenLine, Plus, Trash2 } from "lucide-react"

interface Entrega {
  id: string
  modeloEntrega: {
    nome: string
  }
  beneficiario: {
    nome: string
  }
  itens: Array<{
    item: {
      nome: string
    }
    quantidade: number
  }>
  dataEntrega: string
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'
}

const statusMap = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

const statusColorMap = {
  PENDENTE: 'text-yellow-500',
  EM_ANDAMENTO: 'text-blue-500',
  CONCLUIDA: 'text-green-500',
  CANCELADA: 'text-red-500',
}

export default function EntregasPage() {
  const { data: entregas } = useQuery<Entrega[]>({
    queryKey: ['entregas'],
    queryFn: async () => {
      const response = await api.get('/entregas')
      return response.data
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entregas</h1>
          <p className="text-muted-foreground">
            Gerencie as entregas dos beneficiários
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova entrega
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova entrega</DialogTitle>
            </DialogHeader>

            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="modeloEntrega">Modelo de entrega</label>
                <Input id="modeloEntrega" placeholder="Selecione o modelo de entrega" />
              </div>

              <div className="space-y-2">
                <label htmlFor="beneficiario">Beneficiário</label>
                <Input id="beneficiario" placeholder="Selecione o beneficiário" />
              </div>

              <div className="space-y-2">
                <label htmlFor="dataEntrega">Data de entrega</label>
                <Input id="dataEntrega" type="date" />
              </div>

              <Button type="submit" className="w-full">
                Cadastrar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Beneficiário</TableHead>
              <TableHead>Data de entrega</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entregas?.map((entrega) => (
              <TableRow key={entrega.id}>
                <TableCell>{entrega.modeloEntrega.nome}</TableCell>
                <TableCell>{entrega.beneficiario.nome}</TableCell>
                <TableCell>{formatDate(new Date(entrega.dataEntrega))}</TableCell>
                <TableCell>
                  <span className={statusColorMap[entrega.status]}>
                    {statusMap[entrega.status]}
                  </span>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <PenLine className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}