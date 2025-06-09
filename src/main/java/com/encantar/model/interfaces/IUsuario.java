package com.encantar.model.interfaces;

import com.encantar.model.Usuario;

import java.util.List;

public interface IUsuario {
    void criar(Usuario usuario);

    Usuario buscarPorLogin(String login);

    List<Usuario> listarTodos();

    void atualizar(Usuario usuario);

    void deletar(String login);
}
