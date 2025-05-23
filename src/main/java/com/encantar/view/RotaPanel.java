package main.java.com.encantar.view;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class RotaPanel extends JPanel {

    private final JTable table;
    private final JTextField tfTitulo = new JTextField(20);
    private final JTextField tfData   = new JTextField(10);
    private final JTextArea  taDesc   = new JTextArea(3,20);
    private final JButton btNova = new JButton("Nova");
    private final JButton btSalvar = new JButton("Salvar");
    private final JButton btExcluir = new JButton("Excluir");

    public RotaPanel() {
        setLayout(new BorderLayout());

        JPanel form = new JPanel(new GridLayout(0,1,5,5));
        form.add(new JLabel("Título:"));     form.add(tfTitulo);
        form.add(new JLabel("Data (AAAA-MM-DD):")); form.add(tfData);
        form.add(new JLabel("Descrição:"));
        form.add(new JScrollPane(taDesc));

        JPanel botoes = new JPanel();
        botoes.add(btNova); botoes.add(btSalvar); botoes.add(btExcluir);

        JPanel left = new JPanel(new BorderLayout());
        left.setPreferredSize(new Dimension(300,350));
        left.add(form, BorderLayout.CENTER);
        left.add(botoes, BorderLayout.SOUTH);

        table = new JTable(new DefaultTableModel(
                new Object[]{"ID","Título","Data"},0));

        add(left, BorderLayout.WEST);
        add(new JScrollPane(table), BorderLayout.CENTER);
    }
}
