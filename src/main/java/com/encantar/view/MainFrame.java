package com.encantar.view;

import javax.swing.*;
import java.awt.*;

public class MainFrame extends JFrame {
    private final CardLayout gerenciadorCartoes = new CardLayout();
    private final JPanel painelCentral = new JPanel(gerenciadorCartoes);

    public MainFrame() {
        setTitle("Encantar");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1920, 1080);
        setLocationRelativeTo(null);
        setExtendedState(JFrame.MAXIMIZED_BOTH);

        painelCentral.add(new BeneficiarioPanel(), "Beneficiários");
        painelCentral.add(new ItemPanel(), "Itens");
        painelCentral.add(new EntregaPanel(), "Entregas");
        painelCentral.add(new RotaPanel(), "Rotas");

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

        botaoBeneficiarios.addActionListener(e -> gerenciadorCartoes.show(painelCentral, "Beneficiários"));
        botaoItens.addActionListener(e -> gerenciadorCartoes.show(painelCentral, "Itens"));
        botaoEntregas.addActionListener(e -> gerenciadorCartoes.show(painelCentral, "Entregas"));
        botaoRotas.addActionListener(e -> gerenciadorCartoes.show(painelCentral, "Rotas"));

        add(barraLateral, BorderLayout.WEST);
        add(painelCentral, BorderLayout.CENTER);
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