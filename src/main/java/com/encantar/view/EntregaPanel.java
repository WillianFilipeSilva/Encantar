package com.encantar.view;

import com.encantar.controller.BeneficiarioController;
import com.encantar.controller.EntregaController;
import com.encantar.controller.ItemController;
import com.encantar.controller.RotaController;
import com.encantar.model.*;
import com.encantar.model.enums.StatusEntrega;

import javax.swing.*;
import javax.swing.border.Border;
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

    private final JComboBox<StatusEntrega> campoBuscaStatus;
    private final JComboBox<Beneficiario> campoBuscaBeneficiario;

    private final JButton botaoLimpar = new JButton("Novo");
    private final JButton botaoSalvar = new JButton("Salvar");
    private final JButton botaoExcluir = new JButton("Excluir");
    private final JButton botaoBuscar = new JButton("Buscar");

    private Entrega entregaEmEdicao;

    public EntregaPanel() {
        Border bordaArredondada = new LineBorder(Color.lightGray, 1, true);
        int altura = 25;

        setLayout(new BorderLayout());

        campoBeneficiario = new JComboBox<>(beneficiarioController.buscar(null, false, null).toArray(new Beneficiario[0]));
        campoItem = new JComboBox<>(itemController.listarTodos().toArray(new Item[0]));
        campoQuantidade = new JSpinner(new SpinnerNumberModel(1, 1, 999, 1));
        campoData = new JTextField(10);
        campoData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        campoStatus = new JComboBox<>(StatusEntrega.values());
        campoRota = new JComboBox<>(rotaController.listarTodos().toArray(new Rota[0]));
        campoRota.setSelectedItem(null);

        campoData.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoBeneficiario.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoItem.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoQuantidade.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoStatus.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoRota.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));
        campoDescricao.setMaximumSize(new Dimension(Integer.MAX_VALUE, altura));

        campoData.setBorder(bordaArredondada);
        campoBeneficiario.setBorder(bordaArredondada);
        campoItem.setBorder(bordaArredondada);
        campoQuantidade.setBorder(bordaArredondada);
        campoStatus.setBorder(bordaArredondada);
        campoRota.setBorder(bordaArredondada);
        campoDescricao.setBorder(bordaArredondada);

        campoBuscaStatus = new JComboBox<>(StatusEntrega.values());
        campoBuscaBeneficiario = new JComboBox<>(beneficiarioController.buscar(null, false, null).toArray(new Beneficiario[0]));

        JPanel busca = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busca.add(new JLabel("Status:"));
        busca.add(campoBuscaStatus);
        busca.add(new JLabel("Beneficiário:"));
        busca.add(campoBuscaBeneficiario);
        busca.add(botaoBuscar);

        JPanel painelFormulario = new JPanel();
        painelFormulario.setLayout(new BoxLayout(painelFormulario, BoxLayout.Y_AXIS));

        JLabel labelBeneficiario = new JLabel("Beneficiário:");
        labelBeneficiario.setAlignmentX(Component.LEFT_ALIGNMENT);
        painelFormulario.add(labelBeneficiario);
        painelFormulario.add(campoBeneficiario);
        painelFormulario.add(Box.createVerticalStrut(10));

        JLabel labelItem = new JLabel("Item:");
        labelItem.setAlignmentX(Component.LEFT_ALIGNMENT);
        painelFormulario.add(labelItem);
        painelFormulario.add(campoItem);
        painelFormulario.add(Box.createVerticalStrut(10));

        JLabel labelQuantidade = new JLabel("Quantidade:");
        labelQuantidade.setAlignmentX(Component.LEFT_ALIGNMENT);
        painelFormulario.add(labelQuantidade);
        painelFormulario.add(campoQuantidade);
        painelFormulario.add(Box.createVerticalStrut(10));

        JLabel labelData = new JLabel("Data:");
        labelData.setAlignmentX(Component.LEFT_ALIGNMENT);
        painelFormulario.add(labelData);
        painelFormulario.add(campoData);
        painelFormulario.add(Box.createVerticalStrut(10));

        JLabel labelStatus = new JLabel("Status:");
        labelStatus.setAlignmentX(Component.LEFT_ALIGNMENT);
        painelFormulario.add(labelStatus);
        painelFormulario.add(campoStatus);
        painelFormulario.add(Box.createVerticalStrut(10));

        JLabel labelRota = new JLabel("Rota:");
        labelRota.setAlignmentX(Component.LEFT_ALIGNMENT);
        painelFormulario.add(labelRota);
        painelFormulario.add(campoRota);
        painelFormulario.add(Box.createVerticalStrut(10));

        JLabel labelDescricao = new JLabel("Descricao:");
        labelDescricao.setAlignmentX(Component.LEFT_ALIGNMENT);
        painelFormulario.add(labelDescricao);
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
                new Object[]{"ID", "Beneficiário", "Itens", "Data", "Status", "Rota"}, 0) {
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

        add(busca, BorderLayout.NORTH);
        add(esquerdaComEspaco, BorderLayout.WEST);
        add(painelTabela, BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
    }

    private void configurarEventos() {
        botaoLimpar.addActionListener(e -> limparFormulario());

        botaoSalvar.addActionListener(e -> {
            try {
                if (entregaEmEdicao == null) entregaEmEdicao = new Entrega();

                entregaEmEdicao.setBeneficiario((Beneficiario) campoBeneficiario.getSelectedItem());
                Item itemSel = (Item) campoItem.getSelectedItem();
                int qtd = (Integer) campoQuantidade.getValue();
                entregaEmEdicao.setItems(List.of(
                        new EntregaItem(null, itemSel.getId(), itemSel, qtd)
                ));
                entregaEmEdicao.setDataEntrega(LocalDate.parse(campoData.getText(), DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                entregaEmEdicao.setStatus((StatusEntrega) campoStatus.getSelectedItem());
                entregaEmEdicao.setRota((Rota) campoRota.getSelectedItem());
                entregaEmEdicao.setDescricao(campoDescricao.getText());

                controller.salvar(entregaEmEdicao);
                limparFormulario();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Entrega salva com sucesso!");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro ao salvar: " + ex.getMessage());
            }
        });

        botaoExcluir.addActionListener(e -> {
            if (entregaEmEdicao != null && entregaEmEdicao.getId() != null) {
                if (JOptionPane.showConfirmDialog(this,
                        "Deseja realmente excluir esta entrega?",
                        "Confirmação",
                        JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION) {
                    try {
                        controller.deletar(entregaEmEdicao.getId());
                        limparFormulario();
                        atualizarTabela();
                        JOptionPane.showMessageDialog(this, "Entrega excluída com sucesso!");
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
                entregaEmEdicao = controller.buscarPorId(id);
                if (entregaEmEdicao != null) preencherFormulario(entregaEmEdicao);
            }
        });
    }

    private void limparFormulario() {
        entregaEmEdicao = null;
        campoBeneficiario.setSelectedIndex(0);
        campoItem.setSelectedIndex(0);
        campoQuantidade.setValue(1);
        campoData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        campoStatus.setSelectedIndex(0);
        campoRota.setSelectedItem(null);
        campoDescricao.setText("");
        tabela.clearSelection();
    }

    private void preencherFormulario(Entrega entrega) {
        campoBeneficiario.setSelectedItem(entrega.getBeneficiario());
        if (!entrega.getItems().isEmpty()) {
            EntregaItem ei = entrega.getItems().get(0);
            campoItem.setSelectedItem(ei.getItem());
            campoQuantidade.setValue(ei.getQuantidade());
        }
        campoData.setText(entrega.getDataEntrega().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        campoStatus.setSelectedItem(entrega.getStatus());
        campoRota.setSelectedItem(entrega.getRota());
        campoDescricao.setText(entrega.getDescricao());
    }

    private void atualizarTabela() {
        tabelaPadrao.setRowCount(0);
        List<Entrega> entregas;
        StatusEntrega st = (StatusEntrega) campoBuscaStatus.getSelectedItem();
        Beneficiario ben = (Beneficiario) campoBuscaBeneficiario.getSelectedItem();
        if (ben != null) entregas = controller.buscarPorBeneficiario(ben.getId());
        else if (st != null) entregas = controller.buscarPorStatus(st);
        else entregas = controller.listarTodos();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        for (Entrega e : entregas) {
            StringBuilder itens = new StringBuilder();
            for (EntregaItem ei : e.getItems()) {
                if (itens.length() > 0) itens.append(", ");
                itens.append(ei.getQuantidade()).append("x ").append(ei.getItem().getNome());
            }
            tabelaPadrao.addRow(new Object[]{
                    e.getId(),
                    e.getBeneficiario().getNome(),
                    itens.toString(),
                    e.getDataEntrega().format(fmt),
                    e.getStatus(),
                    e.getRota() != null ? e.getRota().getNome() : ""
            });
        }

        tabela.getColumnModel().getColumn(0).setMinWidth(0);
        tabela.getColumnModel().getColumn(0).setMaxWidth(0);
    }
}
