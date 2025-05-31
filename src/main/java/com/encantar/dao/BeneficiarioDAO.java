package com.encantar.dao;

import com.encantar.dao.interfaces.IBeneficiarioDAO;
import com.encantar.model.Beneficiario;
import com.encantar.model.enums.StatusBeneficiario;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BeneficiarioDAO implements IBeneficiarioDAO {
    private final Conexao conexao = new Conexao();

    public void criar(Beneficiario beneficiario) {
        String sql = "INSERT INTO beneficiario (nome, endereco, telefone, descricao, status, data_inscricao) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, beneficiario.getNome());
            stmt.setString(2, beneficiario.getEndereco());
            stmt.setString(3, beneficiario.getTelefone());
            stmt.setString(4, beneficiario.getDescricao());
            stmt.setString(5, beneficiario.getStatus().toString());
            stmt.setDate(6, Date.valueOf(beneficiario.getDataInscricao()));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                beneficiario.setId(rs.getLong(1));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao criar beneficiário: " + e.getMessage(), e);
        }
    }

    @Override
    public Beneficiario buscarPorId(Long id) {
        return null;
    }

    public void atualizar(Beneficiario beneficiario) {
        String sql = "UPDATE beneficiario SET nome = ?, endereco = ?, telefone = ?, descricao = ?, status = ? WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, beneficiario.getNome());
            stmt.setString(2, beneficiario.getEndereco());
            stmt.setString(3, beneficiario.getTelefone());
            stmt.setString(4, beneficiario.getDescricao());
            stmt.setString(5, beneficiario.getStatus().toString());
            stmt.setLong(6, beneficiario.getId());

            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar beneficiário: " + e.getMessage(), e);
        }
    }

    public void deletar(Long id) {
        String sql = "DELETE FROM beneficiario WHERE id = ?";

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar beneficiário: " + e.getMessage(), e);
        }
    }

    public List<Beneficiario> buscar(String texto, boolean buscarEmDescricao, StatusBeneficiario status) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT * FROM beneficiario WHERE status = ?");

        if (texto != null && !texto.trim().isEmpty()) {
            if (buscarEmDescricao) {
                sql.append(" AND descricao LIKE ?");
            } else {
                sql.append(" AND (nome LIKE ? OR endereco LIKE ? OR telefone LIKE ?)");
            }
        }

        List<Beneficiario> beneficiarios = new ArrayList<>();

        try (Connection conn = conexao.abrir();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            stmt.setString(1, status.toString());

            if (texto != null && !texto.trim().isEmpty()) {
                String parametro = "%" + texto + "%";
                if (buscarEmDescricao) {
                    stmt.setString(2, parametro);
                } else {
                    stmt.setString(2, parametro);
                    stmt.setString(3, parametro);
                    stmt.setString(4, parametro);
                }
            }

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                beneficiarios.add(criarBeneficiario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar beneficiários: " + e.getMessage(), e);
        }

        return beneficiarios;
    }

    private Beneficiario criarBeneficiario(ResultSet rs) throws SQLException {
        Beneficiario b = new Beneficiario();
        b.setId(rs.getLong("id"));
        b.setNome(rs.getString("nome"));
        b.setEndereco(rs.getString("endereco"));
        b.setTelefone(rs.getString("telefone"));
        b.setDescricao(rs.getString("descricao"));
        b.setStatus(StatusBeneficiario.valueOf(rs.getString("status")));
        b.setDataInscricao(rs.getDate("data_inscricao").toLocalDate());
        return b;
    }
} 