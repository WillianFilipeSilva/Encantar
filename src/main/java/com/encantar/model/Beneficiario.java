package com.encantar.model;

import com.encantar.model.enums.StatusBeneficiario;

import java.time.LocalDate;

public class Beneficiario {
    private Long id;
    private String nome;
    private String endereco;
    private String telefone;
    private String descricao;
    private StatusBeneficiario status  = StatusBeneficiario.ATIVO;
    private LocalDate dataInscricao;

    public Beneficiario() {
        this.status = StatusBeneficiario.ATIVO;
        this.dataInscricao = LocalDate.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public StatusBeneficiario getStatus() {
        return status;
    }

    public void setStatus(StatusBeneficiario status) {
        this.status = status;
    }

    public LocalDate getDataInscricao() {
        return dataInscricao;
    }

    public void setDataInscricao(LocalDate dataInscricao) {
        this.dataInscricao = dataInscricao;
    }
}
