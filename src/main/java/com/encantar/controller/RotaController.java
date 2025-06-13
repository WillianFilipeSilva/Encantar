package com.encantar.controller;

import com.encantar.dao.EntregaDAO;
import com.encantar.dao.RotaDAO;
import com.encantar.model.Entrega;
import com.encantar.model.EntregaItem;
import com.encantar.model.Rota;
import com.encantar.model.enums.StatusEntrega;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.FileOutputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class RotaController {
    private final RotaDAO rotaDAO = new RotaDAO();
    private final EntregaDAO entregaDAO = new EntregaDAO();

    public void salvar(Rota r) {
        validar(r);
        if (r.getId() == null) rotaDAO.criar(r);
        else rotaDAO.atualizar(r);
    }

    public void deletar(Long id) {
        if (id == null) throw new IllegalArgumentException();
        rotaDAO.deletar(id);
    }

    public List<Rota> listarTodos() {
        return rotaDAO.listarTodos();
    }

    public Rota buscarPorId(Long id) {
        if (id == null) throw new IllegalArgumentException();
        return rotaDAO.buscarPorId(id);
    }

    public List<Entrega> buscarEntregasPorRota(Long id) {
        return entregaDAO.buscarPorRota(id);
    }

    public void adicionarEntrega(Rota rota, Entrega ent) {
        if (rota.getId() == null) throw new IllegalStateException("Salve a rota antes de adicionar entregas");
        if (ent.getStatus() != StatusEntrega.PENDENTE) throw new IllegalStateException("Apenas entregas pendentes podem ser adicionadas à rota");
        if (ent.getRota() != null) throw new IllegalStateException("Esta entrega já está em outra rota");
        rotaDAO.adicionarEntrega(rota.getId(), ent.getId());
    }

    public void removerEntrega(Rota rota, Entrega ent) {
        if (rota.getId() == null) throw new IllegalStateException("Rota não salva");
        if (ent.getRota() == null || !ent.getRota().getId().equals(rota.getId())) 
            throw new IllegalStateException("Esta entrega não está nesta rota");
        rotaDAO.removerEntrega(rota.getId(), ent.getId());
    }

    public Path gerarPdf(Rota rota) throws Exception {
        Rota r = rotaDAO.buscarPorId(rota.getId());
        if (r.getEntregas().isEmpty()) {
            throw new IllegalStateException("A rota não possui entregas");
        }

        String arq = "Rota_" + r.getId() + "_" + r.getData().format(DateTimeFormatter.ofPattern("ddMMyyyy")) + ".pdf";
        Path path = Paths.get(System.getProperty("user.home"), "Desktop", arq);
        
        Document d = new Document();
        PdfWriter.getInstance(d, new FileOutputStream(path.toFile()));
        d.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);

        Paragraph title = new Paragraph("Relatório de Rota", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        d.add(title);

        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        d.add(new Paragraph("Rota: " + r.getNome(), headerFont));
        d.add(new Paragraph("Data: " + r.getData().format(f), headerFont));
        d.add(new Paragraph("Total de Entregas: " + r.getEntregas().size(), headerFont));
        d.add(new Paragraph(" "));

        for (Entrega e : r.getEntregas()) {
            d.add(new Paragraph("Beneficiário: " + e.getBeneficiario().getNome(), headerFont));
            d.add(new Paragraph("Endereço: " + e.getBeneficiario().getEndereco(), normalFont));
            d.add(new Paragraph("Descrição: " + e.getDescricao(), normalFont));
            d.add(new Paragraph("Itens:", normalFont));
            
            for (EntregaItem it : e.getItems()) {
                d.add(new Paragraph("   • " + it.getQuantidade() + "x " + it.getItem().getNome(), normalFont));
            }
            
            d.add(new Paragraph("Status: " + e.getStatus(), normalFont));
            d.add(new Paragraph(" "));
            d.add(new Paragraph("----------------------------------------"));
            d.add(new Paragraph(" "));
        }

        d.close();
        return path;
    }

    private void validar(Rota r) {
        if (r.getNome() == null || r.getNome().isBlank()) throw new IllegalArgumentException("Nome da rota é obrigatório");
        if (r.getData() == null || r.getData().isBefore(LocalDate.now())) throw new IllegalArgumentException("Data inválida");
    }
}
