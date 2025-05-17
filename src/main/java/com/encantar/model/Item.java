package main.java.com.encantar.model;

import main.java.com.encantar.model.interfaces.IItem;

import java.util.List;

public class Item implements IItem {
    private Long id;
    private String nome;
    private String descricao;

    public Item() {}

    public Item(Long id, String nome, String descricao) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }

    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }

    public void setDescricao(String descricao) { this.descricao = descricao; }

    @Override
    public void criar(Item item) {

    }

    @Override
    public Item buscarPorId(Long id) {
        return null;
    }

    @Override
    public List<Item> listarTodos() {
        return List.of();
    }

    @Override
    public void atualizar(Item item) {

    }

    @Override
    public void deletar(Long id) {

    }
}
