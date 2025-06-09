package com.encantar.view;

import javax.swing.*;
import java.awt.*;

public class MainFrame extends JFrame {
    private final CardLayout card = new CardLayout();
    private final JPanel centro = new JPanel(card);

    public MainFrame() {
        setTitle("Sistema Encantar");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1024, 768);
        setLocationRelativeTo(null);

        centro.add(new BeneficiarioPanel(), "Beneficiários");
        centro.add(new ItemPanel(), "Itens");
        centro.add(new EntregaPanel(), "Entregas");
        centro.add(new RotaPanel(), "Rotas");

        JPanel nav = new JPanel();
        nav.setLayout(new BoxLayout(nav, BoxLayout.Y_AXIS));
        JButton btBen = new JButton("Beneficiários");
        JButton btItem = new JButton("Itens");
        JButton btEnt = new JButton("Entregas");
        JButton btRot = new JButton("Rotas");
        nav.add(btBen);
        nav.add(btItem);
        nav.add(btEnt);
        nav.add(btRot);

        btBen.addActionListener(e -> card.show(centro, "Beneficiários"));
        btItem.addActionListener(e -> card.show(centro, "Itens"));
        btEnt.addActionListener(e -> card.show(centro, "Entregas"));
        btRot.addActionListener(e -> card.show(centro, "Rotas"));

        add(nav, BorderLayout.WEST);
        add(centro, BorderLayout.CENTER);
    }
}
