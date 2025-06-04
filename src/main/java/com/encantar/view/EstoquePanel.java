package com.encantar.view;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class EstoquePanel extends JPanel {

    private final JTable table;
    private final JComboBox<String> cbItem = new JComboBox<>();
    private final JSpinner spQtd = new JSpinner(new SpinnerNumberModel(0, 0, 9999, 1));
    private final JButton btEntrada = new JButton("Entrada");
    private final JButton btSaida = new JButton("Saída");

    public EstoquePanel() {
        setLayout(new BorderLayout());

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        top.add(new JLabel("Item:"));
        top.add(cbItem);
        top.add(new JLabel("Qtd:"));
        top.add(spQtd);
        top.add(btEntrada);
        top.add(btSaida);

        table = new JTable(new DefaultTableModel(
                new Object[]{"Item", "Quantidade"}, 0));

        add(top, BorderLayout.NORTH);
        add(new JScrollPane(table), BorderLayout.CENTER);
    }
}
