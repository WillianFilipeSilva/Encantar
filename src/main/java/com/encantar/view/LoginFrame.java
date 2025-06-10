package com.encantar.view;

import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.util.Objects;

public class LoginFrame extends JFrame {
    private final JTextField campoLogin;
    private final JPasswordField campoSenha;
    private final JButton botaoEntrar;

    public LoginFrame() {
        super("Login - Sistema Encantar");

        // Configurações básicas
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(300, 150);
        setLocationRelativeTo(null);
        setResizable(false);

        // Painel principal
        JPanel painelPrincipal = new JPanel(new GridLayout(3, 2, 5, 5));
        painelPrincipal.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        // Componentes
        painelPrincipal.add(new JLabel("Login:"));
        campoLogin = new JTextField();
        painelPrincipal.add(campoLogin);

        painelPrincipal.add(new JLabel("Senha:"));
        campoSenha = new JPasswordField();
        painelPrincipal.add(campoSenha);

        painelPrincipal.add(new JLabel(""));
        botaoEntrar = new JButton("Entrar");
        painelPrincipal.add(botaoEntrar);

        // Adiciona o painel ao frame
        add(painelPrincipal);

        botaoEntrar.addActionListener(e -> fazerLogin());

        KeyListener enterListener = new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_ENTER) {
                    fazerLogin();
                }
            }
        };

        campoLogin.addKeyListener(enterListener);
        campoSenha.addKeyListener(enterListener);
    }

    private void fazerLogin() {
        String login = campoLogin.getText();
        String senha = new String(campoSenha.getPassword());

        try {

            if (Objects.equals(login, "admin") && senha.equals("admin")) {
                new MainFrame().setVisible(true);
                dispose();
            } else {
                JOptionPane.showMessageDialog(this,
                        "Login ou senha inválidos",
                        "Erro",
                        JOptionPane.ERROR_MESSAGE);
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this,
                    "Erro ao fazer login: " + ex.getMessage(),
                    "Erro",
                    JOptionPane.ERROR_MESSAGE);
        }
    }
}