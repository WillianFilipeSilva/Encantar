package main.java.com.encantar.model;

public class Rota {

    private long id;
    private String titulo;
    private LocalDate dataRota;
    private String descricao;

    public Rota() {}

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }L

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

    public Rota(Long id, String titulo, LocalDate dataRota, String descricao) {
        this.id = id;
        this.titulo = titulo;
        this.Localdate dataRota  = Localdate dataRota;
        this.descricao = descricao;
    }
}
