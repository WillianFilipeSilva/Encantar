package com.encantar.dao.interfaces;

import com.encantar.model.Rota;

import java.time.LocalDate;
import java.util.List;

public interface IRotaDAO extends IDAO<Rota> {

    void criar(Rota rota);

    Rota buscarPorId(Long id);

    List<Rota> buscarPorData(LocalDate data);

    List<Rota> listarTodos();

    void adicionarEntrega(Long rotaId, Long entregaId);

    void removerEntrega(Long rotaId, Long entregaId);

    void deletar(Long id);

    void atualizar(Rota rota);
} 