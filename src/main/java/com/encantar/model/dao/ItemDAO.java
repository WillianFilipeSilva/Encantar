package main.java.com.encantar.model.dao;

import main.java.com.encantar.model.entidades.Item;
import main.java.com.encantar.model.interfaces.dao.IItemDAO;

import java.util.List;

public class ItemDAO implements IItemDAO {

    public void cadastrar(Item item) {

    }

    public Item buscarPorId(Long id) {
        return null;
    }

    public List<Item> listarTodos() {
        return List.of();
    }

    public void atualizar(Item item) {

    }

    public void deletar(Long id) {

    }
}