package main.java.com.encantar.model.entidades;

import main.java.com.encantar.model.interfaces.entidades.IRota;

import java.time.LocalDate;

public class Rota implements IRota {

    private long id;
    private String titulo;
    private LocalDate dataRota;
    private String descricao;

    public Rota() {}

    public Rota(Long id, String titulo, LocalDate dataRota, String descricao) {
        this.id = id;
        this.titulo = titulo;
        this.dataRota  = dataRota;
        this.descricao = descricao;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) { this.titulo = titulo; }

    public LocalDate getDataRota() {
        return dataRota;
    }

    public void setDataRota(LocalDate dataRota) {
        this.dataRota = dataRota;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}