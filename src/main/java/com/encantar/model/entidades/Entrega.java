package main.java.com.encantar.model.entidades;

import main.java.com.encantar.model.enums.StatusEntrega;
import main.java.com.encantar.model.interfaces.entidades.IEntrega;

import java.time.LocalDate;

public class Entrega implements IEntrega {
    private Long id;
    private String descricao;
    private LocalDate dataEntrega;
    private StatusEntrega statusEntrega;

    public Entrega() {}

    public Entrega(Long id, String descricao, LocalDate dataEntrega, StatusEntrega statusEntrega) {
        this.id = id;
        this.descricao = descricao;
        this.dataEntrega = dataEntrega;
        this.statusEntrega = statusEntrega;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getDescricao() { return descricao; }

    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDate getDataEntrega() { return dataEntrega; }

    public void setDataEntrega(LocalDate dataEntrega) { this.dataEntrega = dataEntrega; }

    public StatusEntrega getStatusEntrega() { return statusEntrega; }

    public void setStatusEntrega(StatusEntrega statusEntrega) { this.statusEntrega = statusEntrega; }
}
