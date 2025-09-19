'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/axios"
import { formatCurrency } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { PenLine, Plus, Trash2 } from "lucide-react"

interface Item {
  id: string
  nome: string
  descricao: string
  preco: number
  quantidade: number
}

export default function ItensPage() {
  const { data: itens } = useQuery<Item[]>({
    queryKey: ['itens'],
    queryFn: async () => {
      const response = await api.get('/itens')
      return response.data
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Itens</h1>
          <p className="text-muted-foreground">
            Gerencie os itens disponíveis para entrega
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo item</DialogTitle>
            </DialogHeader>

            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nome">Nome</label>
                <Input id="nome" placeholder="Nome do item" />
              </div>

              <div className="space-y-2">
                <label htmlFor="descricao">Descrição</label>
                <Input id="descricao" placeholder="Descrição do item" />
              </div>

              <div className="space-y-2">
                <label htmlFor="preco">Preço</label>
                <Input id="preco" type="number" step="0.01" min="0" placeholder="Preço do item" />
              </div>

              <div className="space-y-2">
                <label htmlFor="quantidade">Quantidade</label>
                <Input id="quantidade" type="number" min="0" placeholder="Quantidade em estoque" />
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
              <TableHead>Descrição</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>{formatCurrency(item.preco)}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
                <TableCell className="flex items-center gap-2">
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