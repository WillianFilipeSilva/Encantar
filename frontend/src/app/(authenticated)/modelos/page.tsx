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

export const dynamic = 'force-dynamic';
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
import { PenLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ModeloAtendimento {
  id: string;
  nome: string;
  descricao?: string;
  modeloItems: Array<{
    id: string;
    quantidade: number;
    item: {
      id: string;
      nome: string;
      unidade: string;
    };
  }>;
}

interface Item {
  id: string;
  nome: string;
  unidade: "KG" | "G" | "L" | "ML" | "UN" | "CX" | "PCT" | "LATA";
}

interface ModeloItem {
  itemId: string;
  quantidade: number;
}

export default function ModelosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<ModeloAtendimento | null>(
    null
  );
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  });
  const [modeloItems, setModeloItems] = useState<ModeloItem[]>([]);

  const queryClient = useQueryClient();

  const {
    openDialog: openDeleteDialog,
    ConfirmDialogComponent: DeleteConfirmDialog,
    isLoading: isDeleting,
  } = useConfirmDialog({
    title: "Excluir Modelo",
    description:
      "Esta ação não pode ser desfeita. O modelo e todos os seus itens serão removidos permanentemente.",
    confirmText: "Sim, excluir",
    cancelText: "Cancelar",
    variant: "danger",
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
  } = usePagination<ModeloAtendimento>("/modelos-atendimento", { sortBy: 'nome', sortOrder: 'asc' });

  const filterConfig: any[] = [];

  const {
    data: itensDisponiveis = [],
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery<Item[]>({
    queryKey: ["items-ativos-for-models"],
    queryFn: async () => {
      try {
        console.log("Buscando itens ativos...");
        const response = await api.get("/items/active?page=1&limit=100");
        console.log("Resposta da API:", response.data);

        if (response.data && response.data.data) {
          return Array.isArray(response.data.data) ? response.data.data : [];
        } else {
          return [];
        }
      } catch (error: any) {
        console.error("Erro ao buscar itens ativos:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (itemsError) {
      console.error("Erro ao carregar itens:", itemsError);
    }
  }, [itemsError]);

  const createModeloMutation = useMutation({
    mutationFn: async (newModelo: any) => {
      const response = await api.post("/modelos-atendimento", newModelo);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["/modelos-atendimento"],
      });
      setPage(1);
      resetForm();
      setDialogOpen(false);
      toast.success("Modelo de atendimento cadastrado com sucesso!");
    },
    onError: (error: any) => {
      logError("CriarModelo", error);
      showErrorToast("Erro ao cadastrar modelo", error);
    },
  });

  const updateModeloMutation = useMutation({
    mutationFn: async (updatedModelo: any) => {
      const { id, ...data } = updatedModelo;
      const response = await api.put(`/modelos-atendimento/${id}`, data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["/modelos-atendimento"],
      });
      resetForm();
      setEditingModelo(null);
      setDialogOpen(false);
      toast.success("Modelo de atendimento atualizado com sucesso!");
    },
    onError: (error: any) => {
      logError("AtualizarModelo", error);
      showErrorToast("Erro ao atualizar modelo", error);
    },
  });

  const deleteModeloMutation = useMutation({
    mutationFn: async (modeloId: string) => {
      const response = await api.delete(`/modelos-atendimento/${modeloId}`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["/modelos-atendimento"],
      });
      toast.success("Modelo de atendimento excluído com sucesso!");
    },
    onError: (error: any) => {
      logError("ExcluirModelo", error);
      showErrorToast("Erro ao excluir modelo", error);
    },
  });

  const resetForm = () => {
    setFormData({ nome: "", descricao: "" });
    setModeloItems([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error("Nome do modelo é obrigatório");
      return;
    }

    if (formData.nome.trim().length < 3) {
      toast.error("Nome deve ter pelo menos 3 caracteres");
      return;
    }

    if (formData.nome.trim().length > 100) {
      toast.error("Nome deve ter no máximo 100 caracteres");
      return;
    }

    if (formData.descricao && formData.descricao.trim().length > 2000) {
      toast.error("Descrição deve ter no máximo 2000 caracteres");
      return;
    }

    if (modeloItems.length === 0) {
      toast.error("O modelo deve ter pelo menos um item");
      return;
    }

    for (let i = 0; i < modeloItems.length; i++) {
      const item = modeloItems[i];
      if (!item.itemId) {
        toast.error(`Item ${i + 1}: Selecione um item`);
        return;
      }
      if (item.quantidade <= 0) {
        toast.error(`Item ${i + 1}: Quantidade deve ser maior que zero`);
        return;
      }
    }

    const submitData = {
      ...formData,
      modeloItems: modeloItems.filter(
        (item) => item.itemId && item.quantidade > 0
      ),
    };

    if (editingModelo) {
      updateModeloMutation.mutate({ ...submitData, id: editingModelo.id });
    } else {
      createModeloMutation.mutate(submitData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (modelo: ModeloAtendimento) => {
    setEditingModelo(modelo);
    setFormData({
      nome: modelo.nome,
      descricao: modelo.descricao || "",
    });
    setModeloItems(
      modelo.modeloItems.map((mi) => ({
        itemId: mi.item.id,
        quantidade: mi.quantidade,
      }))
    );
    setDialogOpen(true);
  };

  const handleDelete = (modelo: ModeloAtendimento) => {
    openDeleteDialog(() => {
      deleteModeloMutation.mutate(modelo.id);
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingModelo(null);
    resetForm();
  };

  const addItem = () => {
    setModeloItems((prev) => [...prev, { itemId: "", quantidade: 1 }]);
  };

  const removeItem = (index: number) => {
    setModeloItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateModeloItem = (index: number, field: string, value: any) => {
    setModeloItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modelos de Atendimento
          </h1>
          <p className="text-muted-foreground">
            Gerencie os modelos padrão de atendimento
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
            <Button title="Cadastrar novo modelo" aria-label="Cadastrar novo modelo">
              <Plus className="mr-2 h-4 w-4" title="Novo modelo" aria-hidden="true" />
              Novo modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingModelo ? "Editar modelo" : "Novo modelo"}
              </DialogTitle>
              <DialogDescription>
                {editingModelo
                  ? "Altere os dados do modelo conforme necessário"
                  : "Preencha os dados para cadastrar um novo modelo de atendimento"}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nome">Nome do modelo *</label>
                  <Input
                    id="nome"
                    placeholder="Ex: Cesta Básica Padrão"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="descricao">Descrição</label>
                  <Input
                    id="descricao"
                    placeholder="Descrição do modelo"
                    value={formData.descricao}
                    onChange={(e) =>
                      handleInputChange("descricao", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Itens do Modelo</h3>
                    {isLoadingItems && (
                      <p className="text-sm text-blue-600">
                        Carregando itens disponíveis...
                      </p>
                    )}
                    {itemsError && (
                      <p className="text-sm text-red-600">
                        Erro ao carregar itens: {itemsError?.message}
                      </p>
                    )}
                    {!isLoadingItems &&
                      !itemsError &&
                      Array.isArray(itensDisponiveis) && (
                        <p className="text-sm text-green-600">
                          {itensDisponiveis.length} itens disponíveis
                        </p>
                      )}
                  </div>
                  <Button
                    type="button"
                    onClick={addItem}
                    size="sm"
                    disabled={isLoadingItems}
                    title="Adicionar item"
                    aria-label="Adicionar item"
                  >
                    <Plus className="mr-2 h-4 w-4" title="Adicionar" aria-hidden="true" />
                    Adicionar Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {modeloItems.map((modeloItem, index) => {
                    const itensDisponiveisParaSelecao = Array.isArray(
                      itensDisponiveis
                    )
                      ? itensDisponiveis.filter(
                          (item) =>
                            item.id === modeloItem.itemId ||
                            !modeloItems.some((mi) => mi.itemId === item.id)
                        )
                      : [];

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <select
                          className="flex-1 p-2 border rounded"
                          value={modeloItem.itemId}
                          onChange={(e) =>
                            updateModeloItem(index, "itemId", e.target.value)
                          }
                        >
                          <option value="">Selecione um item</option>
                          {isLoadingItems && (
                            <option disabled>Carregando itens...</option>
                          )}
                          {itemsError && (
                            <option disabled>Erro ao carregar itens</option>
                          )}
                          {!isLoadingItems &&
                            !itemsError &&
                            itensDisponiveisParaSelecao.length === 0 && (
                              <option disabled>Nenhum item disponível</option>
                            )}
                          {itensDisponiveisParaSelecao.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nome} ({item.unidade})
                            </option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Qtd"
                          className="w-24"
                          value={modeloItem.quantidade}
                          onChange={(e) =>
                            updateModeloItem(
                              index,
                              "quantidade",
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          title={`Remover item ${index + 1}`}
                          aria-label={`Remover item ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" title="Remover" aria-hidden="true" />
                        </Button>
                      </div>
                    );
                  })}
                  {modeloItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum item adicionado. Clique em "Adicionar Item" para
                      começar.
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  createModeloMutation.isPending ||
                  updateModeloMutation.isPending
                }
              >
                {editingModelo
                  ? updateModeloMutation.isPending
                    ? "Atualizando..."
                    : "Atualizar modelo"
                  : createModeloMutation.isPending
                  ? "Cadastrando..."
                  : "Cadastrar modelo"}
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
        searchPlaceholder="Buscar por nome ou descrição..."
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
              <TableHead>Descrição</TableHead>
              <TableHead>Qtd. Itens</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Carregando modelos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-red-600">
                    Erro ao carregar modelos:{" "}
                    {error?.message || "Erro desconhecido"}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {params.search
                    ? "Nenhum modelo encontrado para a busca."
                    : "Nenhum modelo cadastrado."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((modelo) => (
                <TableRow key={modelo.id}>
                  <TableCell className="font-medium">{modelo.nome}</TableCell>
                  <TableCell>{modelo.descricao || "-"}</TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {modelo.modeloItems?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {modelo.modeloItems?.slice(0, 3).map((mi, index) => (
                        <div key={index} className="text-sm">
                          {mi.quantidade} {mi.item.unidade} - {mi.item.nome}
                        </div>
                      ))}
                      {modelo.modeloItems?.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{modelo.modeloItems.length - 3} mais
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={`Editar modelo ${modelo.nome}`}
                      aria-label={`Editar modelo ${modelo.nome}`}
                      onClick={() => handleEdit(modelo)}
                    >
                      <PenLine className="h-4 w-4" title="Editar" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={`Excluir modelo ${modelo.nome}`}
                      aria-label={`Excluir modelo ${modelo.nome}`}
                      onClick={() => handleDelete(modelo)}
                      disabled={deleteModeloMutation.isPending || isDeleting}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" title="Excluir" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmDialog />
    </div>
  );
}
