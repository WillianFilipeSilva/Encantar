package main.java.com.encantar.model.entidades;

import main.java.com.encantar.model.interfaces.entidades.IEntregaItem;

public class EntregaItem implements IEntregaItem {
    private Long id;
    private Long entregaId;
    private EntregaItem entregaItem;
    private Long itemId;
    private Item item;
    private int quantidade;

    public EntregaItem() {}

    public EntregaItem(Long id, Long entregaId, EntregaItem entregaItem, Long itemId, Item item, int quantidade) {
        this.id = id;
        this.entregaId = entregaId;
        this.entregaItem = entregaItem;
        this.itemId = itemId;
        this.item = item;
        this.quantidade = quantidade;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public EntregaItem getEntregaItem() { return entregaItem; }

    public void setEntregaItem(EntregaItem entregaItem) { this.entregaItem = entregaItem; }

    public Item getItem() { return item; }

    public void setItem(Item item) { this.item = item; }

    public Long getEntregaId() { return entregaId; }

    public void setEntregaId(Long entregaId) { this.entregaId = entregaId; }

    public Long getItemId() { return itemId; }

    public void setItemId(Long itemId) { this.itemId = itemId; }

    public int getQuantidade() { return quantidade; }

    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
}
