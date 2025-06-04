package com.encantar.dao.interfaces;

import com.encantar.model.Item;

import java.util.List;

public interface IItemDAO extends IDAO<Item> {
    List<Item> buscarPorNome(String nome);

    List<Item> buscarTodos();
} 