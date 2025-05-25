package main.java.com.encantar.model.entidades;

import java.time.LocalDate;

import main.java.com.encantar.model.enums.StatusBeneficiario;

public class Beneficiario {
	private Long id;
	private String nome;
	private String endereco;
	private String telefone;
	private String observacoes;
	private StatusBeneficiario status;
	private LocalDate dataInscricao;

	public Beneficiario() {}

	public Beneficiario(Long id, LocalDate dataInscricao, StatusBeneficiario status, String observacoes, String telefone, String endereco, String nome) {
		this.id = id;
		this.dataInscricao = dataInscricao;
		this.status = status;
		this.observacoes = observacoes;
		this.telefone = telefone;
		this.endereco = endereco;
		this.nome = nome;
	}

	public Long getId() { return id; }

	public void setId(Long id) { this.id = id; }

	public String getNome() { return nome; }

	public void setNome(String nome) { this.nome = nome; }

	public String getEndereco() { return endereco; }

	public void setEndereco(String endereco) { this.endereco = endereco; }

	public String getTelefone() { return telefone; }

	public void setTelefone(String telefone) { this.telefone = telefone; }

	public String getObservacoes() { return observacoes; }

	public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

	public StatusBeneficiario getStatus() { return status; }

	public void setStatus(StatusBeneficiario status) { this.status = status; }

	public LocalDate getDataInscricao() { return dataInscricao; }

	public void setDataInscricao(LocalDate dataInscricao) { this.dataInscricao = dataInscricao; }
}
