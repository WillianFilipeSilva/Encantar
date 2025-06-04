package com.encantar.model;

import com.encantar.model.enums.StatusBeneficiario;

import java.time.LocalDate;

public class Beneficiario {
    private Long id;
    private String nome;
    private String endereco;
    private String telefone;
    private String descricao;
    private StatusBeneficiario status;
    private LocalDate dataInscricao;

    public Beneficiario() {
    }

    public Beneficiario(Long id, String nome, String endereco, String telefone, String descricao, StatusBeneficiario status, LocalDate dataInscricao) {
        this.id = id;
        this.nome = nome;
        this.endereco = endereco;
        this.telefone = telefone;
        this.descricao = descricao;
        this.status = status;
        this.dataInscricao = dataInscricao;
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
