package com.encantar.dao;

import com.encantar.dao.interfaces.IEntregaDAO;
import com.encantar.model.Entrega;
import com.encantar.model.EntregaItem;
import com.encantar.model.Item;
import com.encantar.model.enums.StatusEntrega;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EntregaDAO implements IEntregaDAO {
    private final Conexao conexao = new Conexao();
    private final BeneficiarioDAO beneficiarioDAO = new BeneficiarioDAO();
    private final RotaDAO rotaDAO = new RotaDAO();
    private final ItemDAO itemDAO = new ItemDAO();

    public void criar(Entrega entrega) {
        String sqlEntrega = "INSERT INTO entrega (beneficiario_id, data_entrega, status, descricao, rota_id) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = conexao.abrir()) {
            conn.setAutoCommit(false);
            try (PreparedStatement stmt = conn.prepareStatement(sqlEntrega, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setLong(1, entrega.getBeneficiario().getId());
                stmt.setDate(2, Date.valueOf(entrega.getDataEntrega()));
                stmt.setString(3, entrega.getStatus().toString());
                stmt.setString(4, entrega.getDescricao());
                if (entrega.getRota() != null) stmt.setLong(5, entrega.getRota().getId());
                else stmt.setNull(5, Types.BIGINT);
                stmt.executeUpdate();
                ResultSet rs = stmt.getGeneratedKeys();
                if (rs.next()) entrega.setId(rs.getLong(1));
            }
            inserirItens(entrega, conn);
            conn.commit();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao criar entrega: " + e.getMessage(), e);
        }
    }

    public void atualizar(Entrega entrega) {
        String sqlEntrega = "UPDATE entrega SET beneficiario_id = ?, data_entrega = ?, status = ?, descricao = ?, rota_id = ? WHERE id = ?";
        try (Connection conn = conexao.abrir()) {
            conn.setAutoCommit(false);
            try (PreparedStatement stmt = conn.prepareStatement(sqlEntrega)) {
                stmt.setLong(1, entrega.getBeneficiario().getId());
                stmt.setDate(2, Date.valueOf(entrega.getDataEntrega()));
                stmt.setString(3, entrega.getStatus().toString());
                stmt.setString(4, entrega.getDescricao());
                if (entrega.getRota() != null) stmt.setLong(5, entrega.getRota().getId());
                else stmt.setNull(5, Types.BIGINT);
                stmt.setLong(6, entrega.getId());
                stmt.executeUpdate();
            }
            try (PreparedStatement del = conn.prepareStatement("DELETE FROM entrega_item WHERE entrega_id = ?")) {
                del.setLong(1, entrega.getId());
                del.executeUpdate();
            }
            inserirItens(entrega, conn);
            conn.commit();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar entrega: " + e.getMessage(), e);
        }
    }

    public void deletar(Long id) {
        try (Connection conn = conexao.abrir()) {
            conn.setAutoCommit(false);
            try (PreparedStatement delItens = conn.prepareStatement("DELETE FROM entrega_item WHERE entrega_id = ?")) {
                delItens.setLong(1, id);
                delItens.executeUpdate();
            }
            try (PreparedStatement delEntrega = conn.prepareStatement("DELETE FROM entrega WHERE id = ?")) {
                delEntrega.setLong(1, id);
                delEntrega.executeUpdate();
            }
            conn.commit();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar entrega: " + e.getMessage(), e);
        }
    }

    public List<Entrega> listarTodos() {
        String sql = "SELECT * FROM entrega";
        List<Entrega> entregas = new ArrayList<>();
        try (Connection conn = conexao.abrir();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) entregas.add(criarEntrega(rs, conn));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar entregas: " + e.getMessage(), e);
        }
        return entregas;
    }

    public List<Entrega> buscarPorBeneficiario(Long beneficiarioId) {
        String sql = "SELECT * FROM entrega WHERE beneficiario_id = ?";
        List<Entrega> entregas = new ArrayList<>();
        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, beneficiarioId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) entregas.add(criarEntrega(rs, conn));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar entregas do beneficiário: " + e.getMessage(), e);
        }
        return entregas;
    }

    public List<Entrega> buscarPorStatus(StatusEntrega status) {
        String sql = "SELECT * FROM entrega WHERE status = ?";
        List<Entrega> entregas = new ArrayList<>();
        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status.toString());
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) entregas.add(criarEntrega(rs, conn));
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar entregas por status: " + e.getMessage(), e);
        }
        return entregas;
    }

    public List<Entrega> buscarPorData(LocalDate data) {
        return List.of();
    }

    public List<Entrega> buscarPorRota(Long rotaId) {
        String sql = "SELECT * FROM entrega WHERE rota_id = ?";
        List<Entrega> list = new ArrayList<>();
        try (Connection c = conexao.abrir();
             PreparedStatement s = c.prepareStatement(sql)) {
            s.setLong(1, rotaId);
            ResultSet rs = s.executeQuery();
            while (rs.next()) list.add(criarEntrega(rs, c));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return list;
    }

    public List<Entrega> buscarTodos() {
        return List.of();
    }

    public Entrega buscarPorId(Long id) {
        String sql = "SELECT * FROM entrega WHERE id = ?";
        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return criarEntrega(rs, conn);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar entrega: " + e.getMessage(), e);
        }
        return null;
    }

    private void inserirItens(Entrega entrega, Connection conn) throws SQLException {
        String sql = "INSERT INTO entrega_item (entrega_id, item_id, quantidade) VALUES (?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (EntregaItem ei : entrega.getItems()) {
                stmt.setLong(1, entrega.getId());
                stmt.setLong(2, ei.getItem().getId());
                stmt.setInt(3, ei.getQuantidade());
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
    }

    private List<EntregaItem> buscarItens(Long entregaId, Connection conn) throws SQLException {
        String sql = "SELECT item_id, quantidade FROM entrega_item WHERE entrega_id = ?";
        List<EntregaItem> itens = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, entregaId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Item item = itemDAO.buscarPorId(rs.getLong("item_id"));
                itens.add(new EntregaItem(entregaId, item.getId(), item, rs.getInt("quantidade")));
            }
        }
        return itens;
    }

    private Entrega criarEntrega(ResultSet rs, Connection conn) throws SQLException {
        Entrega entrega = new Entrega();
        entrega.setId(rs.getLong("id"));
        entrega.setBeneficiario(beneficiarioDAO.buscarPorId(rs.getLong("beneficiario_id")));
        entrega.setDataEntrega(rs.getDate("data_entrega").toLocalDate());
        entrega.setStatus(StatusEntrega.valueOf(rs.getString("status")));
        entrega.setDescricao(rs.getString("descricao"));
        Long rotaId = rs.getObject("rota_id", Long.class);
        if (rotaId != null) entrega.setRota(rotaDAO.buscarPorId(rotaId));
        entrega.setItems(buscarItens(entrega.getId(), conn));
        return entrega;
    }
}
