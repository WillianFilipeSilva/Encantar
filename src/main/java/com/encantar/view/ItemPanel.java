package com.encantar.view;

import com.encantar.controller.ItemController;
import com.encantar.model.Item;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class ItemPanel extends JPanel {
    private final ItemController controller = new ItemController();
    private final DefaultTableModel tableModel;
    private final JTable table;

    // Campos do formulário
    private final JTextField tfNome = new JTextField(20);
    private final JTextArea taDescricao = new JTextArea(3, 20);

    // Botões
    private final JButton btNovo = new JButton("Novo");
    private final JButton btSalvar = new JButton("Salvar");
    private final JButton btExcluir = new JButton("Excluir");

    private Item itemEmEdicao;

    public ItemPanel() {
        setLayout(new BorderLayout());

        // Painel de formulário
        JPanel form = new JPanel(new GridLayout(0, 1, 5, 5));
        form.add(new JLabel("Nome:"));
        form.add(tfNome);
        form.add(new JLabel("Descrição:"));
        taDescricao.setLineWrap(true);
        taDescricao.setWrapStyleWord(true);
        form.add(new JScrollPane(taDescricao));

        // Painel de botões
        JPanel botoes = new JPanel();
        botoes.add(btNovo);
        botoes.add(btSalvar);
        botoes.add(btExcluir);

        // Painel esquerdo com form e botões
        JPanel left = new JPanel(new BorderLayout());
        left.setPreferredSize(new Dimension(300, 350));
        left.add(form, BorderLayout.CENTER);
        left.add(botoes, BorderLayout.SOUTH);

        // Tabela
        tableModel = new DefaultTableModel(
                new Object[]{"ID", "Nome", "Descrição"}, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        table = new JTable(tableModel);
        JScrollPane scroll = new JScrollPane(table);

        // Layout principal
        add(left, BorderLayout.WEST);
        add(scroll, BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
    }

    private void configurarEventos() {
        btNovo.addActionListener(e -> limparFormulario());

        btSalvar.addActionListener(e -> {
            try {
                if (itemEmEdicao == null) {
                    itemEmEdicao = new Item();
                }

                itemEmEdicao.setNome(tfNome.getText());
                itemEmEdicao.setDescricao(taDescricao.getText());

                controller.salvar(itemEmEdicao);
                limparFormulario();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Item salvo com sucesso!");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro ao salvar: " + ex.getMessage());
            }
        });

        btExcluir.addActionListener(e -> {
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

        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && table.getSelectedRow() != -1) {
                Long id = (Long) table.getValueAt(table.getSelectedRow(), 0);
                itemEmEdicao = controller.buscarPorId(id);
                if (itemEmEdicao != null) {
                    preencherFormulario(itemEmEdicao);
                }
            }
        });
    }

    private void limparFormulario() {
        itemEmEdicao = null;
        tfNome.setText("");
        taDescricao.setText("");
        table.clearSelection();
    }

    private void preencherFormulario(Item item) {
        tfNome.setText(item.getNome());
        taDescricao.setText(item.getDescricao());
    }

    private void atualizarTabela() {
        tableModel.setRowCount(0);
        List<Item> itens = controller.listarTodos();

        for (Item item : itens) {
            tableModel.addRow(new Object[]{
                    item.getId(),
                    item.getNome(),
                    item.getDescricao()
            });
        }
    }
}
