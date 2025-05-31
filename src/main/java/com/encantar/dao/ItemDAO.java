package com.encantar.dao;

import com.encantar.dao.interfaces.IItemDAO;
import com.encantar.model.Item;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ItemDAO implements IItemDAO {
    private final Conexao conexao = new Conexao();

    public void criar(Item item) {
        String sql = "INSERT INTO item (nome, descricao) VALUES (?, ?)";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, item.getNome());
            stmt.setString(2, item.getDescricao());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                item.setId(rs.getLong(1));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao criar item: " + e.getMessage(), e);
        }
    }

    public void atualizar(Item item) {
        String sql = "UPDATE item SET nome = ?, descricao = ? WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, item.getNome());
            stmt.setString(2, item.getDescricao());
            stmt.setLong(3, item.getId());

            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar item: " + e.getMessage(), e);
        }
    }

    public void deletar(Long id) {
        String sql = "DELETE FROM item WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar item: " + e.getMessage(), e);
        }
    }

    public List<Item> listarTodos() {
        String sql = "SELECT * FROM item";
        List<Item> itens = new ArrayList<>();

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Item item = new Item();
                item.setId(rs.getLong("id"));
                item.setNome(rs.getString("nome"));
                item.setDescricao(rs.getString("descricao"));
                itens.add(item);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar itens: " + e.getMessage(), e);
        }

        return itens;
    }

    public Item buscarPorId(Long id) {
        String sql = "SELECT * FROM item WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Item item = new Item();
                item.setId(rs.getLong("id"));
                item.setNome(rs.getString("nome"));
                item.setDescricao(rs.getString("descricao"));
                return item;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar item: " + e.getMessage(), e);
        }

        return null;
    }

    @Override
    public List<Item> buscarPorNome(String nome) {
        return List.of();
    }

    @Override
    public List<Item> buscarTodos() {
        return List.of();
    }
}