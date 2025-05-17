package main.java.com.encantar.model.interfaces;

import main.java.com.encantar.model.ItemEstoque;

import java.util.List;

public interface IItemEstoque {
    void adicionarEntrada(ItemEstoque estoque);

    void adicionarSaida(ItemEstoque estoque);

    ItemEstoque buscarPorItemId(Long itemId);

    List<ItemEstoque> listarTodos();

    void ajustarQuantidade(Long itemId, int novaQuantidade);
}
