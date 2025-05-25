package main.java.com.encantar.model.entidades;

import main.java.com.encantar.model.interfaces.entidades.IItemEstoque;

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
}
