package main.java.com.encantar.view;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class EntregaPanel extends JPanel {

    private final JTable table;
    private final JComboBox<String> cbBenef = new JComboBox<>();
    private final JTextField tfData = new JTextField(10);
    private final JTextArea taDesc  = new JTextArea(3,20);
    private final JComboBox<String> cbStatus = new JComboBox<>(new String[]{"PENDENTE","REALIZADA","NAO_REALIZADA"});
    private final JButton btNova   = new JButton("Nova");
    private final JButton btSalvar = new JButton("Salvar");
    private final JButton btCancelar = new JButton("Cancelar");

    public EntregaPanel() {
        setLayout(new BorderLayout());

        JPanel form = new JPanel(new GridLayout(0,2,5,5));
        form.add(new JLabel("Beneficiário:")); form.add(cbBenef);
        form.add(new JLabel("Data (AAAA-MM-DD):")); form.add(tfData);
        form.add(new JLabel("Status:"));       form.add(cbStatus);
        form.add(new JLabel("Descrição:"));    form.add(new JScrollPane(taDesc));

        JPanel botoes = new JPanel();
        botoes.add(btNova); botoes.add(btSalvar); botoes.add(btCancelar);

        JPanel left = new JPanel(new BorderLayout());
        left.setPreferredSize(new Dimension(350,400));
        left.add(form, BorderLayout.CENTER);
        left.add(botoes, BorderLayout.SOUTH);

        table = new JTable(new DefaultTableModel(
                new Object[]{"ID","Benef.","Data","Status"},0));

        add(left, BorderLayout.WEST);
        add(new JScrollPane(table), BorderLayout.CENTER);
    }
}