package com.encantar.view;

import com.encantar.controller.EntregaController;
import com.encantar.controller.RotaController;
import com.encantar.model.Entrega;
import com.encantar.model.Rota;
import com.encantar.model.enums.StatusEntrega;

import javax.swing.*;
import javax.swing.border.LineBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class RotaPanel extends JPanel {
    private final RotaController controller = new RotaController();
    private final EntregaController entregaCtrl = new EntregaController();

    private final List<Rota> rotasVisiveis = new ArrayList<>();
    private final List<Entrega> entregasVisiveis = new ArrayList<>();

    private final DefaultTableModel modeloRotas = new DefaultTableModel(new Object[]{"Nome", "Data", "Entregas"}, 0) {
        public boolean isCellEditable(int r, int c) {
            return false;
        }
    };
    private final JTable tabelaRotas = new JTable(modeloRotas);

    private final DefaultTableModel modeloEntregas = new DefaultTableModel(new Object[]{"Beneficiário", "Itens", "Descrição", "Status"}, 0) {
        public boolean isCellEditable(int r, int c) {
            return false;
        }
    };
    private final JTable tabelaEntregas = new JTable(modeloEntregas);

    private final JTextField campoNome = new JTextField();
    private final JTextField campoData = new JTextField();

    private final JButton botaoNovo = new JButton("Novo"), 
                         botaoSalvar = new JButton("Salvar"), 
                         botaoExcluir = new JButton("Excluir"),
                         botaoGerarPdf = new JButton("Gerar PDF"), 
                         botaoAdicionarEntrega = new JButton("Adicionar Entrega"), 
                         botaoRemoverEntrega = new JButton("Remover Entrega");

    private Rota rotaSelecionada;

    public RotaPanel() {
        setLayout(new BorderLayout());
        campoData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        for (JTextField f : new JTextField[]{campoNome, campoData}) {
            f.setMaximumSize(new Dimension(Integer.MAX_VALUE, 25));
            f.setBorder(new LineBorder(Color.LIGHT_GRAY, 1, true));
        }

        JPanel painelFormulario = new JPanel();
        painelFormulario.setLayout(new BoxLayout(painelFormulario, BoxLayout.Y_AXIS));
        painelFormulario.add(new JLabel("Nome:"));
        painelFormulario.add(campoNome);
        painelFormulario.add(Box.createVerticalStrut(8));
        painelFormulario.add(new JLabel("Data:"));
        painelFormulario.add(campoData);

        JPanel painelBotoes = new JPanel();
        painelBotoes.add(botaoNovo);
        painelBotoes.add(botaoSalvar);
        painelBotoes.add(botaoExcluir);

        JPanel painelEsquerdo = new JPanel(new BorderLayout());
        painelEsquerdo.setPreferredSize(new Dimension(290, 400));
        painelEsquerdo.add(painelFormulario, BorderLayout.CENTER);
        painelEsquerdo.add(painelBotoes, BorderLayout.SOUTH);

        JScrollPane painelRolagemRotas = new JScrollPane(tabelaRotas);
        painelRolagemRotas.setBorder(new LineBorder(Color.LIGHT_GRAY, 1, true));
        JScrollPane painelRolagemEntregas = new JScrollPane(tabelaEntregas);
        painelRolagemEntregas.setBorder(new LineBorder(Color.LIGHT_GRAY, 1, true));

        JPanel painelBotoesEntrega = new JPanel();
        painelBotoesEntrega.add(botaoAdicionarEntrega);
        painelBotoesEntrega.add(botaoRemoverEntrega);
        painelBotoesEntrega.add(botaoGerarPdf);
        JPanel painelEntrega = new JPanel(new BorderLayout());
        painelEntrega.setBorder(BorderFactory.createEmptyBorder(10, 0, 0, 15));
        painelEntrega.add(new JLabel("Entregas da Rota:"), BorderLayout.NORTH);
        painelEntrega.add(painelRolagemEntregas, BorderLayout.CENTER);
        painelEntrega.add(painelBotoesEntrega, BorderLayout.SOUTH);

        JSplitPane painelDividido = new JSplitPane(JSplitPane.VERTICAL_SPLIT, painelRolagemRotas, painelEntrega);
        painelDividido.setDividerLocation(250);

        JPanel painelEsquerdoEspaco = new JPanel(new BorderLayout());
        painelEsquerdoEspaco.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 10));
        painelEsquerdoEspaco.add(painelEsquerdo, BorderLayout.CENTER);

        add(painelEsquerdoEspaco, BorderLayout.WEST);
        add(painelDividido, BorderLayout.CENTER);

        eventos();
        atualizarRotas();
    }

    private void eventos() {
        botaoNovo.addActionListener(e -> limpar());

        botaoSalvar.addActionListener(e -> {
            try {
                if (rotaSelecionada == null) rotaSelecionada = new Rota();
                rotaSelecionada.setNome(campoNome.getText());
                rotaSelecionada.setData(LocalDate.parse(campoData.getText(), DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                controller.salvar(rotaSelecionada);
                limpar();
                atualizarRotas();
                mensagem("Rota salva com sucesso!");
            } catch (Exception ex) {
                mensagem("Erro ao salvar: " + ex.getMessage());
            }
        });

        botaoExcluir.addActionListener(e -> {
            if (rotaSelecionada != null && rotaSelecionada.getId() != null && confirma("Excluir rota?")) {
                try {
                    controller.deletar(rotaSelecionada.getId());
                    limpar();
                    atualizarRotas();
                    mensagem("Rota excluída com sucesso!");
                } catch (Exception ex) {
                    mensagem("Erro ao excluir: " + ex.getMessage());
                }
            }
        });

        botaoGerarPdf.addActionListener(e -> {
            if (rotaSelecionada == null) {
                mensagem("Selecione uma rota primeiro");
                return;
            }
            try {
                Path p = controller.gerarPdf(rotaSelecionada);
                mensagem("PDF gerado com sucesso!\nSalvo em: " + p);
            } catch (Exception ex) {
                mensagem("Erro ao gerar PDF: " + ex.getMessage());
            }
        });

        tabelaRotas.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && tabelaRotas.getSelectedRow() != -1) {
                rotaSelecionada = controller.buscarPorId(rotasVisiveis.get(tabelaRotas.getSelectedRow()).getId());
                preencher();
                atualizarEntregas();
            }
        });

        botaoAdicionarEntrega.addActionListener(e -> {
            if (rotaSelecionada == null || rotaSelecionada.getId() == null) {
                mensagem("Selecione uma rota primeiro");
                return;
            }
            List<Entrega> pend = entregaCtrl.buscarPorStatus(StatusEntrega.PENDENTE);
            if (pend.isEmpty()) {
                mensagem("Não há entregas pendentes disponíveis");
                return;
            }

            JComboBox<Entrega> cb = new JComboBox<>(pend.toArray(new Entrega[0]));
            cb.setRenderer((l, v, i, s, c) -> {
                JLabel lbl = new JLabel();
                if (v != null) {
                    StringBuilder sb = new StringBuilder();
                    sb.append(v.getBeneficiario().getNome());
                    sb.append(" - ");
                    sb.append(v.getDescricao());
                    if (!v.getItems().isEmpty()) {
                        sb.append(" (");
                        sb.append(v.getItems().stream()
                                .map(item -> item.getQuantidade() + "x " + item.getItem().getNome())
                                .reduce((a, b) -> a + ", " + b)
                                .orElse(""));
                        sb.append(")");
                    }
                    lbl.setText(sb.toString());
                }
                return lbl;
            });
            
            int opt = JOptionPane.showConfirmDialog(this, cb, "Adicionar Entrega", JOptionPane.OK_CANCEL_OPTION);
            if (opt == JOptionPane.OK_OPTION && cb.getSelectedItem() != null) {
                Entrega es = (Entrega) cb.getSelectedItem();
                try {
                    controller.adicionarEntrega(rotaSelecionada, es);
                    rotaSelecionada = controller.buscarPorId(rotaSelecionada.getId());
                    atualizarEntregas();
                    atualizarRotas();
                    mensagem("Entrega adicionada com sucesso!");
                } catch (Exception ex) {
                    mensagem("Erro ao adicionar entrega: " + ex.getMessage());
                }
            }
        });

        botaoRemoverEntrega.addActionListener(e -> {
            if (rotaSelecionada == null || tabelaEntregas.getSelectedRow() == -1) {
                mensagem("Selecione uma entrega para remover");
                return;
            }
            Entrega ent = entregasVisiveis.get(tabelaEntregas.getSelectedRow());
            if (confirma("Remover esta entrega da rota?")) {
                try {
                    controller.removerEntrega(rotaSelecionada, ent);
                    rotaSelecionada = controller.buscarPorId(rotaSelecionada.getId());
                    atualizarEntregas();
                    atualizarRotas();
                    mensagem("Entrega removida com sucesso!");
                } catch (Exception ex) {
                    mensagem("Erro ao remover entrega: " + ex.getMessage());
                }
            }
        });
    }

    private void limpar() {
        rotaSelecionada = null;
        campoNome.setText("");
        campoData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        tabelaRotas.clearSelection();
        modeloEntregas.setRowCount(0);
    }

    private void preencher() {
        campoNome.setText(rotaSelecionada.getNome());
        campoData.setText(rotaSelecionada.getData().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
    }

    private void atualizarRotas() {
        rotasVisiveis.clear();
        modeloRotas.setRowCount(0);
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        for (Rota r : controller.listarTodos()) {
            rotasVisiveis.add(r);
            modeloRotas.addRow(new Object[]{r.getNome(), r.getData().format(f), r.getEntregas().size()});
        }
    }

    private void atualizarEntregas() {
        entregasVisiveis.clear();
        modeloEntregas.setRowCount(0);
        if (rotaSelecionada == null) return;
        rotaSelecionada = controller.buscarPorId(rotaSelecionada.getId());
        for (Entrega e : rotaSelecionada.getEntregas()) {
            entregasVisiveis.add(e);
            String itens = e.getItems().stream()
                .map(i -> i.getQuantidade() + "x " + i.getItem().getNome())
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
            modeloEntregas.addRow(new Object[]{e.getBeneficiario().getNome(), itens, e.getDescricao(), e.getStatus()});
        }
    }

    private boolean confirma(String t) {
        return JOptionPane.showConfirmDialog(this, t, "Confirmação", JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION;
    }

    private void mensagem(String m) {
        JOptionPane.showMessageDialog(this, m);
    }
}
