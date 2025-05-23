package main.java.com.encantar.view;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class BeneficiarioPanel extends JPanel {

    private final JTable table;
    private final JTextField tfNome   = new JTextField(20);
    private final JTextField tfEnd    = new JTextField(20);
    private final JTextField tfFone   = new JTextField(20);
    private final JTextField tfObs    = new JTextField(20);
    private final JComboBox<String> cbStatus = new JComboBox<>(new String[]{"ATIVO", "INATIVO"});
    private final JButton btNovo = new JButton("Novo");
    private final JButton btSalvar = new JButton("Salvar");
    private final JButton btExcluir = new JButton("Excluir");

    public BeneficiarioPanel() {
        setLayout(new BorderLayout());

        JPanel form = new JPanel(new GridLayout(0,2,5,5));
        form.add(new JLabel("Nome:"));          form.add(tfNome);
        form.add(new JLabel("Endereço:"));      form.add(tfEnd);
        form.add(new JLabel("Telefone:"));      form.add(tfFone);
        form.add(new JLabel("Observações:"));   form.add(tfObs);
        form.add(new JLabel("Status:"));        form.add(cbStatus);

        JPanel botoes = new JPanel();
        botoes.add(btNovo); botoes.add(btSalvar); botoes.add(btExcluir);

        JPanel left = new JPanel(new BorderLayout());
        left.setPreferredSize(new Dimension(300,400));
        left.add(form, BorderLayout.CENTER);
        left.add(botoes, BorderLayout.SOUTH);

        table = new JTable(new DefaultTableModel(
                new Object[]{"ID", "Nome", "Telefone", "Status"}, 0));
        JScrollPane scroll = new JScrollPane(table);

        add(left, BorderLayout.WEST);
        add(scroll, BorderLayout.CENTER);

    }
}
