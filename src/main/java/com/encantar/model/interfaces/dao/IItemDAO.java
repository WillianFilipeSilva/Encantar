package main.java.com.encantar.model.interfaces.dao;

import main.java.com.encantar.model.entidades.Item;

import java.util.List;

public interface IItemDAO {
    public void cadastrar(Item item);

    public Item buscarPorId(Long id);

    public List<Item> listarTodos();

    public void atualizar(Item item);

    public void deletar(Long id);
}
