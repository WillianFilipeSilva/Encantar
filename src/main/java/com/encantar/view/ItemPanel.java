package com.encantar.view;

import com.encantar.controller.ItemController;
import com.encantar.model.Item;

import javax.swing.*;
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
    private final JTextField campoBusca = new JTextField(20);

    private final JButton botaoLimpar = new JButton("Limpar");
    private final JButton botaoSalvar = new JButton("Salvar");
    private final JButton botaoExcluir = new JButton("Excluir");
    private final JButton botaoBuscar = new JButton("Buscar");

    private Item itemEmEdicao;

    public ItemPanel() {
        setLayout(new BorderLayout());
        int h = 25;
        var borda = new LineBorder(Color.lightGray, 1, true);

        for (JComponent c : new JComponent[]{campoNome, campoDescricao, campoBusca}) {
            c.setMaximumSize(new Dimension(Integer.MAX_VALUE, h));
            c.setBorder(borda);
            c.setAlignmentX(LEFT_ALIGNMENT);
        }

        JPanel busca = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busca.add(new JLabel("Buscar:"));
        busca.add(campoBusca);
        busca.add(botaoBuscar);

        JPanel form = new JPanel();
        form.setLayout(new BoxLayout(form, BoxLayout.Y_AXIS));
        form.add(lbl("Nome:"));
        form.add(campoNome);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Descrição:"));
        form.add(campoDescricao);

        JPanel botoes = new JPanel();
        botoes.add(botaoLimpar);
        botoes.add(botaoSalvar);
        botoes.add(botaoExcluir);

        JPanel blocoForm = new JPanel(new BorderLayout());
        blocoForm.setPreferredSize(new Dimension(300, 400));
        blocoForm.add(form, BorderLayout.CENTER);
        blocoForm.add(botoes, BorderLayout.SOUTH);

        tabelaPadrao = new DefaultTableModel(new Object[]{"ID", "Nome", "Descrição"}, 0) {
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
                try {
                    controller.deletar(itemEmEdicao.getId());
                    limparFormulario();
                    atualizarTabela();
                    JOptionPane.showMessageDialog(this, "Item excluído com sucesso!");
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Erro ao excluir: " + ex.getMessage());
                }
            }
        });

        botaoBuscar.addActionListener(e -> atualizarTabela());

        tabela.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && tabela.getSelectedRow() != -1) {
                itemEmEdicao = controller.buscarPorId((Long) tabela.getValueAt(tabela.getSelectedRow(), 0));
                preencherFormulario(itemEmEdicao);
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
        List<Item> itens;
        String busca = campoBusca.getText().trim();
        if (!busca.isEmpty()) {
            itens = controller.buscarPorTexto(busca);
        } else {
            itens = controller.listarTodos();
        }

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
