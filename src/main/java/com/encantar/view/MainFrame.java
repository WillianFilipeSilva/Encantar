package com.encantar.view;

import javax.swing.*;
import java.awt.*;

public class MainFrame extends JFrame {
    private final CardLayout cartao = new CardLayout();
    private final JPanel centro = new JPanel(cartao);

    public MainFrame() {
        setTitle("Encantar");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1920, 1080);
        setLocationRelativeTo(null);
        setExtendedState(JFrame.MAXIMIZED_BOTH);

        centro.add(new BeneficiarioPanel(), "Beneficiários");
        centro.add(new ItemPanel(), "Itens");
        centro.add(new EntregaPanel(), "Entregas");
        centro.add(new RotaPanel(), "Rotas");

        JPanel barraLateral = new JPanel();
        barraLateral.setLayout(new BoxLayout(barraLateral, BoxLayout.Y_AXIS));
        barraLateral.setPreferredSize(new Dimension(150, 0));

        JButton botaoBeneficiarios = criarBotao("Beneficiários");
        JButton botaoItens = criarBotao("Itens");
        JButton botaoEntregas = criarBotao("Entregas");
        JButton botaoRotas = criarBotao("Rotas");

        barraLateral.add(botaoBeneficiarios);
        barraLateral.add(Box.createVerticalStrut(10));
        barraLateral.add(botaoItens);
        barraLateral.add(Box.createVerticalStrut(10));
        barraLateral.add(botaoEntregas);
        barraLateral.add(Box.createVerticalStrut(10));
        barraLateral.add(botaoRotas);

        botaoBeneficiarios.addActionListener(e -> cartao.show(centro, "Beneficiários"));
        botaoItens.addActionListener(e -> cartao.show(centro, "Itens"));
        botaoEntregas.addActionListener(e -> cartao.show(centro, "Entregas"));
        botaoRotas.addActionListener(e -> cartao.show(centro, "Rotas"));

        add(barraLateral, BorderLayout.WEST);
        add(centro, BorderLayout.CENTER);
    }

    private JButton criarBotao(String texto) {
        JButton botao = new JButton(texto);
        botao.setAlignmentX(Component.CENTER_ALIGNMENT);
        botao.setMaximumSize(new Dimension(130, 40));
        botao.setFocusPainted(false);
        botao.setBorder(BorderFactory.createLineBorder(Color.lightGray, 1, true));
        return botao;
    }
}