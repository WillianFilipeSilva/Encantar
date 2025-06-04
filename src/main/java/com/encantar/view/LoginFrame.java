package com.encantar.view;

import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.util.Objects;

public class LoginFrame extends JFrame {
    private final JTextField tfLogin;
    private final JPasswordField pfSenha;
    private final JButton btEntrar;

    public LoginFrame() {
        super("Login - Sistema Encantar");

        // Configurações básicas
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(300, 150);
        setLocationRelativeTo(null);
        setResizable(false);

        // Painel principal
        JPanel panel = new JPanel(new GridLayout(3, 2, 5, 5));
        panel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        // Componentes
        panel.add(new JLabel("Login:"));
        tfLogin = new JTextField();
        panel.add(tfLogin);

        panel.add(new JLabel("Senha:"));
        pfSenha = new JPasswordField();
        panel.add(pfSenha);

        panel.add(new JLabel("")); // Espaço vazio
        btEntrar = new JButton("Entrar");
        panel.add(btEntrar);

        // Adiciona o painel ao frame
        add(panel);

        btEntrar.addActionListener(e -> fazerLogin());

        KeyListener enterListener = new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_ENTER) {
                    fazerLogin();
                }
            }
        };

        tfLogin.addKeyListener(enterListener);
        pfSenha.addKeyListener(enterListener);
    }

    private void fazerLogin() {
        String login = tfLogin.getText();
        String senha = new String(pfSenha.getPassword());

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