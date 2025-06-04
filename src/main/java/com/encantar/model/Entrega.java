package com.encantar.model;

import com.encantar.model.enums.StatusEntrega;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Entrega {
    private Long id;
    private Beneficiario beneficiario;
    private LocalDate dataEntrega;
    private StatusEntrega status;
    private String descricao;
    private Rota rota;
    private List<EntregaItem> items = new ArrayList<>();

    public Entrega(Long id, Beneficiario beneficiario, String descricao, Rota rota) {
        this.id = id;
        this.beneficiario = beneficiario;
        this.dataEntrega = LocalDate.now();
        this.status = StatusEntrega.PENDENTE;
        this.descricao = descricao;
        this.rota = rota;
    }

    public Entrega() {
        this.dataEntrega = LocalDate.now();
        this.status = StatusEntrega.PENDENTE;
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

    public List<EntregaItem> getItems() {
        return items;
    }

    public void setItems(List<EntregaItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }
}
