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
        String sql = "INSERT INTO entrega (beneficiario_id, data_entrega, status, descricao, rota_id) " +
                "VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = conexao.abrir()) {
            conn.setAutoCommit(false);

            try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setLong(1, entrega.getBeneficiario().getId());
                ps.setDate(2, Date.valueOf(entrega.getDataEntrega()));
                ps.setString(3, entrega.getStatus().toString());
                ps.setString(4, entrega.getDescricao());
                if (entrega.getRota() != null) ps.setLong(5, entrega.getRota().getId());
                else ps.setNull(5, Types.BIGINT);
                ps.executeUpdate();

                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) entrega.setId(rs.getLong(1));
                }
            }

            inserirItens(entrega, conn);
            conn.commit();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao criar entrega: " + e.getMessage(), e);
        }
    }

    public void atualizar(Entrega entrega) {
        String sql = "UPDATE entrega SET beneficiario_id=?, data_entrega=?, status=?, " +
                "descricao=?, rota_id=? WHERE id=?";
        try (Connection conn = conexao.abrir()) {
            conn.setAutoCommit(false);

            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setLong(1, entrega.getBeneficiario().getId());
                ps.setDate(2, Date.valueOf(entrega.getDataEntrega()));
                ps.setString(3, entrega.getStatus().toString());
                ps.setString(4, entrega.getDescricao());
                if (entrega.getRota() != null) ps.setLong(5, entrega.getRota().getId());
                else ps.setNull(5, Types.BIGINT);
                ps.setLong(6, entrega.getId());
                ps.executeUpdate();
            }

            try (PreparedStatement del = conn.prepareStatement(
                    "DELETE FROM entrega_item WHERE entrega_id=?")) {
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

            try (PreparedStatement delItens = conn.prepareStatement(
                    "DELETE FROM entrega_item WHERE entrega_id=?")) {
                delItens.setLong(1, id);
                delItens.executeUpdate();
            }

            try (PreparedStatement delEnt = conn.prepareStatement(
                    "DELETE FROM entrega WHERE id=?")) {
                delEnt.setLong(1, id);
                delEnt.executeUpdate();
            }

            conn.commit();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar entrega: " + e.getMessage(), e);
        }
    }

    public List<Entrega> listarTodos() {
        return buscar("SELECT * FROM entrega", null, null);
    }

    public List<Entrega> buscarPorBeneficiario(Long beneficiarioId) {
        return buscar("SELECT * FROM entrega WHERE beneficiario_id = ?",
                ps -> ps.setLong(1, beneficiarioId), null);
    }

    public List<Entrega> buscarPorStatus(StatusEntrega status) {
        return buscar("SELECT * FROM entrega WHERE status = ?",
                ps -> ps.setString(1, status.toString()), null);
    }

    public List<Entrega> buscarPorData(LocalDate data) {
        return buscar("SELECT * FROM entrega WHERE data_entrega = ?",
                ps -> ps.setDate(1, Date.valueOf(data)), null);
    }

    public List<Entrega> buscarPorRota(Long rotaId) {
        return buscar("SELECT * FROM entrega WHERE rota_id = ?",
                ps -> ps.setLong(1, rotaId),
                false);
    }

    public List<Entrega> buscarPorTexto(String texto) {
        return buscar(
            "SELECT DISTINCT e.* FROM entrega e " +
            "INNER JOIN beneficiario b ON e.beneficiario_id = b.id " +
            "WHERE LOWER(b.nome) LIKE LOWER(?) OR LOWER(e.descricao) LIKE LOWER(?)",
            ps -> {
                ps.setString(1, "%" + texto + "%");
                ps.setString(2, "%" + texto + "%");
            },
            null
        );
    }

    public List<Entrega> buscarTodos() {
        return listarTodos();
    }

    public Entrega buscarPorId(Long id) {
        List<Entrega> list = buscar("SELECT * FROM entrega WHERE id = ?",
                ps -> ps.setLong(1, id), null);
        return list.isEmpty() ? null : list.get(0);
    }

    private List<Entrega> buscar(String sql,
                                 ParamSetter paramSetter,
                                 Boolean carregarRota) {

        List<Entrega> lista = new ArrayList<>();
        boolean fetchRota = carregarRota == null || carregarRota;

        try (Connection conn = conexao.abrir();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            if (paramSetter != null) paramSetter.accept(ps);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(criarEntrega(rs, conn, fetchRota));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao consultar entregas: " + e.getMessage(), e);
        }
        return lista;
    }

    private void inserirItens(Entrega entrega, Connection conn) throws SQLException {
        String sql = "INSERT INTO entrega_item (entrega_id, item_id, quantidade) VALUES (?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (EntregaItem ei : entrega.getItems()) {
                ps.setLong(1, entrega.getId());
                ps.setLong(2, ei.getItem().getId());
                ps.setInt(3, ei.getQuantidade());
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    private List<EntregaItem> buscarItens(Long entregaId, Connection conn) throws SQLException {
        List<EntregaItem> itens = new ArrayList<>();
        String sql = "SELECT item_id, quantidade FROM entrega_item WHERE entrega_id = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, entregaId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Item item = itemDAO.buscarPorId(rs.getLong("item_id"));
                    itens.add(new EntregaItem(entregaId,
                            item.getId(),
                            item,
                            rs.getInt("quantidade")));
                }
            }
        }
        return itens;
    }

    private Entrega criarEntrega(ResultSet rs,
                                 Connection conn,
                                 boolean fetchRota) throws SQLException {

        Entrega e = new Entrega();
        e.setId(rs.getLong("id"));
        e.setBeneficiario(beneficiarioDAO.buscarPorId(rs.getLong("beneficiario_id")));
        e.setDataEntrega(rs.getDate("data_entrega").toLocalDate());
        e.setStatus(StatusEntrega.valueOf(rs.getString("status")));
        e.setDescricao(rs.getString("descricao"));

        Long rotaId = rs.getObject("rota_id", Long.class);
        if (rotaId != null && fetchRota) e.setRota(rotaDAO.buscarPorId(rotaId));

        e.setItems(buscarItens(e.getId(), conn));

        return e;
    }

    private interface ParamSetter {
        void accept(PreparedStatement ps) throws SQLException;
    }
}
