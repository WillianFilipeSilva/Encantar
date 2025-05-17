package main.java.com.encantar.model.interfaces;

import main.java.com.encantar.model.EntregaItem;

import java.util.List;

public interface IEntregaItem {
    void criar(EntregaItem item);

    EntregaItem buscarPorId(Long id);

    List<EntregaItem> listarTodos();

    void atualizar(EntregaItem item);

    void deletar(Long id);
}
