package com.encantar.model;

import com.encantar.model.enums.StatusEntrega;

import java.time.LocalDate;

public class Entrega {
    private Long id;
    private Beneficiario beneficiario;
    private Item item;
    private int quantidade;
    private LocalDate dataEntrega;
    private StatusEntrega status;
    private String descricao;
    private Rota rota;

    public Entrega() {
        this.status = StatusEntrega.PENDENTE;
        this.dataEntrega = LocalDate.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Beneficiario getBeneficiario() {
        return beneficiario;
    }

    public void setBeneficiario(Beneficiario beneficiario) {
        this.beneficiario = beneficiario;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public LocalDate getDataEntrega() {
        return dataEntrega;
    }

    public void setDataEntrega(LocalDate dataEntrega) {
        this.dataEntrega = dataEntrega;
    }

    public StatusEntrega getStatus() {
        return status;
    }

    public void setStatus(StatusEntrega status) {
        this.status = status;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Rota getRota() {
        return rota;
    }

    public void setRota(Rota rota) {
        this.rota = rota;
    }

    @Override
    public String toString() {
        return String.format("%s - %s - %d %s",
                beneficiario.getNome(),
                item.getNome(),
                quantidade,
                status);
    }
} 