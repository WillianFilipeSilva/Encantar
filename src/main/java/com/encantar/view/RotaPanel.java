package com.encantar.view;

import com.encantar.controller.EntregaController;
import com.encantar.controller.RotaController;
import com.encantar.model.Entrega;
import com.encantar.model.Rota;
import com.encantar.model.enums.StatusEntrega;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class RotaPanel extends JPanel {
    private final RotaController controller = new RotaController();
    private final EntregaController entregaController = new EntregaController();
    private final DefaultTableModel tableModel;
    private final JTable table;

    // Campos do formulário
    private final JTextField tfNome = new JTextField(20);
    private final JTextField tfData = new JTextField(10);

    // Tabela de entregas disponíveis
    private final DefaultTableModel entregasModel;
    private final JTable entregasTable;

    // Botões
    private final JButton btNovo = new JButton("Novo");
    private final JButton btSalvar = new JButton("Salvar");
    private final JButton btExcluir = new JButton("Excluir");
    private final JButton btGerarPDF = new JButton("Gerar PDF");
    private final JButton btAdicionarEntrega = new JButton("Adicionar Entrega");
    private final JButton btRemoverEntrega = new JButton("Remover Entrega");

    private Rota rotaEmEdicao;

    public RotaPanel() {
        setLayout(new BorderLayout());

        // Painel de formulário
        JPanel form = new JPanel(new GridLayout(0, 2, 5, 5));
        form.add(new JLabel("Nome:"));
        form.add(tfNome);
        form.add(new JLabel("Data:"));
        form.add(tfData);
        tfData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        // Painel de botões principais
        JPanel botoes = new JPanel();
        botoes.add(btNovo);
        botoes.add(btSalvar);
        botoes.add(btExcluir);
        botoes.add(btGerarPDF);

        // Painel esquerdo com form e botões
        JPanel left = new JPanel(new BorderLayout());
        left.add(form, BorderLayout.NORTH);
        left.add(botoes, BorderLayout.CENTER);

        // Tabela de rotas
        tableModel = new DefaultTableModel(
                new Object[]{"ID", "Nome", "Data", "Qtd. Entregas"}, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        table = new JTable(tableModel);

        // Tabela de entregas
        entregasModel = new DefaultTableModel(
                new Object[]{"ID", "Beneficiário", "Item", "Quantidade", "Status"}, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        entregasTable = new JTable(entregasModel);

        // Painel de entregas
        JPanel entregasPanel = new JPanel(new BorderLayout());
        entregasPanel.add(new JLabel("Entregas da Rota:"), BorderLayout.NORTH);
        entregasPanel.add(new JScrollPane(entregasTable), BorderLayout.CENTER);

        JPanel botoesEntregas = new JPanel();
        botoesEntregas.add(btAdicionarEntrega);
        botoesEntregas.add(btRemoverEntrega);
        entregasPanel.add(botoesEntregas, BorderLayout.SOUTH);

        // Layout principal
        JSplitPane splitPane = new JSplitPane(JSplitPane.VERTICAL_SPLIT,
                new JScrollPane(table), entregasPanel);
        splitPane.setDividerLocation(200);

        add(left, BorderLayout.WEST);
        add(splitPane, BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
    }

    private void configurarEventos() {
        btNovo.addActionListener(e -> limparFormulario());

        btSalvar.addActionListener(e -> {
            try {
                if (rotaEmEdicao == null) {
                    rotaEmEdicao = new Rota();
                }

                rotaEmEdicao.setNome(tfNome.getText());
                rotaEmEdicao.setData(LocalDate.parse(tfData.getText(),
                        DateTimeFormatter.ofPattern("dd/MM/yyyy")));

                controller.salvar(rotaEmEdicao);
                limparFormulario();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Rota salva com sucesso!");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro ao salvar: " + ex.getMessage());
            }
        });

        btExcluir.addActionListener(e -> {
            if (rotaEmEdicao != null && rotaEmEdicao.getId() != null) {
                if (JOptionPane.showConfirmDialog(this,
                        "Deseja realmente excluir esta rota?",
                        "Confirmação",
                        JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION) {
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

        btGerarPDF.addActionListener(e -> {
            if (rotaEmEdicao != null && rotaEmEdicao.getId() != null) {
                try {
                    String nomeArquivo = "Rota_" + rotaEmEdicao.getId() + ".pdf";
                    Document document = new Document();
                    PdfWriter.getInstance(document, new FileOutputStream(nomeArquivo));
                    document.open();

                    // Cabeçalho
                    document.add(new Paragraph("Rota: " + rotaEmEdicao.getNome()));
                    document.add(new Paragraph("Data: " + rotaEmEdicao.getData().format(
                            DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
                    document.add(new Paragraph("\n"));

                    // Lista de entregas
                    for (Entrega entrega : rotaEmEdicao.getEntregas()) {
                        document.add(new Paragraph("Beneficiário: " + entrega.getBeneficiario().getNome()));
                        document.add(new Paragraph("Endereço: " + entrega.getBeneficiario().getEndereco()));
                        document.add(new Paragraph("Telefone: " + entrega.getBeneficiario().getTelefone()));
                        document.add(new Paragraph("Item: " + entrega.getItem().getNome()));
                        document.add(new Paragraph("Quantidade: " + entrega.getQuantidade()));
                        document.add(new Paragraph("Descricao: " + entrega.getDescricao()));
                        document.add(new Paragraph("\n"));
                    }

                    document.close();
                    JOptionPane.showMessageDialog(this, "PDF gerado com sucesso: " + nomeArquivo);
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Erro ao gerar PDF: " + ex.getMessage());
                }
            }
        });

        btAdicionarEntrega.addActionListener(e -> {
            if (rotaEmEdicao != null) {
                List<Entrega> entregasDisponiveis = entregaController.buscarPorStatus(StatusEntrega.PENDENTE);
                if (!entregasDisponiveis.isEmpty()) {
                    Entrega entrega = (Entrega) JOptionPane.showInputDialog(this,
                            "Selecione a entrega para adicionar:",
                            "Adicionar Entrega",
                            JOptionPane.QUESTION_MESSAGE,
                            null,
                            entregasDisponiveis.toArray(),
                            entregasDisponiveis.get(0));

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

        btRemoverEntrega.addActionListener(e -> {
            if (rotaEmEdicao != null && entregasTable.getSelectedRow() != -1) {
                Long entregaId = (Long) entregasModel.getValueAt(entregasTable.getSelectedRow(), 0);
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

        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && table.getSelectedRow() != -1) {
                Long id = (Long) table.getValueAt(table.getSelectedRow(), 0);
                rotaEmEdicao = controller.buscarPorId(id);
                if (rotaEmEdicao != null) {
                    preencherFormulario(rotaEmEdicao);
                    atualizarTabelaEntregas();
                }
            }
        });
    }

    private void limparFormulario() {
        rotaEmEdicao = null;
        tfNome.setText("");
        tfData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        table.clearSelection();
        entregasModel.setRowCount(0);
    }

    private void preencherFormulario(Rota rota) {
        tfNome.setText(rota.getNome());
        tfData.setText(rota.getData().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
    }

    private void atualizarTabela() {
        tableModel.setRowCount(0);
        List<Rota> rotas = controller.listarTodos();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        for (Rota r : rotas) {
            tableModel.addRow(new Object[]{
                    r.getId(),
                    r.getNome(),
                    r.getData().format(fmt),
                    r.getEntregas().size()
            });
        }
    }

    private void atualizarTabelaEntregas() {
        entregasModel.setRowCount(0);
        if (rotaEmEdicao != null) {
            for (Entrega e : rotaEmEdicao.getEntregas()) {
                entregasModel.addRow(new Object[]{
                        e.getId(),
                        e.getBeneficiario().getNome(),
                        e.getItem().getNome(),
                        e.getQuantidade(),
                        e.getStatus()
                });
            }
        }
    }
}
