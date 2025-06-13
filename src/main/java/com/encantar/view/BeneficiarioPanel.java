package com.encantar.view;

import com.encantar.controller.BeneficiarioController;
import com.encantar.model.Beneficiario;
import com.encantar.model.enums.StatusBeneficiario;

import javax.swing.*;
import javax.swing.border.LineBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class BeneficiarioPanel extends JPanel {

    private final BeneficiarioController beneficiarioController = new BeneficiarioController();
    private final DefaultTableModel tabelaPadrao;
    private final JTable tabela;

    // Campos do formulário
    private final JTextField campoNome = new JTextField(20);
    private final JTextField campoEndereco = new JTextField(20);
    private final JTextField campoTelefone = new JTextField(20);
    private final JTextField campoDescricao = new JTextField(20);
    private final JCheckBox campoStatus = new JCheckBox("Ativo", true);

    // Campos de busca
    private final JTextField campoDeBusca = new JTextField(22);
    private final JCheckBox buscarNaDescricao = new JCheckBox("Buscar na descrição");

    // Botões
    private final JButton botaoLimpar = new JButton("Limpar");
    private final JButton botaoSalvar = new JButton("Salvar");
    private final JButton botaoExcluir = new JButton("Excluir");
    private final JButton botaoBuscar = new JButton("Buscar");

    private Beneficiario beneficiarioEmEdicao;

    public BeneficiarioPanel() {
        setLayout(new BorderLayout());
        int h = 25;
        var borda = new LineBorder(Color.lightGray, 1, true);

        // ---------- busca ----------
        JPanel busca = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busca.add(new JLabel("Buscar:"));
        campoDeBusca.setBorder(borda);
        busca.add(campoDeBusca);
        busca.add(buscarNaDescricao);
        busca.add(botaoBuscar);

        // ---------- campos ----------
        for (JComponent c : new JComponent[]{campoNome, campoEndereco, campoTelefone, campoDescricao}) {
            c.setMaximumSize(new Dimension(Integer.MAX_VALUE, h));
            c.setBorder(borda);
            c.setAlignmentX(LEFT_ALIGNMENT);
        }

        JPanel form = new JPanel();
        form.setLayout(new BoxLayout(form, BoxLayout.Y_AXIS));
        form.add(lbl("Nome:"));
        form.add(campoNome);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Endereço:"));
        form.add(campoEndereco);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Telefone:"));
        form.add(campoTelefone);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Descrição:"));
        form.add(campoDescricao);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Status:"));
        form.add(campoStatus);

        JPanel botoes = new JPanel();
        botoes.add(botaoLimpar);
        botoes.add(botaoSalvar);
        botoes.add(botaoExcluir);

        JPanel blocoForm = new JPanel(new BorderLayout());
        blocoForm.setPreferredSize(new Dimension(300, 400));
        blocoForm.add(form, BorderLayout.CENTER);
        blocoForm.add(botoes, BorderLayout.SOUTH);

        // ---------- tabela ----------
        tabelaPadrao = new DefaultTableModel(
                new Object[]{"Id", "Nome", "Descrição", "Telefone", "Endereço", "Status"}, 0) {
            public boolean isCellEditable(int r, int c) {
                return false;
            }
        };
        tabela = new JTable(tabelaPadrao);
        JScrollPane scroll = new JScrollPane(tabela);
        scroll.setBorder(new LineBorder(Color.LIGHT_GRAY, 1, true));

        JPanel painelTabela = new JPanel(new BorderLayout());
        painelTabela.setBorder(BorderFactory.createEmptyBorder(0, 0, 5, 5));
        painelTabela.add(scroll, BorderLayout.CENTER);

        JPanel esquerda = new JPanel(new BorderLayout());
        esquerda.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 10));
        esquerda.add(blocoForm, BorderLayout.CENTER);

        add(busca, BorderLayout.NORTH);
        add(esquerda, BorderLayout.WEST);
        add(painelTabela, BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
    }

    private JLabel lbl(String t) {
        JLabel l = new JLabel(t, SwingConstants.LEFT);
        l.setAlignmentX(LEFT_ALIGNMENT);
        return l;
    }

    private void configurarEventos() {
        botaoLimpar.addActionListener(e -> limparFormulario());

        botaoSalvar.addActionListener(e -> {
            try {
                if (beneficiarioEmEdicao == null) {
                    beneficiarioEmEdicao = new Beneficiario();
                }

                beneficiarioEmEdicao.setNome(campoNome.getText());
                beneficiarioEmEdicao.setEndereco(campoEndereco.getText());
                beneficiarioEmEdicao.setTelefone(campoTelefone.getText());
                beneficiarioEmEdicao.setDescricao(campoDescricao.getText());
                beneficiarioEmEdicao.setStatus(campoStatus.isSelected() ? StatusBeneficiario.ATIVO : StatusBeneficiario.INATIVO);

                beneficiarioController.salvar(beneficiarioEmEdicao);
                limparFormulario();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Beneficiário salvo com sucesso!");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro ao salvar: " + ex.getMessage());
            }
        });

        botaoExcluir.addActionListener(e -> {
            if (beneficiarioEmEdicao != null && beneficiarioEmEdicao.getId() != null) {
                if (JOptionPane.showConfirmDialog(this,
                        "Deseja realmente excluir este beneficiário?",
                        "Confirmação",
                        JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION) {
                    try {
                        beneficiarioController.deletar(beneficiarioEmEdicao.getId());
                        limparFormulario();
                        atualizarTabela();
                        JOptionPane.showMessageDialog(this, "Beneficiário excluído com sucesso!");
                    } catch (Exception ex) {
                        JOptionPane.showMessageDialog(this, "Erro ao excluir: " + ex.getMessage());
                    }
                }
            }
        });

        botaoBuscar.addActionListener(e -> atualizarTabela());

        tabela.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && tabela.getSelectedRow() != -1) {
                Long id = (Long) tabela.getValueAt(tabela.getSelectedRow(), 0);
                beneficiarioEmEdicao = beneficiarioController.buscarPorId(id);
                if (beneficiarioEmEdicao != null) {
                    preencherFormulario(beneficiarioEmEdicao);
                }
            }
        });
    }

    private void limparFormulario() {
        beneficiarioEmEdicao = null;
        campoNome.setText("");
        campoEndereco.setText("");
        campoTelefone.setText("");
        campoDescricao.setText("");
        campoStatus.setSelected(true);
        tabela.clearSelection();
    }

    private void preencherFormulario(Beneficiario beneficiario) {
        campoNome.setText(beneficiario.getNome());
        campoEndereco.setText(beneficiario.getEndereco());
        campoTelefone.setText(beneficiario.getTelefone());
        campoDescricao.setText(beneficiario.getDescricao());
        campoStatus.setSelected(beneficiario.getStatus() == StatusBeneficiario.ATIVO);
    }

    private void atualizarTabela() {
        tabelaPadrao.setRowCount(0);
        List<Beneficiario> beneficiarios = beneficiarioController.buscar(
                campoDeBusca.getText(),
                buscarNaDescricao.isSelected(),
                campoStatus.isSelected() ? StatusBeneficiario.ATIVO : StatusBeneficiario.INATIVO
        );

        for (Beneficiario beneficiario : beneficiarios) {
            tabelaPadrao.addRow(new Object[]{
                    beneficiario.getId(),
                    beneficiario.getNome(),
                    beneficiario.getDescricao(),
                    beneficiario.getTelefone(),
                    beneficiario.getEndereco(),
                    beneficiario.getStatus()
            });
        }

        tabela.getColumnModel().getColumn(0).setMinWidth(0);
        tabela.getColumnModel().getColumn(0).setMaxWidth(0);
    }
}
