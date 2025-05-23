package main.java.com.encantar.view;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class ItemPanel extends JPanel {

    private final JTable table;
    private final JTextField tfNome = new JTextField(20);
    private final JTextArea  taDesc = new JTextArea(3,20);
    private final JButton btNovo = new JButton("Novo");
    private final JButton btSalvar = new JButton("Salvar");
    private final JButton btExcluir = new JButton("Excluir");

    public ItemPanel() {
        setLayout(new BorderLayout());

        JPanel form = new JPanel(new GridLayout(0,1,5,5));
        form.add(new JLabel("Nome:"));  form.add(tfNome);
        form.add(new JLabel("Descrição:"));
        form.add(new JScrollPane(taDesc));

        JPanel botoes = new JPanel();
        botoes.add(btNovo); botoes.add(btSalvar); botoes.add(btExcluir);

        JPanel left = new JPanel(new BorderLayout());
        left.setPreferredSize(new Dimension(300,350));
        left.add(form, BorderLayout.CENTER);
        left.add(botoes, BorderLayout.SOUTH);

        table = new JTable(new DefaultTableModel(
                new Object[]{"ID","Nome"},0));
        add(left, BorderLayout.WEST);
        add(new JScrollPane(table), BorderLayout.CENTER);
    }
}
