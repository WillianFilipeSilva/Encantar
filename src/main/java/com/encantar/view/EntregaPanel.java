package com.encantar.view;

import com.encantar.controller.BeneficiarioController;
import com.encantar.controller.EntregaController;
import com.encantar.controller.ItemController;
import com.encantar.controller.RotaController;
import com.encantar.model.*;
import com.encantar.model.enums.StatusEntrega;

import javax.swing.*;
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
    private final DefaultTableModel tableModel;
    private final JTable table;

    private final JComboBox<Beneficiario> cbBeneficiario;
    private final JComboBox<Item> cbItem;
    private final JSpinner spQuantidade;
    private final JTextField tfData;
    private final JComboBox<StatusEntrega> cbStatus;
    private final JComboBox<Rota> cbRota;
    private final JTextArea taObs;

    private final JComboBox<StatusEntrega> cbBuscaStatus;
    private final JComboBox<Beneficiario> cbBuscaBeneficiario;

    private final JButton btNovo = new JButton("Novo");
    private final JButton btSalvar = new JButton("Salvar");
    private final JButton btExcluir = new JButton("Excluir");
    private final JButton btBuscar = new JButton("Buscar");

    private Entrega entregaEmEdicao;

    public EntregaPanel() {
        setLayout(new BorderLayout());

        cbBeneficiario = new JComboBox<>(beneficiarioController.buscar(null, false, null).toArray(new Beneficiario[0]));
        cbItem = new JComboBox<>(itemController.listarTodos().toArray(new Item[0]));
        spQuantidade = new JSpinner(new SpinnerNumberModel(1, 1, 999, 1));
        tfData = new JTextField(10);
        tfData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        cbStatus = new JComboBox<>(StatusEntrega.values());
        cbRota = new JComboBox<>(rotaController.listarTodos().toArray(new Rota[0]));
        cbRota.setSelectedItem(null);
        taObs = new JTextArea(3, 20);

        cbBuscaStatus = new JComboBox<>(StatusEntrega.values());
        cbBuscaBeneficiario = new JComboBox<>(beneficiarioController.buscar(null, false, null).toArray(new Beneficiario[0]));

        JPanel busca = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busca.add(new JLabel("Status:"));
        busca.add(cbBuscaStatus);
        busca.add(new JLabel("Beneficiário:"));
        busca.add(cbBuscaBeneficiario);
        busca.add(btBuscar);

        JPanel form = new JPanel(new GridLayout(0, 2, 5, 5));
        form.add(new JLabel("Beneficiário:"));
        form.add(cbBeneficiario);
        form.add(new JLabel("Item:"));
        form.add(cbItem);
        form.add(new JLabel("Quantidade:"));
        form.add(spQuantidade);
        form.add(new JLabel("Data:"));
        form.add(tfData);
        form.add(new JLabel("Status:"));
        form.add(cbStatus);
        form.add(new JLabel("Rota:"));
        form.add(cbRota);
        form.add(new JLabel("Descricao:"));
        form.add(new JScrollPane(taObs));

        JPanel botoes = new JPanel();
        botoes.add(btNovo);
        botoes.add(btSalvar);
        botoes.add(btExcluir);

        JPanel left = new JPanel(new BorderLayout());
        left.add(form, BorderLayout.CENTER);
        left.add(botoes, BorderLayout.SOUTH);

        tableModel = new DefaultTableModel(
                new Object[]{"ID", "Beneficiário", "Itens", "Data", "Status", "Rota"}, 0) {
            @Override
            public boolean isCellEditable(int r, int c) {
                return false;
            }
        };
        table = new JTable(tableModel);

        add(busca, BorderLayout.NORTH);
        add(left, BorderLayout.WEST);
        add(new JScrollPane(table), BorderLayout.CENTER);

        configurarEventos();
        atualizarTabela();
    }

    private void configurarEventos() {
        btNovo.addActionListener(e -> limparFormulario());

        btSalvar.addActionListener(e -> {
            try {
                if (entregaEmEdicao == null) entregaEmEdicao = new Entrega();

                entregaEmEdicao.setBeneficiario((Beneficiario) cbBeneficiario.getSelectedItem());
                Item itemSel = (Item) cbItem.getSelectedItem();
                int qtd = (Integer) spQuantidade.getValue();
                entregaEmEdicao.setItems(List.of(
                        new EntregaItem(null, itemSel.getId(), itemSel, qtd)
                ));
                entregaEmEdicao.setDataEntrega(LocalDate.parse(tfData.getText(), DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                entregaEmEdicao.setStatus((StatusEntrega) cbStatus.getSelectedItem());
                entregaEmEdicao.setRota((Rota) cbRota.getSelectedItem());
                entregaEmEdicao.setDescricao(taObs.getText());

                controller.salvar(entregaEmEdicao);
                limparFormulario();
                atualizarTabela();
                JOptionPane.showMessageDialog(this, "Entrega salva com sucesso!");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erro ao salvar: " + ex.getMessage());
            }
        });

        btExcluir.addActionListener(e -> {
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

        btBuscar.addActionListener(e -> atualizarTabela());

        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && table.getSelectedRow() != -1) {
                Long id = (Long) table.getValueAt(table.getSelectedRow(), 0);
                entregaEmEdicao = controller.buscarPorId(id);
                if (entregaEmEdicao != null) preencherFormulario(entregaEmEdicao);
            }
        });
    }

    private void limparFormulario() {
        entregaEmEdicao = null;
        cbBeneficiario.setSelectedIndex(0);
        cbItem.setSelectedIndex(0);
        spQuantidade.setValue(1);
        tfData.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        cbStatus.setSelectedIndex(0);
        cbRota.setSelectedItem(null);
        taObs.setText("");
        table.clearSelection();
    }

    private void preencherFormulario(Entrega entrega) {
        cbBeneficiario.setSelectedItem(entrega.getBeneficiario());
        if (!entrega.getItems().isEmpty()) {
            EntregaItem ei = entrega.getItems().get(0);
            cbItem.setSelectedItem(ei.getItem());
            spQuantidade.setValue(ei.getQuantidade());
        }
        tfData.setText(entrega.getDataEntrega().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        cbStatus.setSelectedItem(entrega.getStatus());
        cbRota.setSelectedItem(entrega.getRota());
        taObs.setText(entrega.getDescricao());
    }

    private void atualizarTabela() {
        tableModel.setRowCount(0);
        List<Entrega> entregas;
        StatusEntrega st = (StatusEntrega) cbBuscaStatus.getSelectedItem();
        Beneficiario ben = (Beneficiario) cbBuscaBeneficiario.getSelectedItem();
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
            tableModel.addRow(new Object[]{
                    e.getId(),
                    e.getBeneficiario().getNome(),
                    itens.toString(),
                    e.getDataEntrega().format(fmt),
                    e.getStatus(),
                    e.getRota() != null ? e.getRota().getNome() : ""
            });
        }
    }
}
