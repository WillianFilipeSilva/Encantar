package com.encantar.dao;

import com.encantar.dao.interfaces.IBeneficiarioDAO;
import com.encantar.model.Beneficiario;
import com.encantar.model.enums.StatusBeneficiario;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BeneficiarioDAO implements IBeneficiarioDAO {

    private final Conexao conexao = new Conexao();

    public void criar(Beneficiario b) {
        String sql = "INSERT INTO beneficiario " +
                "(nome,endereco,telefone,descricao,status,data_inscricao) " +
                "VALUES (?,?,?,?,?,?)";

        try (Connection c = conexao.abrir();
             PreparedStatement s = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            s.setString(1, b.getNome());
            s.setString(2, b.getEndereco());
            s.setString(3, b.getTelefone());
            s.setString(4, b.getDescricao());
            s.setString(5,
                    b.getStatus() != null ? b.getStatus().toString()
                            : StatusBeneficiario.ATIVO.toString());
            s.setDate(6, Date.valueOf(LocalDate.now()));
            s.executeUpdate();

            try (ResultSet rs = s.getGeneratedKeys()) {
                if (rs.next()) b.setId(rs.getLong(1));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao criar beneficiário: " + e.getMessage(), e);
        }
    }

    public Beneficiario buscarPorId(Long id) {
        String sql = "SELECT * FROM beneficiario WHERE id = ?";

        try (Connection c = conexao.abrir();
             PreparedStatement s = c.prepareStatement(sql)) {

            s.setLong(1, id);
            try (ResultSet rs = s.executeQuery()) {
                return rs.next() ? criarBeneficiario(rs) : null;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar beneficiário: " + e.getMessage(), e);
        }
    }

    public void atualizar(Beneficiario b) {
        String sql = "UPDATE beneficiario SET " +
                "nome=?, endereco=?, telefone=?, descricao=?, status=? WHERE id=?";

        try (Connection c = conexao.abrir();
             PreparedStatement s = c.prepareStatement(sql)) {

            s.setString(1, b.getNome());
            s.setString(2, b.getEndereco());
            s.setString(3, b.getTelefone());
            s.setString(4, b.getDescricao());
            s.setString(5, b.getStatus().toString());
            s.setLong(6, b.getId());
            s.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar beneficiário: " + e.getMessage(), e);
        }
    }

    public void deletar(Long id) {
        try (Connection c = conexao.abrir();
             PreparedStatement s = c.prepareStatement(
                     "DELETE FROM beneficiario WHERE id=?")) {

            s.setLong(1, id);
            s.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar beneficiário: " + e.getMessage(), e);
        }
    }

    public List<Beneficiario> buscar(String texto,
                                     boolean emDescricao,
                                     StatusBeneficiario status) {

        StringBuilder sql = new StringBuilder("SELECT * FROM beneficiario WHERE 1=1");
        if (status != null) sql.append(" AND status = ?");
        if (texto != null && !texto.trim().isEmpty()) {
            sql.append(emDescricao
                    ? " AND descricao LIKE ?"
                    : " AND (nome LIKE ? OR endereco LIKE ? OR telefone LIKE ?)");
        }

        List<Beneficiario> lista = new ArrayList<>();

        try (Connection c = conexao.abrir();
             PreparedStatement s = c.prepareStatement(sql.toString())) {

            int idx = 1;

            if (status != null) s.setString(idx++, status.toString());

            if (texto != null && !texto.trim().isEmpty()) {
                String p = '%' + texto + '%';
                s.setString(idx++, p);
                if (!emDescricao) {
                    s.setString(idx++, p);
                    s.setString(idx++, p);
                }
            }

            try (ResultSet rs = s.executeQuery()) {
                while (rs.next()) lista.add(criarBeneficiario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro na busca de beneficiários: " + e.getMessage(), e);
        }

        return lista;
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