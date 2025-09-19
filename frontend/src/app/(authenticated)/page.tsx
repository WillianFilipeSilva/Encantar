'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"

interface DashboardData {
  totalBeneficiarios: number
  totalEntregas: number
  totalRotas: number
  entregasPorStatus: {
    status: string
    total: number
  }[]
  entregasRecentes: Array<{
    id: string
    beneficiario: {
      nome: string
    }
    modeloEntrega: {
      nome: string
    }
    status: string
    dataEntrega: string
  }>
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

export default function DashboardPage() {
  const { data } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard')
      return response.data
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas atividades
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Beneficiários</p>
          <p className="mt-2 text-3xl font-bold">{data?.totalBeneficiarios}</p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Entregas</p>
          <p className="mt-2 text-3xl font-bold">{data?.totalEntregas}</p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Rotas</p>
          <p className="mt-2 text-3xl font-bold">{data?.totalRotas}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-medium">Entregas por status</h2>

          <div className="mt-4 space-y-2">
            {data?.entregasPorStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={statusColorMap[item.status as keyof typeof statusColorMap]}>
                  {statusMap[item.status as keyof typeof statusMap]}
                </span>
                <span>{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-medium">Entregas recentes</h2>

          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beneficiário</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.entregasRecentes.map((entrega) => (
                  <TableRow key={entrega.id}>
                    <TableCell>{entrega.beneficiario.nome}</TableCell>
                    <TableCell>{entrega.modeloEntrega.nome}</TableCell>
                    <TableCell>
                      <span className={statusColorMap[entrega.status as keyof typeof statusColorMap]}>
                        {statusMap[entrega.status as keyof typeof statusMap]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}