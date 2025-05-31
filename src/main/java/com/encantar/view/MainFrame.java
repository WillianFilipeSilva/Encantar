package com.encantar.view;

import javax.swing.*;

public class MainFrame extends JFrame {
    public MainFrame() {
        setTitle("Sistema Encantar");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1024, 768);
        setLocationRelativeTo(null);

        JTabbedPane tabbedPane = new JTabbedPane();
        tabbedPane.addTab("Beneficiários", new BeneficiarioPanel());
        tabbedPane.addTab("Itens", new ItemPanel());
        tabbedPane.addTab("Entregas", new EntregaPanel());
        tabbedPane.addTab("Rotas", new RotaPanel());

        add(tabbedPane);
    }
}
