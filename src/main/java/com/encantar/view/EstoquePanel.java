package com.encantar.view;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class EstoquePanel extends JPanel {

    private final JTable tabela;
    private final JComboBox<String> campoItem = new JComboBox<>();
    private final JSpinner campoQuantidade = new JSpinner(new SpinnerNumberModel(0, 0, 9999, 1));
    private final JButton botaoEntrada = new JButton("Entrada");
    private final JButton botaoSaida = new JButton("Saída");

    public EstoquePanel() {
        setLayout(new BorderLayout());

        JPanel painelSuperior = new JPanel(new FlowLayout(FlowLayout.LEFT));
        painelSuperior.add(new JLabel("Item:"));
        painelSuperior.add(campoItem);
        painelSuperior.add(new JLabel("Quantidade:"));
        painelSuperior.add(campoQuantidade);
        painelSuperior.add(botaoEntrada);
        painelSuperior.add(botaoSaida);

        tabela = new JTable(new DefaultTableModel(
                new Object[]{"Item", "Quantidade"}, 0));

        add(painelSuperior, BorderLayout.NORTH);
        add(new JScrollPane(tabela), BorderLayout.CENTER);
    }
}
