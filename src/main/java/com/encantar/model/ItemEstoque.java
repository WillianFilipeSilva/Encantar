package main.java.com.encantar.model;

import main.java.com.encantar.model.interfaces.IItemEstoque;

import java.util.List;

public class ItemEstoque implements  IItemEstoque {
    private Long id;
    private Long itemId;
    private int quantidadeAtual;

    public ItemEstoque() {}

    public ItemEstoque(Long id, Long itemId, int quantidadeAtual) {
        this.id = id;
        this.itemId = itemId;
        this.quantidadeAtual = quantidadeAtual;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Long getItemId() { return itemId; }

    public void setItemId(Long itemId) { this.itemId = itemId; }

    public int getQuantidadeAtual() { return quantidadeAtual; }

    public void setQuantidadeAtual(int quantidadeAtual) { this.quantidadeAtual = quantidadeAtual; }

    @Override
    public void adicionarEntrada(ItemEstoque estoque) {

    }

    @Override
    public void adicionarSaida(ItemEstoque estoque) {

    }

    @Override
    public ItemEstoque buscarPorItemId(Long itemId) {
        return null;
    }

    @Override
    public List<ItemEstoque> listarTodos() {
        return List.of();
    }

    @Override
    public void ajustarQuantidade(Long itemId, int novaQuantidade) {

    }
}
