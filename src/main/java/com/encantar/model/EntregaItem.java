package com.encantar.model;

public class EntregaItem {
    private Long entregaId;
    private Long itemId;
    private Item item;
    private Integer quantidade;

    public EntregaItem() {
    }

    public EntregaItem(Long entregaId, Long itemId, Item item, Integer quantidade) {
        this.entregaId = entregaId;
        this.itemId = itemId;
        this.item = item;
        this.quantidade = quantidade;
    }

    public Long getEntregaId() {
        return entregaId;
    }

    public void setEntregaId(Long entregaId) {
        this.entregaId = entregaId;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
        this.itemId = item != null ? item.getId() : null;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EntregaItem that = (EntregaItem) o;
        return entregaId != null && entregaId.equals(that.entregaId)
                && itemId != null && itemId.equals(that.itemId);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(entregaId, itemId);
    }
}