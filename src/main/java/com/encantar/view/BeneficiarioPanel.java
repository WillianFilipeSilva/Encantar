package com.encantar.view;

import com.encantar.controller.BeneficiarioController;
import com.encantar.model.Beneficiario;
import com.encantar.model.enums.StatusBeneficiario;

import javax.swing.*;
import javax.swing.border.Border;
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
        Border bordaArredondada = new LineBorder(Color.lightGray, 1, true);
        int altura = 25;

        setLayout(new BorderLayout());

        // Painel de busca
        JPanel busca = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busca.add(new JLabel("Buscar:"));
        campoDeBusca.setBorder(bordaArredondada);

        busca.add(campoDeBusca);
        busca.add(buscarNaDescricao);
        busca.add(botaoBuscar);

        campoNome.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoEndereco.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoTelefone.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoDescricao.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));

        campoNome.setBorder(bordaArredondada);
        campoEndereco.setBorder(bordaArredondada);
        campoTelefone.setBorder(bordaArredondada);
        campoDescricao.setBorder(bordaArredondada);


        // Painel de formulário
        JPanel painelFormulario = new JPanel();
        painelFormulario.setLayout(new BoxLayout(painelFormulario, BoxLayout.Y_AXIS));

        painelFormulario.add(new JLabel("Nome:"));
        painelFormulario.add(campoNome);
        painelFormulario.add(Box.createVerticalStrut(10));

        painelFormulario.add(new JLabel("Endereço:"));
        painelFormulario.add(campoEndereco);
        painelFormulario.add(Box.createVerticalStrut(10));

        painelFormulario.add(new JLabel("Telefone:"));
        painelFormulario.add(campoTelefone);
        painelFormulario.add(Box.createVerticalStrut(10));

        painelFormulario.add(new JLabel("Descricao:"));
        painelFormulario.add(campoDescricao);
        painelFormulario.add(Box.createVerticalStrut(10));

        painelFormulario.add(new JLabel("Status:"));
        painelFormulario.add(campoStatus);

        // Painel de botões
        JPanel botoes = new JPanel();
        botoes.add(botaoLimpar);
        botoes.add(botaoSalvar);
        botoes.add(botaoExcluir);

        // Painel esquerdo com formulário e botões
        JPanel painelEsquerdo = new JPanel(new BorderLayout());
        painelEsquerdo.setPreferredSize(new Dimension(300, 400));
        painelEsquerdo.add(painelFormulario, BorderLayout.CENTER);
        painelEsquerdo.add(botoes, BorderLayout.SOUTH);

        // Tabela
        tabelaPadrao = new DefaultTableModel(
                new Object[]{"Id", "Nome", "Descricao", "Telefone", "Endereco", "Status"}, 0) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        tabela = new JTable(tabelaPadrao);
        JScrollPane rolagemTabela = new JScrollPane(tabela);
        rolagemTabela.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 10));
        rolagemTabela.setBorder(BorderFactory.createLineBorder(Color.LIGHT_GRAY, 1, true));

        add(busca, BorderLayout.NORTH);

        JPanel esquerdaComEspaco = new JPanel(new BorderLayout());
        esquerdaComEspaco.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 10));
        esquerdaComEspaco.add(painelEsquerdo, BorderLayout.CENTER);

        add(esquerdaComEspaco, BorderLayout.WEST);

        JPanel painelTabela = new JPanel(new BorderLayout());
        painelTabela.setBorder(BorderFactory.createEmptyBorder(0, 0, 5, 5));
        painelTabela.add(rolagemTabela, BorderLayout.CENTER);
        add(painelTabela, BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
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
