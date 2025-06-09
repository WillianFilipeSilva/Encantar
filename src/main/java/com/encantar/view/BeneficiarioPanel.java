package com.encantar.view;

import com.encantar.controller.BeneficiarioController;
import com.encantar.model.Beneficiario;
import com.encantar.model.enums.StatusBeneficiario;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class BeneficiarioPanel extends JPanel {

    private final BeneficiarioController controller = new BeneficiarioController();
    private final DefaultTableModel tableModel;
    private final JTable table;

    // Campos do formulário
    private final JTextField tfNome = new JTextField(20);
    private final JTextField tfEnd = new JTextField(20);
    private final JTextField tfFone = new JTextField(20);
    private final JTextField tfObs = new JTextField(20);
    private final JCheckBox cbStatus = new JCheckBox("Ativo", true);

    // Campos de busca
    private final JTextField tfBusca = new JTextField(20);
    private final JCheckBox cbBuscaObs = new JCheckBox("Buscar na descrição");

    // Botões
    private final JButton btNovo = new JButton("Novo");
    private final JButton btSalvar = new JButton("Salvar");
    private final JButton btExcluir = new JButton("Excluir");
    private final JButton btBuscar = new JButton("Buscar");

    private Beneficiario beneficiarioEmEdicao;

    public BeneficiarioPanel() {
        setLayout(new BorderLayout());

        // Painel de busca
        JPanel busca = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busca.add(new JLabel("Buscar:"));
        busca.add(tfBusca);
        busca.add(cbBuscaObs);
        busca.add(btBuscar);

        // Painel de formulário
        JPanel form = new JPanel(new GridLayout(0, 2, 5, 5));
        form.add(new JLabel("Nome:"));
        form.add(tfNome);
        form.add(new JLabel("Endereço:"));
        form.add(tfEnd);
        form.add(new JLabel("Telefone:"));
        form.add(tfFone);
        form.add(new JLabel("Descricao:"));
        form.add(tfObs);
        form.add(new JLabel("Status:"));
        form.add(cbStatus);

        // Painel de botões
        JPanel botoes = new JPanel();
        botoes.add(btNovo);
        botoes.add(btSalvar);
        botoes.add(btExcluir);

        // Painel esquerdo com form e botões
        JPanel left = new JPanel(new BorderLayout());
        left.setPreferredSize(new Dimension(300, 400));
        left.add(form, BorderLayout.CENTER);
        left.add(botoes, BorderLayout.SOUTH);

        // Tabela
        tableModel = new DefaultTableModel(
                new Object[]{"ID", "Nome", "Telefone", "Status"}, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        table = new JTable(tableModel);
        JScrollPane scroll = new JScrollPane(table);

        add(busca, BorderLayout.NORTH);
        add(left, BorderLayout.WEST);
        add(scroll, BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
    }

    private void configurarEventos() {
        btNovo.addActionListener(e -> limparFormulario());

        btSalvar.addActionListener(e -> {
            try {
                if (beneficiarioEmEdicao == null) {
                    beneficiarioEmEdicao = new Beneficiario();
                }

                beneficiarioEmEdicao.setNome(tfNome.getText());
                beneficiarioEmEdicao.setEndereco(tfEnd.getText());
                beneficiarioEmEdicao.setTelefone(tfFone.getText());
                beneficiarioEmEdicao.setDescricao(tfObs.getText());
                beneficiarioEmEdicao.setStatus(cbStatus.isSelected() ? StatusBeneficiario.ATIVO : StatusBeneficiario.INATIVO);

                controller.salvar(beneficiarioEmEdicao);
                limparFormulario();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Beneficiário salvo com sucesso!");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro ao salvar: " + ex.getMessage());
            }
        });

        btExcluir.addActionListener(e -> {
            if (beneficiarioEmEdicao != null && beneficiarioEmEdicao.getId() != null) {
                if (JOptionPane.showConfirmDialog(this,
                        "Deseja realmente excluir este beneficiário?",
                        "Confirmação",
                        JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION) {
                    try {
                        controller.deletar(beneficiarioEmEdicao.getId());
                        limparFormulario();
                        atualizarTabela();
                        JOptionPane.showMessageDialog(this, "Beneficiário excluído com sucesso!");
                    } catch (Exception ex) {
                        JOptionPane.showMessageDialog(this, "Erro ao excluir: " + ex.getMessage());
                    }
                }
            }
        });

        btBuscar.addActionListener(e -> atualizarTabela());

        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && table.getSelectedRow() != -1) {
                Long id = (Long) table.getValueAt(table.getSelectedRow(), 0);
                beneficiarioEmEdicao = controller.buscarPorId(id);
                if (beneficiarioEmEdicao != null) {
                    preencherFormulario(beneficiarioEmEdicao);
                }
            }
        });
    }

    private void limparFormulario() {
        beneficiarioEmEdicao = null;
        tfNome.setText("");
        tfEnd.setText("");
        tfFone.setText("");
        tfObs.setText("");
        cbStatus.setSelected(true);
        table.clearSelection();
    }

    private void preencherFormulario(Beneficiario b) {
        tfNome.setText(b.getNome());
        tfEnd.setText(b.getEndereco());
        tfFone.setText(b.getTelefone());
        tfObs.setText(b.getDescricao());
        cbStatus.setSelected(b.getStatus() == StatusBeneficiario.ATIVO);
    }

    private void atualizarTabela() {
        tableModel.setRowCount(0);
        List<Beneficiario> beneficiarios = controller.buscar(
                tfBusca.getText(),
                cbBuscaObs.isSelected(),
                cbStatus.isSelected() ? StatusBeneficiario.ATIVO : StatusBeneficiario.INATIVO
        );

        for (Beneficiario b : beneficiarios) {
            tableModel.addRow(new Object[]{
                    b.getId(),
                    b.getNome(),
                    b.getTelefone(),
                    b.getStatus()
            });
        }
    }
}
