package main.java.com.encantar.model;

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
	
}
