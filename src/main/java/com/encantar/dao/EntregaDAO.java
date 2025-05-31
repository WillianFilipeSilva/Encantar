package com.encantar.dao;

import com.encantar.dao.interfaces.IEntregaDAO;
import com.encantar.dao.interfaces.IRotaDAO;
import com.encantar.model.Beneficiario;
import com.encantar.model.Entrega;
import com.encantar.model.Item;
import com.encantar.model.Rota;
import com.encantar.model.enums.StatusEntrega;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EntregaDAO implements IEntregaDAO {
    private final Conexao conexao = new Conexao();
    private final BeneficiarioDAO beneficiarioDAO = new BeneficiarioDAO();
    private final ItemDAO itemDAO = new ItemDAO();

    public void criar(Entrega entrega) {
        String sql = "INSERT INTO entrega (beneficiario_id, quantidade, data_entrega, status, descricao, rota_id) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setLong(1, entrega.getBeneficiario().getId());
            stmt.setInt(3, entrega.getQuantidade());
            stmt.setDate(4, Date.valueOf(entrega.getDataEntrega()));
            stmt.setString(5, entrega.getStatus().toString());
            stmt.setString(6, entrega.getDescricao());
            stmt.setObject(7, entrega.getRota() != null ? entrega.getRota().getId() : null);

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                entrega.setId(rs.getLong(1));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao criar entrega: " + e.getMessage(), e);
        }
    }

    public void atualizar(Entrega entrega) {
        String sql = "UPDATE entrega SET beneficiario_id = ?, quantidade = ?, data_entrega = ?, status = ?, descricao = ?, rota_id = ? WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, entrega.getBeneficiario().getId());
            stmt.setInt(3, entrega.getQuantidade());
            stmt.setDate(4, Date.valueOf(entrega.getDataEntrega()));
            stmt.setString(5, entrega.getStatus().toString());
            stmt.setString(6, entrega.getDescricao());
            stmt.setObject(7, entrega.getRota() != null ? entrega.getRota().getId() : null);
            stmt.setLong(8, entrega.getId());

            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar entrega: " + e.getMessage(), e);
        }
    }

    public void deletar(Long id) {
        String sql = "DELETE FROM entrega WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
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

            while (rs.next()) {
                entregas.add(criarEntrega(rs));
            }
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

            while (rs.next()) {
                entregas.add(criarEntrega(rs));
            }
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

            while (rs.next()) {
                entregas.add(criarEntrega(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar entregas por status: " + e.getMessage(), e);
        }

        return entregas;
    }

    @Override
    public List<Entrega> buscarPorData(LocalDate data) {
        return List.of();
    }

    @Override
    public List<Entrega> buscarPorRota(Long rotaId) {
        return List.of();
    }

    @Override
    public List<Entrega> buscarTodos() {
        return List.of();
    }

    public Entrega buscarPorId(Long id) {
        String sql = "SELECT * FROM entrega WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return criarEntrega(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar entrega: " + e.getMessage(), e);
        }

        return null;
    }

    private Entrega criarEntrega(ResultSet rs) throws SQLException {
        Entrega entrega = new Entrega();
        entrega.setId(rs.getLong("id"));

        Beneficiario beneficiario = beneficiarioDAO.buscarPorId(rs.getLong("beneficiario_id"));
        entrega.setBeneficiario(beneficiario);

        Item item = itemDAO.buscarPorId(rs.getLong("item_id"));
        entrega.setItem(item);

        entrega.setQuantidade(rs.getInt("quantidade"));
        entrega.setDataEntrega(rs.getDate("data_entrega").toLocalDate());
        entrega.setStatus(StatusEntrega.valueOf(rs.getString("status")));
        entrega.setDescricao(rs.getString("descrição"));

        Long rotaId = rs.getObject("rota_id", Long.class);
        if (rotaId != null) {
            IRotaDAO rotaDAO = new RotaDAO();
            Rota rota = rotaDAO.buscarPorId(rotaId);
            entrega.setRota(rota);
        }

        return entrega;
    }
}