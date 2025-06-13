package com.encantar.dao;

import com.encantar.dao.interfaces.IRotaDAO;
import com.encantar.model.Entrega;
import com.encantar.model.Rota;
import com.encantar.model.Beneficiario;
import com.encantar.model.EntregaItem;
import com.encantar.model.Item;
import com.encantar.model.enums.StatusEntrega;

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

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) rota.setId(rs.getLong(1));
            }

            atualizarEntregasDaRota(rota, conn);
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

            try (PreparedStatement clear = conn.prepareStatement(
                    "UPDATE entrega SET rota_id = NULL WHERE rota_id = ?")) {
                clear.setLong(1, rota.getId());
                clear.executeUpdate();
            }
            atualizarEntregasDaRota(rota, conn);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void deletar(Long id) {
        try (Connection conn = conexao.abrir();
             PreparedStatement clear = conn.prepareStatement(
                     "UPDATE entrega SET rota_id = NULL WHERE rota_id = ?");
             PreparedStatement del = conn.prepareStatement(
                     "DELETE FROM rota WHERE id = ?")) {

            clear.setLong(1, id);
            clear.executeUpdate();

            del.setLong(1, id);
            del.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Rota> listarTodos() {
        List<Rota> rotas = new ArrayList<>();
        String sql = "SELECT * FROM rota ORDER BY data DESC";

        try (Connection conn = conexao.abrir();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) rotas.add(criarRota(rs, conn));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return rotas;
    }

    public List<Rota> buscarPorData(LocalDate data) {
        List<Rota> rotas = new ArrayList<>();
        String sql = "SELECT * FROM rota WHERE data = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement st = conn.prepareStatement(sql)) {

            st.setDate(1, Date.valueOf(data));
            try (ResultSet rs = st.executeQuery()) {
                while (rs.next()) rotas.add(criarRota(rs, conn));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return rotas;
    }

    public Rota buscarPorId(Long id) {
        String sql = "SELECT * FROM rota WHERE id = ?";
        try (Connection conn = conexao.abrir();
             PreparedStatement st = conn.prepareStatement(sql)) {

            st.setLong(1, id);
            try (ResultSet rs = st.executeQuery()) {
                if (rs.next()) return criarRota(rs, conn);
            }
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
             PreparedStatement st = conn.prepareStatement(
                     "UPDATE entrega SET rota_id = ? WHERE id = ?")) {

            st.setLong(1, rotaId);
            st.setLong(2, entregaId);
            st.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void removerEntrega(Long rotaId, Long entregaId) {
        try (Connection conn = conexao.abrir();
             PreparedStatement st = conn.prepareStatement(
                     "UPDATE entrega SET rota_id = NULL WHERE id = ? AND rota_id = ?")) {

            st.setLong(1, entregaId);
            st.setLong(2, rotaId);
            st.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private void atualizarEntregasDaRota(Rota rota, Connection conn) throws SQLException {
        String sql = "UPDATE entrega SET rota_id = ? WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (Entrega e : rota.getEntregas()) {
                ps.setLong(1, rota.getId());
                ps.setLong(2, e.getId());
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    private Rota criarRota(ResultSet rs, Connection conn) throws SQLException {
        Rota rota = new Rota();
        rota.setId(rs.getLong("id"));
        rota.setNome(rs.getString("nome"));
        rota.setData(rs.getDate("data").toLocalDate());
        rota.setEntregas(buscarEntregasBasico(rota.getId(), conn));
        return rota;
    }

    private List<Entrega> buscarEntregasBasico(Long rotaId, Connection conn) throws SQLException {
        List<Entrega> list = new ArrayList<>();
        String sql = "SELECT e.*, b.nome as beneficiario_nome, b.endereco as beneficiario_endereco " +
                    "FROM entrega e " +
                    "LEFT JOIN beneficiario b ON e.beneficiario_id = b.id " +
                    "WHERE e.rota_id = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, rotaId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Entrega e = new Entrega();
                    e.setId(rs.getLong("id"));
                    e.setStatus(StatusEntrega.valueOf(rs.getString("status")));
                    e.setDescricao(rs.getString("descricao"));
                    
                    // Carregar beneficiário
                    if (rs.getLong("beneficiario_id") != 0) {
                        Beneficiario b = new Beneficiario();
                        b.setId(rs.getLong("beneficiario_id"));
                        b.setNome(rs.getString("beneficiario_nome"));
                        b.setEndereco(rs.getString("beneficiario_endereco"));
                        e.setBeneficiario(b);
                    }
                    
                    String sqlItens = "SELECT ei.*, i.nome as item_nome " +
                                    "FROM entrega_item ei " +
                                    "LEFT JOIN item i ON ei.item_id = i.id " +
                                    "WHERE ei.entrega_id = ?";
                    try (PreparedStatement psItens = conn.prepareStatement(sqlItens)) {
                        psItens.setLong(1, e.getId());
                        try (ResultSet rsItens = psItens.executeQuery()) {
                            while (rsItens.next()) {
                                EntregaItem ei = new EntregaItem();
                                ei.setQuantidade(rsItens.getInt("quantidade"));
                                
                                Item item = new Item();
                                item.setId(rsItens.getLong("item_id"));
                                item.setNome(rsItens.getString("item_nome"));
                                ei.setItem(item);
                                
                                e.getItems().add(ei);
                            }
                        }
                    }
                    
                    list.add(e);
                }
            }
        }
        return list;
    }
}
