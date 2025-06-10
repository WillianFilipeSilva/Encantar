package com.encantar.view;

import com.encantar.controller.ItemController;
import com.encantar.model.Item;

import javax.swing.*;
import javax.swing.border.Border;
import javax.swing.border.LineBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class ItemPanel extends JPanel {
    private final ItemController controller = new ItemController();
    private final DefaultTableModel tabelaPadrao;
    private final JTable tabela;

    private final JTextField campoNome = new JTextField(20);
    private final JTextField campoDescricao = new JTextField(20);

    private final JButton botaoLimpar = new JButton("Limpar");
    private final JButton botaoSalvar = new JButton("Salvar");
    private final JButton botaoExcluir = new JButton("Excluir");

    private Item itemEmEdicao;

    public ItemPanel() {
        Border bordaArredondada = new LineBorder(Color.lightGray, 1, true);
        int altura = 25;

        setLayout(new BorderLayout());

        campoNome.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoDescricao.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoNome.setBorder(bordaArredondada);
        campoDescricao.setBorder(bordaArredondada);

        JPanel painelFormulario = new JPanel();
        painelFormulario.setLayout(new BoxLayout(painelFormulario, BoxLayout.Y_AXIS));

        painelFormulario.add(new JLabel("Nome:"));
        painelFormulario.add(campoNome);
        painelFormulario.add(Box.createVerticalStrut(10));

        painelFormulario.add(new JLabel("Descrição:"));
        painelFormulario.add(campoDescricao);

        JPanel botoes = new JPanel();
        botoes.add(botaoLimpar);
        botoes.add(botaoSalvar);
        botoes.add(botaoExcluir);

        JPanel painelEsquerdo = new JPanel(new BorderLayout());
        painelEsquerdo.setPreferredSize(new Dimension(300, 400));
        painelEsquerdo.add(painelFormulario, BorderLayout.CENTER);
        painelEsquerdo.add(botoes, BorderLayout.SOUTH);

        tabelaPadrao = new DefaultTableModel(
                new Object[]{"ID", "Nome", "Descrição"}, 0) {
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        tabela = new JTable(tabelaPadrao);
        JScrollPane rolagemTabela = new JScrollPane(tabela);
        rolagemTabela.setBorder(BorderFactory.createLineBorder(Color.LIGHT_GRAY, 1, true));

        JPanel esquerdaComEspaco = new JPanel(new BorderLayout());
        esquerdaComEspaco.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 10));
        esquerdaComEspaco.add(painelEsquerdo, BorderLayout.CENTER);

        JPanel painelTabela = new JPanel(new BorderLayout());
        painelTabela.setBorder(BorderFactory.createEmptyBorder(0, 0, 5, 5));
        painelTabela.add(rolagemTabela, BorderLayout.CENTER);

        add(esquerdaComEspaco, BorderLayout.WEST);
        add(painelTabela, BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
    }

    private void configurarEventos() {
        botaoLimpar.addActionListener(e -> limparFormulario());

        botaoSalvar.addActionListener(e -> {
            try {
                if (itemEmEdicao == null) {
                    itemEmEdicao = new Item();
                }

                itemEmEdicao.setNome(campoNome.getText());
                itemEmEdicao.setDescricao(campoDescricao.getText());

                controller.salvar(itemEmEdicao);
                limparFormulario();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Item salvo com sucesso!");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro ao salvar: " + ex.getMessage());
            }
        });

        botaoExcluir.addActionListener(e -> {
            if (itemEmEdicao != null && itemEmEdicao.getId() != null) {
                if (JOptionPane.showConfirmDialog(this,
                        "Deseja realmente excluir este item?",
                        "Confirmação",
                        JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION) {
                    try {
                        controller.deletar(itemEmEdicao.getId());
                        limparFormulario();
                        atualizarTabela();
                        JOptionPane.showMessageDialog(this, "Item excluído com sucesso!");
                    } catch (Exception ex) {
                        JOptionPane.showMessageDialog(this, "Erro ao excluir: " + ex.getMessage());
                    }
                }
            }
        });

        tabela.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && tabela.getSelectedRow() != -1) {
                Long id = (Long) tabela.getValueAt(tabela.getSelectedRow(), 0);
                itemEmEdicao = controller.buscarPorId(id);
                if (itemEmEdicao != null) {
                    preencherFormulario(itemEmEdicao);
                }
            }
        });
    }

    private void limparFormulario() {
        itemEmEdicao = null;
        campoNome.setText("");
        campoDescricao.setText("");
        tabela.clearSelection();
    }

    private void preencherFormulario(Item item) {
        campoNome.setText(item.getNome());
        campoDescricao.setText(item.getDescricao());
    }

    private void atualizarTabela() {
        tabelaPadrao.setRowCount(0);
        List<Item> itens = controller.listarTodos();

        for (Item item : itens) {
            tabelaPadrao.addRow(new Object[]{
                    item.getId(),
                    item.getNome(),
                    item.getDescricao()
            });
        }

        tabela.getColumnModel().getColumn(0).setMinWidth(0);
        tabela.getColumnModel().getColumn(0).setMaxWidth(0);
    }
}
