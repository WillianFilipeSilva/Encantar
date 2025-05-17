package main.java.com.encantar.model;

import main.java.com.encantar.model.interfaces.IUsuario;

import java.time.LocalDateTime;
import java.util.List;

public class Usuario implements IUsuario {
    private Long id;
    private String nome;
    private String login;
    private String senhaHash;
    private LocalDateTime criadoEm;

    public Usuario() {}

    public Usuario(Long id, String nome, String login, String senhaHash, LocalDateTime criadoEm) {
        this.id = id;
        this.nome = nome;
        this.login = login;
        this.senhaHash = senhaHash;
        this.criadoEm = criadoEm;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }

    public void setNome(String nome) { this.nome = nome; }

    public String getLogin() { return login; }

    public void setLogin(String login) { this.login = login; }

    public String getSenhaHash() { return senhaHash; }

    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }

    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    @Override
    public void criar(Usuario usuario) {

    }

    @Override
    public Usuario buscarPorLogin(String login) {
        return null;
    }

    @Override
    public List<Usuario> listarTodos() {
        return List.of();
    }

    @Override
    public void atualizar(Usuario usuario) {

    }

    @Override
    public void deletar(String login) {

    }
}
