package main.java.com.encantar.model.dao;

import main.java.com.encantar.model.config.Conexao;
import main.java.com.encantar.model.entidades.Beneficiario;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;

public class BeneficiarioDAO {

    public void cadastrar(Beneficiario b) {
        String sql = "INSERT INTO beneficiario(nome, endereco, telefone, observacoes, status, data_inscricao) "
                + "VALUES(?,?,?,?,?,?)";
        try (Connection conn = Conexao.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, b.getNome());
            ps.setString(2, b.getEndereco());
            ps.setString(3, b.getTelefone());
            ps.setString(4, b.getObservacoes());
            ps.setString(5, b.getStatus().name());
            ps.setDate(6, Date.valueOf(b.getDataInscricao()));

            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    b.setId(rs.getLong(1));
                }
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    public Beneficiario buscarPorId(Long id) {
        String sql = "SELECT * FROM beneficiario WHERE id = ?";
        try (Connection conn = Conexao.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapear(rs);
                }
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return null;
    }

    public List<Beneficiario> listarTodos() {
        List<Beneficiario> lista = new ArrayList<>();
        String sql = "SELECT * FROM beneficiario";
        try (Connection conn = Conexao.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                lista.add(mapear(rs));
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return lista;
    }

    public void atualizar(Beneficiario b) {
        String sql = "UPDATE beneficiario SET nome=?, endereco=?, telefone=?, observacoes=?, status=?, data_inscricao=? "
                + "WHERE id=?";
        try (Connection conn = Conexao.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, b.getNome());
            ps.setString(2, b.getEndereco());
            ps.setString(3, b.getTelefone());
            ps.setString(4, b.getObservacoes());
            ps.setString(5, b.getStatus().name());
            ps.setDate(6, Date.valueOf(b.getDataInscricao()));
            ps.setLong(7, b.getId());

            ps.executeUpdate();
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    public void deletar(Long id) {
        String sql = "DELETE FROM beneficiario WHERE id = ?";
        try (Connection conn = Conexao.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    private Beneficiario mapear(ResultSet rs) throws SQLException {
        Beneficiario b = new Beneficiario();
        b.setId(rs.getLong("id"));
        b.setNome(rs.getString("nome"));
        b.setEndereco(rs.getString("endereco"));
        b.setTelefone(rs.getString("telefone"));
        b.setObservacoes(rs.getString("observacoes"));
        b.setStatus(Enum.valueOf(main.java.com.encantar.model.entidades.StatusBeneficiario.class,
                rs.getString("status")));
        b.setDataInscricao(rs.getDate("data_inscricao").toLocalDate());
        return b;
    }
}
