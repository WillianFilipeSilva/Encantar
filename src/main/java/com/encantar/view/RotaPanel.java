package com.encantar.view;

import com.encantar.controller.RotaController;
import com.encantar.controller.EntregaController;
import com.encantar.model.Entrega;
import com.encantar.model.EntregaItem;
import com.encantar.model.Rota;
import com.encantar.model.enums.StatusEntrega;

import javax.swing.*;
import javax.swing.border.Border;
import javax.swing.border.LineBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class RotaPanel extends JPanel {
    private final RotaController controller = new RotaController();
    private final EntregaController entregaController = new EntregaController();
    private final DefaultTableModel tabelaPadrao;
    private final JTable tabela;

    private final JTextField campoNome = new JTextField(20);
    private final JTextField campoData = new JTextField(10);

    private final DefaultTableModel tabelaEntregasPadrao;
    private final JTable tabelaEntregas;

    private final JButton botaoLimpar = new JButton("Novo");
    private final JButton botaoSalvar = new JButton("Salvar");
    private final JButton botaoExcluir = new JButton("Excluir");
    private final JButton botaoGerarPDF = new JButton("Gerar PDF");
    private final JButton botaoAdicionarEntrega = new JButton("Adicionar Entrega");
    private final JButton botaoRemoverEntrega = new JButton("Remover Entrega");

    private Rota rotaEmEdicao;

    public RotaPanel() {
        Border bordaArredondada = new LineBorder(Color.lightGray, 1, true);
        int altura = 25;

        setLayout(new BorderLayout());

        campoNome.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoData.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoNome.setBorder(bordaArredondada);
        campoData.setBorder(bordaArredondada);

        campoData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        JPanel painelFormulario = new JPanel();
        painelFormulario.setLayout(new BoxLayout(painelFormulario, BoxLayout.Y_AXIS));

        painelFormulario.add(new JLabel("Nome:"));
        painelFormulario.add(campoNome);
        painelFormulario.add(Box.createVerticalStrut(10));

        painelFormulario.add(new JLabel("Data:"));
        painelFormulario.add(campoData);

        JPanel botoes = new JPanel();
        botoes.add(botaoLimpar);
        botoes.add(botaoSalvar);
        botoes.add(botaoExcluir);
        botoes.add(botaoGerarPDF);

        JPanel painelEsquerdo = new JPanel(new BorderLayout());
        painelEsquerdo.setPreferredSize(new Dimension(300, 400));
        painelEsquerdo.add(painelFormulario, BorderLayout.CENTER);
        painelEsquerdo.add(botoes, BorderLayout.SOUTH);

        tabelaPadrao = new DefaultTableModel(
                new Object[]{"ID", "Nome", "Data", "Qtd. Entregas"}, 0) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        tabela = new JTable(tabelaPadrao);
        JScrollPane rolagemTabela = new JScrollPane(tabela);
        rolagemTabela.setBorder(BorderFactory.createLineBorder(Color.LIGHT_GRAY, 1, true));

        tabelaEntregasPadrao = new DefaultTableModel(
                new Object[]{"ID", "Beneficiário", "Itens", "Status"}, 0) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        tabelaEntregas = new JTable(tabelaEntregasPadrao);
        JScrollPane rolagemEntregas = new JScrollPane(tabelaEntregas);
        rolagemEntregas.setBorder(BorderFactory.createLineBorder(Color.LIGHT_GRAY, 1, true));

        JPanel botoesEntregas = new JPanel();
        botoesEntregas.add(botaoAdicionarEntrega);
        botoesEntregas.add(botaoRemoverEntrega);

        JPanel painelEntregas = new JPanel(new BorderLayout());
        painelEntregas.setBorder(BorderFactory.createEmptyBorder(10, 0, 0, 15));
        painelEntregas.add(new JLabel("Entregas da Rota:"), BorderLayout.NORTH);
        painelEntregas.add(rolagemEntregas, BorderLayout.CENTER);
        painelEntregas.add(botoesEntregas, BorderLayout.SOUTH);

        JPanel esquerdaComEspaco = new JPanel(new BorderLayout());
        esquerdaComEspaco.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 10));
        esquerdaComEspaco.add(painelEsquerdo, BorderLayout.CENTER);

        JPanel painelTabela = new JPanel(new BorderLayout());
        painelTabela.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 15));
        painelTabela.add(rolagemTabela, BorderLayout.CENTER);

        JSplitPane painelCentral = new JSplitPane(JSplitPane.VERTICAL_SPLIT, painelTabela, painelEntregas);
        painelCentral.setDividerLocation(250);

        add(esquerdaComEspaco, BorderLayout.WEST);
        add(painelCentral, BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
    }

    private void configurarEventos() {
        botaoLimpar.addActionListener(e -> limparFormulario());

        botaoSalvar.addActionListener(e -> {
            try {
                if (rotaEmEdicao == null) rotaEmEdicao = new Rota();
                rotaEmEdicao.setNome(campoNome.getText());
                rotaEmEdicao.setData(LocalDate.parse(campoData.getText(), DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                controller.salvar(rotaEmEdicao);
                limparFormulario();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Rota salva com sucesso!");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro ao salvar: " + ex.getMessage());
            }
        });

        botaoExcluir.addActionListener(e -> {
            if (rotaEmEdicao != null && rotaEmEdicao.getId() != null) {
                if (JOptionPane.showConfirmDialog(this, "Deseja realmente excluir esta rota?", "Confirmação", JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION) {
                    try {
                        controller.deletar(rotaEmEdicao.getId());
                        limparFormulario();
                        atualizarTabela();
                        JOptionPane.showMessageDialog(this, "Rota excluída com sucesso!");
                    } catch (Exception ex) {
                        JOptionPane.showMessageDialog(this, "Erro ao excluir: " + ex.getMessage());
                    }
                }
            }
        });

        tabela.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && tabela.getSelectedRow() != -1) {
                Long id = (Long) tabela.getValueAt(tabela.getSelectedRow(), 0);
                rotaEmEdicao = controller.buscarPorId(id);
                if (rotaEmEdicao != null) {
                    preencherFormulario(rotaEmEdicao);
                    atualizarTabelaEntregas();
                }
            }
        });

        botaoAdicionarEntrega.addActionListener(e -> {
            if (rotaEmEdicao != null) {
                List<Entrega> entregasDisponiveis = entregaController.buscarPorStatus(StatusEntrega.PENDENTE);
                if (!entregasDisponiveis.isEmpty()) {
                    Entrega entrega = (Entrega) JOptionPane.showInputDialog(this, "Selecione a entrega para adicionar:", "Adicionar Entrega", JOptionPane.QUESTION_MESSAGE, null, entregasDisponiveis.toArray(), entregasDisponiveis.get(0));
                    if (entrega != null) {
                        try {
                            controller.adicionarEntrega(rotaEmEdicao, entrega);
                            atualizarTabelaEntregas();
                            atualizarTabela();
                        } catch (Exception ex) {
                            JOptionPane.showMessageDialog(this, "Erro ao adicionar entrega: " + ex.getMessage());
                        }
                    }
                } else {
                    JOptionPane.showMessageDialog(this, "Não há entregas disponíveis para adicionar");
                }
            }
        });

        botaoRemoverEntrega.addActionListener(e -> {
            if (rotaEmEdicao != null && tabelaEntregas.getSelectedRow() != -1) {
                Long entregaId = (Long) tabelaEntregasPadrao.getValueAt(tabelaEntregas.getSelectedRow(), 0);
                Entrega entrega = entregaController.buscarPorId(entregaId);
                if (entrega != null) {
                    try {
                        controller.removerEntrega(rotaEmEdicao, entrega);
                        atualizarTabelaEntregas();
                        atualizarTabela();
                    } catch (Exception ex) {
                        JOptionPane.showMessageDialog(this, "Erro ao remover entrega: " + ex.getMessage());
                    }
                }
            }
        });

        botaoGerarPDF.addActionListener(e -> {
            if (rotaEmEdicao != null && rotaEmEdicao.getId() != null) {
                try {
                    String nomeArquivo = "Rota_" + rotaEmEdicao.getId() + ".pdf";
                    com.itextpdf.text.Document document = new com.itextpdf.text.Document();
                    com.itextpdf.text.pdf.PdfWriter.getInstance(document, new java.io.FileOutputStream(nomeArquivo));
                    document.open();
                    document.add(new com.itextpdf.text.Paragraph("Rota: " + rotaEmEdicao.getNome()));
                    document.add(new com.itextpdf.text.Paragraph("Data: " + rotaEmEdicao.getData().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
                    document.add(new com.itextpdf.text.Paragraph("\n"));
                    for (Entrega entrega : rotaEmEdicao.getEntregas()) {
                        document.add(new com.itextpdf.text.Paragraph("Beneficiário: " + entrega.getBeneficiario().getNome()));
                        document.add(new com.itextpdf.text.Paragraph("Endereço: " + entrega.getBeneficiario().getEndereco()));
                        document.add(new com.itextpdf.text.Paragraph("Telefone: " + entrega.getBeneficiario().getTelefone()));
                        document.add(new com.itextpdf.text.Paragraph("Descricao: " + entrega.getDescricao()));
                        document.add(new com.itextpdf.text.Paragraph("\n"));
                        for (EntregaItem ei : entrega.getItems()) {
                            document.add(new com.itextpdf.text.Paragraph("Item: " + ei.getItem().getNome()));
                            document.add(new com.itextpdf.text.Paragraph("Quantidade: " + ei.getQuantidade()));
                        }
                        document.add(new com.itextpdf.text.Paragraph("\n"));
                    }
                    document.close();
                    JOptionPane.showMessageDialog(this, "PDF gerado com sucesso: " + nomeArquivo);
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Erro ao gerar PDF: " + ex.getMessage());
                }
            }
        });
    }

    private void limparFormulario() {
        rotaEmEdicao = null;
        campoNome.setText("");
        campoData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        tabela.clearSelection();
        tabelaEntregasPadrao.setRowCount(0);
    }

    private void preencherFormulario(Rota rota) {
        campoNome.setText(rota.getNome());
        campoData.setText(rota.getData().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
    }

    private void atualizarTabela() {
        tabelaPadrao.setRowCount(0);
        List<Rota> rotas = controller.listarTodos();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        for (Rota r : rotas) {
            tabelaPadrao.addRow(new Object[]{
                    r.getId(),
                    r.getNome(),
                    r.getData().format(fmt),
                    r.getEntregas().size()
            });
        }
    }

    private void atualizarTabelaEntregas() {
        tabelaEntregasPadrao.setRowCount(0);
        if (rotaEmEdicao != null) {
            for (Entrega e : rotaEmEdicao.getEntregas()) {
                StringBuilder itens = new StringBuilder();
                for (EntregaItem ei : e.getItems()) {
                    if (itens.length() > 0) itens.append(", ");
                    itens.append(ei.getQuantidade()).append("x ").append(ei.getItem().getNome());
                }
                tabelaEntregasPadrao.addRow(new Object[]{
                        e.getId(),
                        e.getBeneficiario().getNome(),
                        itens.toString(),
                        e.getStatus()
                });
            }
        }

        tabela.getColumnModel().getColumn(0).setMinWidth(0);
        tabela.getColumnModel().getColumn(0).setMaxWidth(0);
    }
}
