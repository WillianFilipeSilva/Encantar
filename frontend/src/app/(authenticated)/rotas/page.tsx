'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/axios"
import { formatDate } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Map, PenLine, Plus, Trash2 } from "lucide-react"

interface Rota {
  id: string
  nome: string
  dataEntrega: string
  entregas: Array<{
    id: string
    beneficiario: {
      nome: string
      endereco: string
    }
  }>
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

export default function RotasPage() {
  const { data: rotas } = useQuery<Rota[]>({
    queryKey: ['rotas'],
    queryFn: async () => {
      const response = await api.get('/rotas')
      return response.data
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rotas</h1>
          <p className="text-muted-foreground">
            Gerencie as rotas de entrega
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova rota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova rota</DialogTitle>
            </DialogHeader>

            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nome">Nome</label>
                <Input id="nome" placeholder="Nome da rota" />
              </div>

              <div className="space-y-2">
                <label htmlFor="dataEntrega">Data de entrega</label>
                <Input id="dataEntrega" type="date" />
              </div>

              <div className="space-y-2">
                <label htmlFor="entregas">Entregas</label>
                <Input id="entregas" placeholder="Selecione as entregas" />
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
              <TableHead>Nome</TableHead>
              <TableHead>Data de entrega</TableHead>
              <TableHead>Quantidade de entregas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rotas?.map((rota) => (
              <TableRow key={rota.id}>
                <TableCell>{rota.nome}</TableCell>
                <TableCell>{formatDate(new Date(rota.dataEntrega))}</TableCell>
                <TableCell>{rota.entregas.length}</TableCell>
                <TableCell>
                  <span className={statusColorMap[rota.status]}>
                    {statusMap[rota.status]}
                  </span>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Map className="h-4 w-4" />
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