"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableTableHead } from "@/components/SortableTableHead";
import { PaginationControls } from "@/components/PaginationControls";
import { ConfirmDialog, useConfirmDialog } from "@/components/ConfirmDialog";
import { usePagination } from "@/hooks/usePagination";
import { api } from "@/lib/axios";
import { logError } from "@/lib/errorUtils";
import { showErrorToast } from "@/components/ErrorToast";
import { PenLine, Plus, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const dynamic = 'force-dynamic';

interface Beneficiario {
  id: string;
  nome: string;
  endereco: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: string;
  observacoes?: string;
  ativo: boolean;
}

export default function BeneficiariosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBeneficiario, setEditingBeneficiario] =
    useState<Beneficiario | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    cpf: "",
    dataNascimento: "",
    observacoes: "",
  });

  const queryClient = useQueryClient();

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const {
    data,
    pagination,
    params,
    setPage,
    setSearch,
    setLimit,
    setFilters,
    setSortBy,
    isLoading,
    error,
    refresh,
  } = usePagination<Beneficiario>("/beneficiarios", { sortBy: 'nome', sortOrder: 'asc' });

  const filterConfig = [
    {
      key: "ativo",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "Todos" },
        { value: "true", label: "Ativos" },
        { value: "false", label: "Inativos" },
      ],
      defaultValue: "true",
    },
  ];

  const createBeneficiarioMutation = useMutation({
    mutationFn: async (newBeneficiario: {
      nome: string;
      endereco: string;
      telefone?: string;
      cpf?: string;
      dataNascimento?: string;
      observacoes?: string;
    }) => {
      const cleanData = {
        nome: newBeneficiario.nome,
        endereco: newBeneficiario.endereco,
        telefone: newBeneficiario.telefone?.trim() || undefined,
        cpf: newBeneficiario.cpf?.replace(/\D/g, "") || undefined,
        dataNascimento: newBeneficiario.dataNascimento?.trim() || undefined,
        observacoes: newBeneficiario.observacoes?.trim() || undefined,
      };

      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key as keyof typeof cleanData] === undefined) {
          delete cleanData[key as keyof typeof cleanData];
        }
      });

      const response = await api.post("/beneficiarios", cleanData);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/beneficiarios"] });
      setFormData({
        nome: "",
        endereco: "",
        telefone: "",
        cpf: "",
        dataNascimento: "",
        observacoes: "",
      });
      setDialogOpen(false);
      toast.success("Beneficiário cadastrado com sucesso!");
    },
    onError: (error: any) => {
      logError("CriarBeneficiario", error);
      showErrorToast("Erro ao cadastrar beneficiário", error);
    },
  });

  const updateBeneficiarioMutation = useMutation({
    mutationFn: async (updatedBeneficiario: {
      id: string;
      nome: string;
      endereco: string;
      telefone?: string;
      cpf?: string;
      dataNascimento?: string;
      observacoes?: string;
    }) => {
      const { id, ...data } = updatedBeneficiario;

      const cleanData = {
        nome: data.nome,
        endereco: data.endereco,
        telefone: data.telefone?.trim() || undefined,
        cpf: data.cpf?.replace(/\D/g, "") || undefined,
        dataNascimento: data.dataNascimento?.trim() || undefined,
        observacoes: data.observacoes?.trim() || undefined,
      };

      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key as keyof typeof cleanData] === undefined) {
          delete cleanData[key as keyof typeof cleanData];
        }
      });

      const response = await api.put(`/beneficiarios/${id}`, cleanData);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/beneficiarios"] });
      setFormData({
        nome: "",
        endereco: "",
        telefone: "",
        cpf: "",
        dataNascimento: "",
        observacoes: "",
      });
      setEditingBeneficiario(null);
      setDialogOpen(false);
      toast.success("Beneficiário atualizado com sucesso!");
    },
    onError: (error: any) => {
      logError("AtualizarBeneficiario", error);
      showErrorToast("Erro ao atualizar beneficiário", error);
    },
  });

  const toggleBeneficiarioStatusMutation = useMutation({
    mutationFn: async ({
      beneficiarioId,
      ativo,
    }: {
      beneficiarioId: string;
      ativo: boolean;
    }) => {
      const response = await api.put(`/beneficiarios/${beneficiarioId}`, {
        ativo,
      });
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["/beneficiarios"] });
      toast.success(
        `Beneficiário ${variables.ativo ? "ativado" : "inativado"} com sucesso!`
      );
    },
    onError: (error: any) => {
      logError("AlterarStatusBeneficiario", error);
      showErrorToast("Erro ao alterar status do beneficiário", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (formData.nome.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return;
    }
    if (formData.nome.trim().length > 100) {
      toast.error("Nome deve ter no máximo 100 caracteres");
      return;
    }
    if (!formData.endereco.trim()) {
      toast.error("Endereço é obrigatório");
      return;
    }
    if (formData.endereco.trim().length <= 5) {
      toast.error("Endereço deve ter mais de 5 caracteres");
      return;
    }
    if (
      formData.telefone &&
      (formData.telefone.trim().length < 10 ||
        formData.telefone.trim().length > 15)
    ) {
      toast.error("Telefone deve ter entre 10 e 15 caracteres");
      return;
    }
    if (formData.cpf && formData.cpf.trim()) {
      const cpfLimpo = formData.cpf.replace(/\D/g, "");
      if (cpfLimpo.length !== 11) {
        toast.error("CPF deve ter 11 dígitos");
        return;
      }
    }
    if (formData.observacoes && formData.observacoes.trim().length > 2000) {
      toast.error("Observações deve ter no máximo 2000 caracteres");
      return;
    }

    if (formData.dataNascimento) {
      const dataNascimento = new Date(formData.dataNascimento);
      const hoje = new Date();

      if (dataNascimento > hoje) {
        toast.error("Data de nascimento não pode ser no futuro");
        return;
      }

      const idade = hoje.getFullYear() - dataNascimento.getFullYear();
      if (idade > 120) {
        toast.error("Data de nascimento inválida");
        return;
      }
    }

    if (editingBeneficiario) {
      updateBeneficiarioMutation.mutate({
        ...formData,
        id: editingBeneficiario.id,
      });
    } else {
      createBeneficiarioMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (beneficiario: Beneficiario) => {
    setEditingBeneficiario(beneficiario);
    setFormData({
      nome: beneficiario.nome,
      endereco: beneficiario.endereco,
      telefone: beneficiario.telefone || "",
      cpf: beneficiario.cpf || "",
      dataNascimento: beneficiario.dataNascimento || "",
      observacoes: beneficiario.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = (beneficiario: Beneficiario) => {
    const newStatus = !beneficiario.ativo;
    const action = newStatus ? "ativar" : "inativar";

    setConfirmDialog({
      open: true,
      title: `${newStatus ? "Ativar" : "Inativar"} Beneficiário`,
      description: `Tem certeza que deseja ${action} o beneficiário "${beneficiario.nome}"?`,
      onConfirm: () => {
        toggleBeneficiarioStatusMutation.mutate({
          beneficiarioId: beneficiario.id,
          ativo: newStatus,
        });
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBeneficiario(null);
    setFormData({
      nome: "",
      endereco: "",
      telefone: "",
      cpf: "",
      dataNascimento: "",
      observacoes: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiários</h1>
          <p className="text-muted-foreground">
            Gerencie os beneficiários cadastrados no sistema
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            setDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button title="Cadastrar novo beneficiário" aria-label="Cadastrar novo beneficiário">
              <Plus className="mr-2 h-4 w-4" title="Novo beneficiário" aria-hidden="true" />
              Novo beneficiário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBeneficiario
                  ? "Editar beneficiário"
                  : "Novo beneficiário"}
              </DialogTitle>
              <DialogDescription>
                {editingBeneficiario
                  ? "Altere os dados do beneficiário conforme necessário"
                  : "Preencha os dados para cadastrar um novo beneficiário no sistema"}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="nome">Nome *</label>
                <Input
                  id="nome"
                  placeholder="Nome do beneficiário"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endereco">Endereço *</label>
                <Input
                  id="endereco"
                  placeholder="Endereço completo"
                  value={formData.endereco}
                  onChange={(e) =>
                    handleInputChange("endereco", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="telefone">Telefone</label>
                <Input
                  id="telefone"
                  placeholder="Telefone para contato"
                  value={formData.telefone}
                  onChange={(e) =>
                    handleInputChange("telefone", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cpf">CPF</label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) =>
                    handleInputChange("dataNascimento", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="observacoes">Observações</label>
                <Input
                  id="observacoes"
                  placeholder="Observações adicionais"
                  value={formData.observacoes}
                  onChange={(e) =>
                    handleInputChange("observacoes", e.target.value)
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  createBeneficiarioMutation.isPending ||
                  updateBeneficiarioMutation.isPending
                }
              >
                {editingBeneficiario
                  ? updateBeneficiarioMutation.isPending
                    ? "Atualizando..."
                    : "Atualizar beneficiário"
                  : createBeneficiarioMutation.isPending
                  ? "Cadastrando..."
                  : "Cadastrar beneficiário"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <PaginationControls
        pagination={pagination}
        searchValue={params.search}
        filterValues={params}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, observações, endereço, telefone ou CPF..."
        isLoading={isLoading}
        filters={filterConfig}
        onFiltersChange={setFilters}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                field="nome"
                currentSortBy={params.sortBy}
                currentSortOrder={params.sortOrder}
                onSort={setSortBy}
              >
                Nome
              </SortableTableHead>
              <SortableTableHead
                field="endereco"
                currentSortBy={params.sortBy}
                currentSortOrder={params.sortOrder}
                onSort={setSortBy}
              >
                Endereço
              </SortableTableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando beneficiários...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-red-600">
                    Erro ao carregar beneficiários:{" "}
                    {error?.message || "Erro desconhecido"}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {params.search
                    ? "Nenhum beneficiário encontrado para a busca."
                    : "Nenhum beneficiário cadastrado."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((beneficiario) => (
                <TableRow key={beneficiario.id}>
                  <TableCell className="font-medium">
                    {beneficiario.nome}
                  </TableCell>
                  <TableCell>{beneficiario.endereco}</TableCell>
                  <TableCell>{beneficiario.telefone || "-"}</TableCell>
                  <TableCell>{beneficiario.cpf || "-"}</TableCell>
                  <TableCell
                    className="max-w-xs truncate"
                    title={beneficiario.observacoes || ""}
                  >
                    {beneficiario.observacoes || "-"}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={`Editar beneficiário ${beneficiario.nome}`}
                      aria-label={`Editar beneficiário ${beneficiario.nome}`}
                      onClick={() => handleEdit(beneficiario)}
                    >
                      <PenLine className="h-4 w-4" title="Editar" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={
                        beneficiario.ativo
                          ? "Inativar beneficiário"
                          : "Ativar beneficiário"
                      }
                      aria-label={
                        beneficiario.ativo
                          ? `Inativar beneficiário ${beneficiario.nome}`
                          : `Ativar beneficiário ${beneficiario.nome}`
                      }
                      onClick={() => handleToggleStatus(beneficiario)}
                      disabled={toggleBeneficiarioStatusMutation.isPending}
                      className={
                        beneficiario.ativo
                          ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                          : "text-green-600 hover:text-green-800 hover:bg-green-50"
                      }
                    >
                      {beneficiario.ativo ? (
                        <UserX className="h-4 w-4" title="Inativar" aria-hidden="true" />
                      ) : (
                        <UserCheck className="h-4 w-4" title="Ativar" aria-hidden="true" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={confirmDialog.onConfirm}
        loading={toggleBeneficiarioStatusMutation.isPending}
      />
    </div>
  );
}
