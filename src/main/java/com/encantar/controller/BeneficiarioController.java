package com.encantar.controller;

import com.encantar.dao.BeneficiarioDAO;
import com.encantar.model.Beneficiario;
import com.encantar.model.enums.StatusBeneficiario;

import java.util.List;

public class BeneficiarioController {
    private final BeneficiarioDAO dao = new BeneficiarioDAO();

    public void salvar(Beneficiario beneficiario) {
        validar(beneficiario);
        if (beneficiario.getId() == null) {
            dao.criar(beneficiario);
        } else {
            dao.atualizar(beneficiario);
        }
    }

    public void deletar(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        dao.deletar(id);
    }

    public List<Beneficiario> buscar(String texto, boolean buscarEmDescricao, StatusBeneficiario status) {
        return dao.buscar(texto, buscarEmDescricao, status);
    }

    public Beneficiario buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID não pode ser nulo");
        }
        List<Beneficiario> beneficiarios = dao.buscar(null, false, StatusBeneficiario.ATIVO);
        return beneficiarios.stream()
                .filter(b -> id.equals(b.getId()))
                .findFirst()
                .orElse(null);
    }

    private void validar(Beneficiario beneficiario) {
        if (beneficiario == null) {
            throw new IllegalArgumentException("Beneficiário não pode ser nulo");
        }
        if (beneficiario.getNome() == null || beneficiario.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (beneficiario.getEndereco() == null || beneficiario.getEndereco().trim().isEmpty()) {
            throw new IllegalArgumentException("Endereço é obrigatório");
        }
        if (beneficiario.getTelefone() == null || beneficiario.getTelefone().trim().isEmpty()) {
            throw new IllegalArgumentException("Telefone é obrigatório");
        }
    }
} 