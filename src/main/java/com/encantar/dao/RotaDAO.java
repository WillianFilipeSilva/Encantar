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

    public void criar(Rota rota) {
        String sql = "INSERT INTO rota (nome, data) VALUES (?, ?)";
        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, rota.getNome());
            stmt.setDate(2, Date.valueOf(rota.getData()));
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) rota.setId(rs.getLong(1));
            for (Entrega entrega : rota.getEntregas()) {
                try (PreparedStatement se = conn.prepareStatement("UPDATE entrega SET rota_id = ? WHERE id = ?")) {
                    se.setLong(1, rota.getId());
                    se.setLong(2, entrega.getId());
                    se.executeUpdate();
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
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
            try (PreparedStatement cl = conn.prepareStatement("UPDATE entrega SET rota_id = NULL WHERE rota_id = ?")) {
                cl.setLong(1, rota.getId());
                cl.executeUpdate();
            }
            for (Entrega entrega : rota.getEntregas()) {
                try (PreparedStatement se = conn.prepareStatement("UPDATE entrega SET rota_id = ? WHERE id = ?")) {
                    se.setLong(1, rota.getId());
                    se.setLong(2, entrega.getId());
                    se.executeUpdate();
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void deletar(Long id) {
        try (Connection conn = conexao.abrir();
             PreparedStatement cl = conn.prepareStatement("UPDATE entrega SET rota_id = NULL WHERE rota_id = ?");
             PreparedStatement dl = conn.prepareStatement("DELETE FROM rota WHERE id = ?")) {
            cl.setLong(1, id);
            cl.executeUpdate();
            dl.setLong(1, id);
            dl.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Rota> listarTodos() {
        List<Rota> rotas = new ArrayList<>();
        try (Connection conn = conexao.abrir();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT * FROM rota ORDER BY data DESC")) {
            while (rs.next()) rotas.add(criarRota(rs));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return rotas;
    }

    public List<Rota> buscarPorData(LocalDate data) {
        List<Rota> rotas = new ArrayList<>();
        try (Connection conn = conexao.abrir();
             PreparedStatement st = conn.prepareStatement("SELECT * FROM rota WHERE data = ?")) {
            st.setDate(1, Date.valueOf(data));
            ResultSet rs = st.executeQuery();
            while (rs.next()) rotas.add(criarRota(rs));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return rotas;
    }

    public Rota buscarPorId(Long id) {
        try (Connection conn = conexao.abrir();
             PreparedStatement st = conn.prepareStatement("SELECT * FROM rota WHERE id = ?")) {
            st.setLong(1, id);
            ResultSet rs = st.executeQuery();
            if (rs.next()) return criarRota(rs);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public List<Rota> buscarTodos() {
        return listarTodos();
    }

    public void adicionarEntrega(Long rotaId, Long entregaId) {
        try (Connection conn = conexao.abrir();
             PreparedStatement st = conn.prepareStatement("UPDATE entrega SET rota_id = ? WHERE id = ?")) {
            st.setLong(1, rotaId);
            st.setLong(2, entregaId);
            st.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void removerEntrega(Long rotaId, Long entregaId) {
        try (Connection conn = conexao.abrir();
             PreparedStatement st = conn.prepareStatement("UPDATE entrega SET rota_id = NULL WHERE id = ? AND rota_id = ?")) {
            st.setLong(1, entregaId);
            st.setLong(2, rotaId);
            st.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private Rota criarRota(ResultSet rs) throws SQLException {
        Rota rota = new Rota();
        rota.setId(rs.getLong("id"));
        rota.setNome(rs.getString("nome"));
        rota.setData(rs.getDate("data").toLocalDate());
        EntregaDAO edao = new EntregaDAO();
        rota.setEntregas(edao.buscarPorRota(rota.getId()));
        return rota;
    }
}
