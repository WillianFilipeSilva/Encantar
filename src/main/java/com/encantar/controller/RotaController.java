package com.encantar.controller;

import com.encantar.dao.RotaDAO;
import com.encantar.model.Entrega;
import com.encantar.model.Rota;
import com.encantar.model.enums.StatusEntrega;

import java.time.LocalDate;
import java.util.List;

public class RotaController {
    private final RotaDAO dao = new RotaDAO();

    public void salvar(Rota rota) {
        validar(rota);
        if (rota.getId() == null) {
            dao.criar(rota);
        } else {
            dao.atualizar(rota);
        }
    }

    public void deletar(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        dao.deletar(id);
    }

    public List<Rota> listarTodos() {
        return dao.listarTodos();
    }

    public List<Rota> buscarPorData(LocalDate data) {
        if (data == null) {
            throw new IllegalArgumentException("Data não pode ser nula");
        }
        return dao.buscarPorData(data);
    }

    public Rota buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        return dao.buscarPorId(id);
    }

    public void adicionarEntrega(Rota rota, Entrega entrega) {
        if (rota == null || entrega == null) {
            throw new IllegalArgumentException("Rota e entrega não podem ser nulos");
        }

        if (entrega.getStatus() != StatusEntrega.PENDENTE) {
            throw new IllegalStateException("Apenas entregas em rota podem ser adicionadas");
        }

        rota.adicionarEntrega(entrega);
        dao.atualizar(rota);
    }

    public void removerEntrega(Rota rota, Entrega entrega) {
        if (rota == null || entrega == null) {
            throw new IllegalArgumentException("Rota e entrega não podem ser nulos");
        }

        rota.removerEntrega(entrega);
        dao.atualizar(rota);
    }

    private void validar(Rota rota) {
        if (rota == null) {
            throw new IllegalArgumentException("Rota não pode ser nula");
        }
        if (rota.getNome() == null || rota.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (rota.getData() == null) {
            throw new IllegalArgumentException("Data é obrigatória");
        }
        if (rota.getData().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Data não pode ser anterior a hoje");
        }
    }
} 