package com.encantar.controller;

import com.encantar.dao.ItemDAO;
import com.encantar.model.Item;

import java.util.List;

public class ItemController {
    private final ItemDAO dao = new ItemDAO();

    public void salvar(Item item) {
        validar(item);
        if (item.getId() == null) {
            dao.criar(item);
        } else {
            dao.atualizar(item);
        }
    }

    public void deletar(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        dao.deletar(id);
    }

    public List<Item> listarTodos() {
        return dao.listarTodos();
    }

    public Item buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        return dao.buscarPorId(id);
    }

    public List<Item> buscarPorTexto(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            throw new IllegalArgumentException("Texto de busca não pode ser nulo ou vazio");
        }
        return dao.buscarPorTexto(texto.trim());
    }

    private void validar(Item item) {
        if (item == null) {
            throw new IllegalArgumentException("Item não pode ser nulo");
        }
        if (item.getNome() == null || item.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
    }
} 