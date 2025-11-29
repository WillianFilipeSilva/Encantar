"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const dynamic = 'force-dynamic';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { api } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { getErrorMessage, logError } from "@/lib/errorUtils";
import { showErrorToast } from "@/components/ErrorToast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  Plus,
  Printer,
  Trash2,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { rotaService } from "@/lib/services/rotaService";
import { templateService } from "@/lib/services/templateService";
import { PrintModal } from "@/components/PrintModal";

interface RotaDetalhes {
  id: string;
  nome: string;
  descricao?: string;
  observacoes?: string;
  dataAtendimento?: string;
  atendimentos: Array<{
    id: string;
    status: "PENDENTE" | "CONCLUIDO" | "CANCELADO";
    observacoes?: string;
    beneficiario: {
      nome: string;
      endereco: string;
      telefone?: string;
    };
    atendimentoItems: Array<{
      quantidade: number;
      item: {
        nome: string;
        unidade: string;
      };
    }>;
  }>;
}

interface Beneficiario {
  id: string;
  nome: string;
  endereco: string;
  telefone?: string;
  ativo: boolean;
}

interface Item {
  id: string;
  nome: string;
  descricao: string;
  unidade: "KG" | "G" | "L" | "ML" | "UN" | "CX" | "PCT" | "LATA";
  ativo: boolean;
}

interface ModeloAtendimento {
  id: string;
  nome: string;
  descricao?: string;
  modeloItems: Array<{
    quantidade: number;
    item: {
      id: string;
      nome: string;
      unidade: string;
    };
  }>;
}

const statusMap = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const statusColorMap = {
  PENDENTE: "text-yellow-600 bg-yellow-50",
  CONCLUIDO: "text-green-600 bg-green-50",
  CANCELADO: "text-red-600 bg-red-50",
};

