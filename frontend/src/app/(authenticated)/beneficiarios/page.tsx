'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { PenLine, Plus, Trash2 } from "lucide-react"

interface Beneficiario {
  id: string
  nome: string
  endereco: string
  telefone: string
  dataNascimento: string
}

export default function BeneficiariosPage() {
  const { data: beneficiarios } = useQuery<Beneficiario[]>({
    queryKey: ['beneficiarios'],
    queryFn: async () => {
      const response = await api.get('/beneficiarios')
      return response.data
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiários</h1>
          <p className="text-muted-foreground">
            Gerencie os beneficiários cadastrados no sistema
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo beneficiário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo beneficiário</DialogTitle>
            </DialogHeader>

            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nome">Nome</label>
                <Input id="nome" placeholder="Nome do beneficiário" />
              </div>

              <div className="space-y-2">
                <label htmlFor="endereco">Endereço</label>
                <Input id="endereco" placeholder="Endereço do beneficiário" />
              </div>

              <div className="space-y-2">
                <label htmlFor="telefone">Telefone</label>
                <Input id="telefone" placeholder="Telefone do beneficiário" />
              </div>

              <div className="space-y-2">
                <label htmlFor="dataNascimento">Data de nascimento</label>
                <Input id="dataNascimento" type="date" />
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
              <TableHead>Endereço</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data de nascimento</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {beneficiarios?.map((beneficiario) => (
              <TableRow key={beneficiario.id}>
                <TableCell>{beneficiario.nome}</TableCell>
                <TableCell>{beneficiario.endereco}</TableCell>
                <TableCell>{beneficiario.telefone}</TableCell>
                <TableCell>{new Date(beneficiario.dataNascimento).toLocaleDateString()}</TableCell>
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