package main.java.com.encantar.model;

import main.java.com.encantar.model.interfaces.IEntregaItem;

import java.util.List;

public class EntregaItem implements IEntregaItem {
    private Long id;
    private Long entregaId;
    private Long itemId;
    private int quantidade;

    public EntregaItem() {}

    public EntregaItem(Long id, Long entregaId, Long itemId, int quantidade) {
        this.id = id;
        this.entregaId = entregaId;
        this.itemId = itemId;
        this.quantidade = quantidade;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Long getEntregaId() { return entregaId; }

    public void setEntregaId(Long entregaId) { this.entregaId = entregaId; }

    public Long getItemId() { return itemId; }

    public void setItemId(Long itemId) { this.itemId = itemId; }

    public int getQuantidade() { return quantidade; }

    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }

    @Override
    public void criar(EntregaItem item) {

    }

    @Override
    public EntregaItem buscarPorId(Long id) {
        return null;
    }

    @Override
    public List<EntregaItem> listarTodos() {
        return List.of();
    }

    @Override
    public void atualizar(EntregaItem item) {

    }

    @Override
    public void deletar(Long id) {

    }
}