export default function RotaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    beneficiarioId: "",
    observacoes: "",
  });
  const [selectedBeneficiario, setSelectedBeneficiario] =
    useState<Beneficiario | null>(null);
  const [modeloSelecionado, setModeloSelecionado] = useState<string>("");
  const [atendimentoItems, setAtendimentoItems] = useState<
    Array<{ itemId: string; quantidade: number }>
  >([]);
  const [isSearchingBeneficiarios, setIsSearchingBeneficiarios] =
    useState(false);
  const [isSearchingItens, setIsSearchingItens] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const {
    data: rota,
    isLoading,
    error,
  } = useQuery<RotaDetalhes>({
    queryKey: ["rota", params.id],
    queryFn: async () => {
      const response = await api.get(`/rotas/${params.id}`);
      console.log("Dados da rota recebidos:", response.data);
      return response.data.data || response.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: beneficiarios, isLoading: isLoadingBeneficiarios } = useQuery<
    Beneficiario[]
  >({
    queryKey: ["beneficiarios"],
    queryFn: async () => {
      const response = await api.get("/beneficiarios?page=1&limit=500");
      return response.data.data || response.data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: itens, isLoading: isLoadingItens } = useQuery<Item[]>({
    queryKey: ["itens-ativos"],
    queryFn: async () => {
      try {
        const response = await api.get("/items/active?page=1&limit=500");
        console.log("Dados de itens ativos recebidos:", response.data);
        return response.data.data || response.data || [];
      } catch (error) {
        console.error("Erro ao buscar itens ativos:", error);
        return [];
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const { data: modelos, isLoading: isLoadingModelos } = useQuery<
    ModeloAtendimento[]
  >({
    queryKey: ["modelos"],
    queryFn: async () => {
      const response = await api.get("/modelos-atendimento?page=1&limit=500");
      return response.data.data || response.data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: templatesAtivos } = useQuery({
    queryKey: ["templates-ativos"],
    queryFn: async () => {
      const response = await templateService.findActive();
      return response.data || [];
    },
    staleTime: 30000,
  });

  const searchBeneficiarios = async (searchTerm: string) => {
    if (searchTerm.length < 1) return [];
    setIsSearchingBeneficiarios(true);
    try {
      const response = await api.get(
        `/atendimentos/beneficiarios/search?q=${encodeURIComponent(searchTerm)}`
      );
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Erro ao buscar beneficiários:", error);
      return [];
    } finally {
      setIsSearchingBeneficiarios(false);
    }
  };

  const searchItens = async (searchTerm: string) => {
    if (searchTerm.length < 1) return [];
    setIsSearchingItens(true);
    try {
      const response = await api.get(
        `/atendimentos/itens/search?q=${encodeURIComponent(searchTerm)}`
      );
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      return [];
    } finally {
      setIsSearchingItens(false);
    }
  };

  const createAtendimentoMutation = useMutation({
    mutationFn: async (newAtendimento: any) => {
      const response = await api.post("/atendimentos", {
        ...newAtendimento,
        rotaId: params.id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "rota" || query.queryKey[0] === "/rotas",
      });
      resetForm();
      setDialogOpen(false);
      toast.success("Atendimento cadastrado com sucesso!", {
        duration: 3000,
      });
    },
    onError: (error: any) => {
      logError("CriarAtendimento", error);
      showErrorToast("Erro ao cadastrar atendimento", error);
    },
  });

  const updateAtendimentoStatusMutation = useMutation({
    mutationFn: async ({
      atendimentoId,
      status,
    }: {
      atendimentoId: string;
      status: string;
    }) => {
      const response = await api.patch(
        `/atendimentos/${atendimentoId}/status`,
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "rota" || query.queryKey[0] === "/rotas",
      });
      toast.success("Status do atendimento atualizado!", {
        duration: 3000,
      });
    },
    onError: (error: any) => {
      logError("AtualizarStatus", error);
      showErrorToast("Erro ao atualizar status", error);
    },
  });

  const deleteAtendimentoMutation = useMutation({
    mutationFn: async (atendimentoId: string) => {
      const response = await api.delete(`/atendimentos/${atendimentoId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "rota" || query.queryKey[0] === "/rotas",
      });
      toast.success("Atendimento excluído com sucesso!", {
        duration: 3000,
      });
    },
    onError: (error: any) => {
      logError("ExcluirAtendimento", error);
      showErrorToast("Erro ao excluir atendimento", error);
    },
  });

  const resetForm = () => {
    setFormData({ beneficiarioId: "", observacoes: "" });
    setSelectedBeneficiario(null);
    setModeloSelecionado("");
    setAtendimentoItems([]);
  };

  const handleSubmitAtendimento = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.beneficiarioId) {
      toast.error("Selecione um beneficiário");
      return;
    }

    const itensComQuantidade = atendimentoItems.filter(
      (item) => item.quantidade > 0
    );
    if (itensComQuantidade.length === 0) {
      toast.error("Adicione pelo menos um item com quantidade");
      return;
    }

    for (let i = 0; i < itensComQuantidade.length; i++) {
      const item = itensComQuantidade[i];
      if (!item.itemId) {
        toast.error(`Item ${i + 1}: Selecione um item`);
        return;
      }
      if (item.quantidade <= 0) {
        toast.error(`Item ${i + 1}: Quantidade deve ser maior que zero`);
        return;
      }
      if (item.quantidade > 9999) {
        toast.error(`Item ${i + 1}: Quantidade deve ser no máximo 9999`);
        return;
      }
    }

    if (formData.observacoes && formData.observacoes.trim().length > 2000) {
      toast.error("Observações deve ter no máximo 2000 caracteres");
      return;
    }

    const atendimentoData = {
      beneficiarioId: formData.beneficiarioId,
      observacoes: formData.observacoes,
      items: itensComQuantidade.map((item) => ({
        itemId: item.itemId,
        quantidade: item.quantidade,
      })),
    };

    createAtendimentoMutation.mutate(atendimentoData);
  };

  const handleCarregarModelo = () => {
    const modelo = modelos?.find((m) => m.id === modeloSelecionado);
    if (modelo) {
      setAtendimentoItems(
        modelo.modeloItems.map((mi) => ({
          itemId: mi.item.id,
          quantidade: mi.quantidade,
        }))
      );
      toast.success("Modelo carregado com sucesso!");
    }
  };

  const addAtendimentoItem = () => {
    setAtendimentoItems((prev) => [...prev, { itemId: "", quantidade: 1 }]);
  };

  const removeAtendimentoItem = (index: number) => {
    setAtendimentoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAtendimentoItem = (index: number, field: string, value: any) => {
    setAtendimentoItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const updateAllAtendimentosStatusMutation = useMutation({
    mutationFn: async (novoStatus: string) => {
      const response = await api.patch(
        `/rotas/${params.id}/atendimentos/status`,
        { status: novoStatus }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "rota" || query.queryKey[0] === "/rotas",
      });
      toast.success("Status de todos os atendimentos atualizado!", {
        duration: 3000,
      });
    },
    onError: (error: any) => {
      logError("AtualizarStatusTodas", error);
      showErrorToast("Erro ao atualizar status dos atendimentos", error);
    },
  });

  const handleGerarPDF = () => {
    setPrintModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setPrintModalOpen(false);
  };

  if (
    isLoading ||
    isLoadingBeneficiarios ||
    isLoadingItens ||
    isLoadingModelos
  ) {
    return (
      <div className="p-4 text-center">Carregando detalhes da rota...</div>
    );
  }
  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        Erro ao carregar rota: {error?.message}
      </div>
    );
  if (!rota) return <div className="p-4 text-center">Rota não encontrada</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          title="Voltar"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{rota.nome}</h1>
          <p className="text-muted-foreground">{rota.descricao}</p>
        </div>
      </div>

      {/* Informações da Rota */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Data de Atendimento</p>
          <p className="text-lg font-semibold">
            {rota.dataAtendimento
              ? formatDate(rota.dataAtendimento)
              : "Não definida"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total de Atendimentos</p>
          <p className="text-lg font-semibold">
            {rota.atendimentos?.length || 0}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Atendimentos Concluídos
          </p>
          <p className="text-lg font-semibold">
            {rota.atendimentos?.filter((e) => e.status === "CONCLUIDO")
              .length || 0}
          </p>
        </div>
      </div>

      {/* Observações */}
      {rota.observacoes && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Observações
          </h3>
          <p>{rota.observacoes}</p>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-4">
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button title="Cadastrar novo atendimento" aria-label="Cadastrar novo atendimento">
              <Plus className="mr-2 h-4 w-4" title="Cadastrar atendimento" aria-hidden="true" />
              Cadastrar Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-4xl"
            aria-describedby="dialog-description"
          >
            <DialogHeader>
              <DialogTitle>Novo Atendimento - {rota.nome}</DialogTitle>
              <p
                id="dialog-description"
                className="text-sm text-muted-foreground"
              >
                Cadastre um novo atendimento para esta rota
              </p>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmitAtendimento}>
              {/* Seleção de modelo de atendimento */}
              <div className="space-y-2">
                <label className="font-medium">Modelo de atendimento (opcional)</label>
                <p className="text-sm text-gray-600">
                  Selecione um modelo para carregar automaticamente os itens
                </p>
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 border rounded-md"
                    value={modeloSelecionado}
                    onChange={(e) => setModeloSelecionado(e.target.value)}
                  >
                    <option value="">Nenhum modelo selecionado</option>
                    {modelos?.map((modelo) => (
                      <option key={modelo.id} value={modelo.id}>
                        {modelo.nome}{modelo.descricao ? ` - ${modelo.descricao}` : ''}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={handleCarregarModelo}
                    disabled={!modeloSelecionado}
                  >
                    Carregar
                  </Button>
                </div>
              </div>

              {/* Seleção de beneficiário */}
              <div className="space-y-2">
                <label htmlFor="beneficiario">Beneficiário *</label>
                <AutocompleteInput
                  placeholder="Buscar por nome ou endereço..."
                  value={selectedBeneficiario ? selectedBeneficiario.nome : ""}
                  onSearch={async (searchTerm) => {
                    if (searchTerm.length < 1) return [];
                    const results = await searchBeneficiarios(searchTerm);
                    return results.map((beneficiario: Beneficiario) => ({
                      id: beneficiario.id,
                      label: beneficiario.nome,
                      sublabel: beneficiario.endereco,
                    }));
                  }}
                  onSelect={(option) => {
                    if (option) {
                      setSelectedBeneficiario({
                        id: option.id,
                        nome: option.label,
                        endereco: option.sublabel || "",
                        ativo: true,
                      });
                      setFormData((prev) => ({
                        ...prev,
                        beneficiarioId: option.id,
                      }));
                    }
                  }}
                  isLoading={isSearchingBeneficiarios}
                />
              </div>

              {/* Itens da atendimento */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      Itens da Atendimento
                    </h3>
                    {isLoadingItens && (
                      <p className="text-sm text-blue-600">
                        Carregando itens disponíveis...
                      </p>
                    )}
                    {!isLoadingItens && Array.isArray(itens) && (
                      <p className="text-sm text-green-600">
                        {itens.length} itens disponíveis
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={addAtendimentoItem}
                    size="sm"
                    disabled={isLoadingItens}
                    title="Adicionar item"
                    aria-label="Adicionar item"
                  >
                    <Plus className="mr-2 h-4 w-4" title="Adicionar" aria-hidden="true" />
                    Adicionar Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {atendimentoItems.map((atendimentoItem, index) => {
                    const itensDisponiveis = Array.isArray(itens)
                      ? itens.filter(
                          (item) =>
                            item.id === atendimentoItem.itemId ||
                            !atendimentoItems.some(
                              (ei) => ei.itemId === item.id
                            )
                        )
                      : [];

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <select
                          className="flex-1 p-2 border rounded"
                          value={atendimentoItem.itemId}
                          onChange={(e) =>
                            updateAtendimentoItem(
                              index,
                              "itemId",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Selecione um item</option>
                          {isLoadingItens && (
                            <option disabled>Carregando itens...</option>
                          )}
                          {!isLoadingItens && itensDisponiveis.length === 0 && (
                            <option disabled>Nenhum item disponível</option>
                          )}
                          {itensDisponiveis.map((item) => (
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
                          value={atendimentoItem.quantidade}
                          onChange={(e) =>
                            updateAtendimentoItem(
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
                          onClick={() => removeAtendimentoItem(index)}
                          title={`Remover item ${index + 1}`}
                          aria-label={`Remover item ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" title="Remover" aria-hidden="true" />
                        </Button>
                      </div>
                    );
                  })}
                  {atendimentoItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum item adicionado. Clique em "Adicionar Item" para
                      começar.
                    </p>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <label htmlFor="observacoes">Observações</label>
                <Input
                  id="observacoes"
                  placeholder="Observações sobre a atendimento"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      observacoes: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Botão de submit */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createAtendimentoMutation.isPending}
                >
                  {createAtendimentoMutation.isPending
                    ? "Cadastrando..."
                    : "Confirmar Atendimento"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={() =>
            updateAllAtendimentosStatusMutation.mutate("CONCLUIDO")
          }
          disabled={updateAllAtendimentosStatusMutation.isPending}
          title="Marcar todos como concluídos"
          aria-label="Marcar todos como concluídos"
        >
          <CheckCircle className="mr-2 h-4 w-4" title="Concluir todos" aria-hidden="true" />
          {updateAllAtendimentosStatusMutation.isPending
            ? "Atualizando..."
            : "Marcar Todos como Concluídos"}
        </Button>

        <Button
          variant="outline"
          onClick={handleGerarPDF}
          title="Gerar PDF da rota"
          aria-label="Gerar PDF da rota"
        >
          <Printer className="mr-2 h-4 w-4" title="Imprimir" aria-hidden="true" />
          Imprimir Rota
        </Button>
      </div>

      {/* Lista de Atendimentos */}
      <div className="rounded-md border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Atendimentos desta Rota</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiário</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(rota.atendimentos) &&
            rota.atendimentos.length > 0 ? (
              rota.atendimentos.map((atendimento) => (
                <TableRow key={atendimento.id}>
                  <TableCell className="font-medium">
                    {atendimento.beneficiario.nome}
                  </TableCell>
                  <TableCell>{atendimento.beneficiario.endereco}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {Array.isArray(atendimento.atendimentoItems) &&
                        atendimento.atendimentoItems.map(
                          (atendimentoItem, index) => (
                            <div key={index} className="text-sm">
                              {atendimentoItem.quantidade}{" "}
                              {atendimentoItem.item.unidade} -{" "}
                              {atendimentoItem.item.nome}
                            </div>
                          )
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColorMap[atendimento.status]
                      }`}
                    >
                      {statusMap[atendimento.status]}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {atendimento.status === "PENDENTE" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Marcar como concluído"
                        onClick={() =>
                          updateAtendimentoStatusMutation.mutate({
                            atendimentoId: atendimento.id,
                            status: "CONCLUIDO",
                          })
                        }
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" title="Marcar como concluído" aria-hidden="true" />
                      </Button>
                    )}
                    {atendimento.status === "CONCLUIDO" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Marcar como cancelado"
                        onClick={() =>
                          updateAtendimentoStatusMutation.mutate({
                            atendimentoId: atendimento.id,
                            status: "CANCELADO",
                          })
                        }
                      >
                        <XCircle className="h-4 w-4 text-yellow-600" title="Marcar como cancelado" aria-hidden="true" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Excluir atendimento"
                      onClick={() => {
                        toast(
                          (t) => (
                            <div className="flex flex-col gap-2">
                              <span>
                                Tem certeza que deseja excluir esta atendimento?
                              </span>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    toast.dismiss(t.id);
                                    deleteAtendimentoMutation.mutate(
                                      atendimento.id
                                    );
                                  }}
                                  className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                                >
                                  Excluir
                                </button>
                                <button
                                  onClick={() => toast.dismiss(t.id)}
                                  className="bg-gray-200 px-3 py-1 rounded-md text-sm"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ),
                          {
                            duration: 10000,
                          }
                        );
                      }}
                      disabled={deleteAtendimentoMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" title="Excluir atendimento" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum atendimento cadastrado para esta rota
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {rota && (
        <PrintModal
          rotaId={rota.id}
          rotaNome={rota.nome}
          isOpen={printModalOpen}
          onClose={handleClosePrintModal}
        />
      )}
    </div>
  );
}
