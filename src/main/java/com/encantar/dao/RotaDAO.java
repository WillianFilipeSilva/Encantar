package com.encantar.dao;

import com.encantar.dao.interfaces.IRotaDAO;
import com.encantar.model.Entrega;
import com.encantar.model.Rota;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class RotaDAO implements IRotaDAO {
    private final Conexao conexao = new Conexao();
    private final EntregaDAO entregaDAO = new EntregaDAO();

    public void criar(Rota rota) {
        String sql = "INSERT INTO rota (nome, data) VALUES (?, ?)";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, rota.getNome());
            stmt.setDate(2, Date.valueOf(rota.getData()));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                rota.setId(rs.getLong(1));
            }

            // Atualiza as entregas associadas
            for (Entrega entrega : rota.getEntregas()) {
                String sqlEntrega = "UPDATE entrega SET rota_id = ? WHERE id = ?";
                try (PreparedStatement stmtEntrega = conn.prepareStatement(sqlEntrega)) {
                    stmtEntrega.setLong(1, rota.getId());
                    stmtEntrega.setLong(2, entrega.getId());
                    stmtEntrega.executeUpdate();
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao criar rota: " + e.getMessage(), e);
        }
    }

    public void atualizar(Rota rota) {
        String sql = "UPDATE rota SET nome = ?, data = ? WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, rota.getNome());
            stmt.setDate(2, Date.valueOf(rota.getData()));
            stmt.setLong(3, rota.getId());

            stmt.executeUpdate();

            // Limpa as entregas antigas
            String sqlLimpar = "UPDATE entrega SET rota_id = NULL WHERE rota_id = ?";
            try (PreparedStatement stmtLimpar = conn.prepareStatement(sqlLimpar)) {
                stmtLimpar.setLong(1, rota.getId());
                stmtLimpar.executeUpdate();
            }

            // Atualiza as novas entregas
            for (Entrega entrega : rota.getEntregas()) {
                String sqlEntrega = "UPDATE entrega SET rota_id = ? WHERE id = ?";
                try (PreparedStatement stmtEntrega = conn.prepareStatement(sqlEntrega)) {
                    stmtEntrega.setLong(1, rota.getId());
                    stmtEntrega.setLong(2, entrega.getId());
                    stmtEntrega.executeUpdate();
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar rota: " + e.getMessage(), e);
        }
    }

    public void deletar(Long id) {
        // Primeiro limpa as referências nas entregas
        String sqlLimpar = "UPDATE entrega SET rota_id = NULL WHERE rota_id = ?";
        String sqlDeletar = "DELETE FROM rota WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmtLimpar = conn.prepareStatement(sqlLimpar);
             PreparedStatement stmtDeletar = conn.prepareStatement(sqlDeletar)) {

            stmtLimpar.setLong(1, id);
            stmtLimpar.executeUpdate();

            stmtDeletar.setLong(1, id);
            stmtDeletar.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar rota: " + e.getMessage(), e);
        }
    }

    public List<Rota> listarTodos() {
        String sql = "SELECT * FROM rota ORDER BY data DESC";
        List<Rota> rotas = new ArrayList<>();

        try (Connection conn = conexao.abrir();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                rotas.add(criarRota(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar rotas: " + e.getMessage(), e);
        }

        return rotas;
    }

    public List<Rota> buscarPorData(LocalDate data) {
        String sql = "SELECT * FROM rota WHERE data = ?";
        List<Rota> rotas = new ArrayList<>();

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setDate(1, Date.valueOf(data));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                rotas.add(criarRota(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar rotas por data: " + e.getMessage(), e);
        }

        return rotas;
    }

    @Override
    public void adicionarEntrega(Long rotaId, Long entregaId) {

    }

    @Override
    public void removerEntrega(Long rotaId, Long entregaId) {

    }

    public Rota buscarPorId(Long id) {
        String sql = "SELECT * FROM rota WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return criarRota(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar rota: " + e.getMessage(), e);
        }

        return null;
    }

    private Rota criarRota(ResultSet rs) throws SQLException {
        Rota rota = new Rota();
        rota.setId(rs.getLong("id"));
        rota.setNome(rs.getString("nome"));
        rota.setData(rs.getDate("data").toLocalDate());

        // Carrega as entregas associadas
        String sqlEntregas = "SELECT * FROM entrega WHERE rota_id = ?";
        try (PreparedStatement stmt = conexao.abrir().prepareStatement(sqlEntregas)) {
            stmt.setLong(1, rota.getId());
            ResultSet rsEntregas = stmt.executeQuery();

            while (rsEntregas.next()) {
                Entrega entrega = entregaDAO.buscarPorId(rsEntregas.getLong("id"));
                if (entrega != null) {
                    rota.adicionarEntrega(entrega);
                }
            }
        }

        return rota;
    }
}