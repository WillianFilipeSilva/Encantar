package com.encantar.controller;

import com.encantar.dao.EntregaDAO;
import com.encantar.model.Entrega;
import com.encantar.model.Rota;
import com.encantar.model.enums.StatusEntrega;

import java.util.List;

public class EntregaController {
    private final EntregaDAO dao = new EntregaDAO();

    public void salvar(Entrega entrega) {
        validar(entrega);
        if (entrega.getId() == null) {
            dao.criar(entrega);
        } else {
            dao.atualizar(entrega);
        }
    }

    public void deletar(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        dao.deletar(id);
    }

    public List<Entrega> listarTodos() {
        return dao.listarTodos();
    }

    public List<Entrega> buscarPorBeneficiario(Long beneficiarioId) {
        if (beneficiarioId == null) {
            throw new IllegalArgumentException("ID do beneficiário não pode ser nulo");
        }
        return dao.buscarPorBeneficiario(beneficiarioId);
    }

    public List<Entrega> buscarPorStatus(StatusEntrega status) {
        if (status == null) {
            throw new IllegalArgumentException("Status não pode ser nulo");
        }
        return dao.buscarPorStatus(status);
    }

    public Entrega buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        return dao.buscarPorId(id);
    }

    public void atribuirRota(Entrega entrega, Rota rota) {
        if (entrega == null) {
            throw new IllegalArgumentException("Entrega não pode ser nula");
        }
        if (rota == null) {
            throw new IllegalArgumentException("Rota não pode ser nula");
        }
        if (entrega.getStatus() != StatusEntrega.PENDENTE) {
            throw new IllegalStateException("Apenas entregas em rota podem ser atribuídas");
        }

        entrega.setRota(rota);
        dao.atualizar(entrega);
    }

    public void removerRota(Entrega entrega) {
        if (entrega == null) {
            throw new IllegalArgumentException("Entrega não pode ser nula");
        }
        if (entrega.getRota() == null) {
            throw new IllegalStateException("Entrega não está atribuída a nenhuma rota");
        }

        entrega.setRota(null);
        dao.atualizar(entrega);
    }

    private void validar(Entrega entrega) {
        if (entrega == null) {
            throw new IllegalArgumentException("Entrega não pode ser nula");
        }
        if (entrega.getBeneficiario() == null) {
            throw new IllegalArgumentException("Beneficiário é obrigatório");
        }
        if (entrega.getItem() == null) {
            throw new IllegalArgumentException("Item é obrigatório");
        }
        if (entrega.getQuantidade() <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }
        if (entrega.getDataEntrega() == null) {
            throw new IllegalArgumentException("Data é obrigatória");
        }
        if (entrega.getStatus() == null) {
            throw new IllegalArgumentException("Status é obrigatório");
        }
    }
} 