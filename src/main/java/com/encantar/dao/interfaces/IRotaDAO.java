package com.encantar.dao.interfaces;

import com.encantar.model.Rota;

import java.time.LocalDate;
import java.util.List;

public interface IRotaDAO extends IDAO<Rota> {
    List<Rota> buscarPorData(LocalDate data);

    List<Rota> buscarTodos();

    void adicionarEntrega(Long rotaId, Long entregaId);

    void removerEntrega(Long rotaId, Long entregaId);
} 