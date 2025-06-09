package com.encantar.model.interfaces;

import com.encantar.model.Item;

import java.util.List;

public interface IItem {
    void criar(Item item);

    Item buscarPorId(Long id);

    List<Item> listarTodos();

    void atualizar(Item item);

    void deletar(Long id);
}
