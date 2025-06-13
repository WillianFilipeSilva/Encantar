package com.encantar.view;

import com.encantar.controller.BeneficiarioController;
import com.encantar.controller.EntregaController;
import com.encantar.controller.ItemController;
import com.encantar.controller.RotaController;
import com.encantar.model.*;
import com.encantar.model.enums.StatusEntrega;

import javax.swing.*;
import javax.swing.border.LineBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class EntregaPanel extends JPanel {
    private final EntregaController controller = new EntregaController();
    private final BeneficiarioController beneficiarioController = new BeneficiarioController();
    private final ItemController itemController = new ItemController();
    private final RotaController rotaController = new RotaController();
    private final DefaultTableModel tabelaPadrao;
    private final JTable tabela;
    private final JComboBox<Beneficiario> campoBeneficiario;
    private final JComboBox<Item> campoItem;
    private final JSpinner campoQuantidade;
    private final JTextField campoData;
    private final JComboBox<StatusEntrega> campoStatus;
    private final JComboBox<Rota> campoRota;
    private final JTextField campoDescricao = new JTextField(20);
    private final JTextField campoBusca = new JTextField(20);
    private final JButton botaoLimpar = new JButton("Novo");
    private final JButton botaoSalvar = new JButton("Salvar");
    private final JButton botaoExcluir = new JButton("Excluir");
    private final JButton botaoBuscar = new JButton("Buscar");
    private Entrega entregaEmEdicao;

    public EntregaPanel() {
        setLayout(new BorderLayout());
        int h = 25;
        var borda = new LineBorder(Color.lightGray, 1, true);

        campoBeneficiario = new JComboBox<>(beneficiarioController.buscar(null, false, null).toArray(new Beneficiario[0]));
        campoItem = new JComboBox<>(itemController.listarTodos().toArray(new Item[0]));
        campoQuantidade = new JSpinner(new SpinnerNumberModel(1, 1, 999, 1));
        campoData = new JTextField(10);
        campoStatus = new JComboBox<>(StatusEntrega.values());
        campoRota = new JComboBox<>(rotaController.listarTodos().toArray(new Rota[0]));
        campoData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        for (JComponent c : new JComponent[]{campoBeneficiario, campoItem, campoQuantidade, campoData, campoStatus, campoRota, campoDescricao, campoBusca}) {
            c.setMaximumSize(new Dimension(Integer.MAX_VALUE, h));
            c.setBorder(borda);
            c.setAlignmentX(LEFT_ALIGNMENT);
        }

        renderer(campoBeneficiario);
        renderer(campoItem);
        renderer(campoRota);

        JPanel busca = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busca.add(new JLabel("Buscar:"));
        busca.add(campoBusca);
        busca.add(botaoBuscar);

        JPanel form = new JPanel();
        form.setLayout(new BoxLayout(form, BoxLayout.Y_AXIS));
        form.add(lbl("Beneficiário:"));
        form.add(campoBeneficiario);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Item:"));
        form.add(campoItem);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Quantidade:"));
        form.add(campoQuantidade);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Data:"));
        form.add(campoData);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Status:"));
        form.add(campoStatus);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Rota:"));
        form.add(campoRota);
        form.add(Box.createVerticalStrut(10));
        form.add(lbl("Descricao:"));
        form.add(campoDescricao);

        JPanel botoes = new JPanel();
        botoes.add(botaoLimpar);
        botoes.add(botaoSalvar);
        botoes.add(botaoExcluir);

        JPanel painelEsquerdo = new JPanel(new BorderLayout());
        painelEsquerdo.setPreferredSize(new Dimension(300, 400));
        painelEsquerdo.add(form, BorderLayout.CENTER);
        painelEsquerdo.add(botoes, BorderLayout.SOUTH);

        tabelaPadrao = new DefaultTableModel(new Object[]{"ID", "Beneficiário", "Itens", "Descrição", "Data", "Status", "Rota"}, 0) {
            public boolean isCellEditable(int r, int c) {
                return false;
            }
        };
        tabela = new JTable(tabelaPadrao);
        JScrollPane scroll = new JScrollPane(tabela);
        scroll.setBorder(new LineBorder(Color.LIGHT_GRAY, 1, true));

        JPanel painelTabela = new JPanel(new BorderLayout());
        painelTabela.add(scroll, BorderLayout.CENTER);

        JPanel esquerdaEspaco = new JPanel(new BorderLayout());
        esquerdaEspaco.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 10));
        esquerdaEspaco.add(painelEsquerdo, BorderLayout.CENTER);

        add(busca, BorderLayout.NORTH);
        add(esquerdaEspaco, BorderLayout.WEST);
        add(painelTabela, BorderLayout.CENTER);

        eventos();
        atualizarTabela();
    }

    private JLabel lbl(String t) {
        JLabel l = new JLabel(t, SwingConstants.LEFT);
        l.setAlignmentX(LEFT_ALIGNMENT);
        return l;
    }

    private <T> void renderer(JComboBox<T> cb) {
        cb.setRenderer((list, v, i, s, f) -> {
            Component c = new DefaultListCellRenderer().getListCellRendererComponent(list, v, i, s, f);
            if (v instanceof Beneficiario b)
                ((JLabel) c).setText(b.getNome() + " - " + b.getTelefone() + " - " + b.getDescricao());
            if (v instanceof Item it) ((JLabel) c).setText(it.getNome());
            if (v instanceof Rota r) ((JLabel) c).setText(r.getNome());
            return c;
        });
    }

    private void eventos() {
        botaoLimpar.addActionListener(e -> limpar());
        botaoSalvar.addActionListener(e -> {
            try {
                if (entregaEmEdicao == null) entregaEmEdicao = new Entrega();
                entregaEmEdicao.setBeneficiario((Beneficiario) campoBeneficiario.getSelectedItem());
                Item it = (Item) campoItem.getSelectedItem();
                entregaEmEdicao.setItems(List.of(new EntregaItem(null, it.getId(), it, (Integer) campoQuantidade.getValue())));
                entregaEmEdicao.setDataEntrega(LocalDate.parse(campoData.getText(), DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                entregaEmEdicao.setStatus((StatusEntrega) campoStatus.getSelectedItem());
                entregaEmEdicao.setRota((Rota) campoRota.getSelectedItem());
                entregaEmEdicao.setDescricao(campoDescricao.getText());
                controller.salvar(entregaEmEdicao);
                limpar();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Entrega salva");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro: " + ex.getMessage());
            }
        });

        botaoExcluir.addActionListener(e -> {
            if (entregaEmEdicao != null && entregaEmEdicao.getId() != null) {
                try {
                    controller.deletar(entregaEmEdicao.getId());
                    limpar();
                    atualizarTabela();
                    JOptionPane.showMessageDialog(this, "Entrega excluída");
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, "Erro: " + ex.getMessage());
                }
            }
        });

        botaoBuscar.addActionListener(e -> atualizarTabela());

        tabela.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && tabela.getSelectedRow() != -1) {
                entregaEmEdicao = controller.buscarPorId((Long) tabela.getValueAt(tabela.getSelectedRow(), 0));
                preencher();
            }
        });
    }

    private void limpar() {
        entregaEmEdicao = null;
        campoBeneficiario.setSelectedIndex(0);
        campoItem.setSelectedIndex(0);
        campoQuantidade.setValue(1);
        campoData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        campoStatus.setSelectedIndex(0);
        campoRota.setSelectedIndex(0);
        campoDescricao.setText("");
        tabela.clearSelection();
    }

    private void preencher() {
        campoBeneficiario.setSelectedItem(entregaEmEdicao.getBeneficiario());
        if (!entregaEmEdicao.getItems().isEmpty()) {
            campoItem.setSelectedItem(entregaEmEdicao.getItems().get(0).getItem());
            campoQuantidade.setValue(entregaEmEdicao.getItems().get(0).getQuantidade());
        }
        campoData.setText(entregaEmEdicao.getDataEntrega().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        campoStatus.setSelectedItem(entregaEmEdicao.getStatus());
        campoRota.setSelectedItem(entregaEmEdicao.getRota());
        campoDescricao.setText(entregaEmEdicao.getDescricao());
    }

    private void atualizarTabela() {
        tabelaPadrao.setRowCount(0);
        List<Entrega> entregas;
        String busca = campoBusca.getText().trim();
        if (!busca.isEmpty()) {
            entregas = controller.buscarPorTexto(busca);
        } else {
            entregas = controller.listarTodos();
        }

        for (Entrega entrega : entregas) {
            String itens = entrega.getItems().stream()
                    .map(i -> i.getQuantidade() + "x " + i.getItem().getNome())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            tabelaPadrao.addRow(new Object[]{
                    entrega.getId(),
                    entrega.getBeneficiario().getNome(),
                    itens,
                    entrega.getDescricao(),
                    entrega.getDataEntrega().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    entrega.getStatus(),
                    entrega.getRota() != null ? entrega.getRota().getNome() : ""
            });
        }

        tabela.getColumnModel().getColumn(0).setMinWidth(0);
        tabela.getColumnModel().getColumn(0).setMaxWidth(0);
    }
}
