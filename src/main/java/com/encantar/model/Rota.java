package com.encantar.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Rota {
    private Long id;
    private String nome;
    private LocalDate data;
    private List<Entrega> entregas;

    public Rota() {
        this.entregas = new ArrayList<>();
    }

    public Rota(Long id, String nome, LocalDate data) {
        this.id = id;
        this.nome = nome;
        this.data = data;
        this.entregas = new ArrayList<>();
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

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public List<Entrega> getEntregas() {
        return entregas;
    }

    public void setEntregas(List<Entrega> entregas) {
        this.entregas = entregas != null ? entregas : new ArrayList<>();
    }

    public void adicionarEntrega(Entrega entrega) {
        if (entrega != null && !entregas.contains(entrega)) {
            entregas.add(entrega);
        }
    }

    public void removerEntrega(Entrega entrega) {
        entregas.remove(entrega);
    }
}
