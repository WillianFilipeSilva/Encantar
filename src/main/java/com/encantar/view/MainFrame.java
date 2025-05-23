package main.java.com.encantar.view;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;

public class MainFrame extends JFrame {

    private final JTextField tfLogin = new JTextField(10);
    private final JPasswordField pfSenha = new JPasswordField(10);
    private final JButton btLogar = new JButton("Logar");
    private final JButton btCancelar = new JButton("Cancelar");

    private final CardLayout card = new CardLayout();
    private final JPanel content = new JPanel(card);          // centro

    public MainFrame() {
        setTitle("Encantar");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        montarTelaLogin();
        definirEventosLogin();
        pack();
        setLocationRelativeTo(null);
    }

    private void montarTelaLogin() {
        JPanel loginPanel = new JPanel(null);
        loginPanel.setPreferredSize(new Dimension(260, 180));

        JLabel lbLogin = new JLabel("Login:");
        JLabel lbSenha = new JLabel("Senha:");
        lbLogin.setBounds(20, 25, 80, 25);
        lbSenha.setBounds(20, 70, 80, 25);
        tfLogin.setBounds(90, 25, 130, 25);
        pfSenha.setBounds(90, 70, 130, 25);
        btLogar.setBounds(20, 120, 100, 25);
        btCancelar.setBounds(125, 120, 100, 25);

        loginPanel.add(lbLogin);   loginPanel.add(tfLogin);
        loginPanel.add(lbSenha);   loginPanel.add(pfSenha);
        loginPanel.add(btLogar);   loginPanel.add(btCancelar);

        setContentPane(loginPanel);
    }

    private void definirEventosLogin() {
        btLogar.addActionListener(e -> autenticar());
        btCancelar.addActionListener(e -> System.exit(0));
    }

    private void autenticar() {
        String user = tfLogin.getText();
        String pwd  = String.valueOf(pfSenha.getPassword());
        if ("admin".equals(user) && "admin".equals(pwd)) {
            montarTelaPrincipal();
        } else {
            JOptionPane.showMessageDialog(this, "Login ou senha incorretos");
        }
    }

    private void montarTelaPrincipal() {

        JPanel side = new JPanel();
        side.setLayout(new BoxLayout(side, BoxLayout.Y_AXIS));
        side.setPreferredSize(new Dimension(150, 0));

        addBotaoLateral(side, "Beneficiários", "BENEF");
        addBotaoLateral(side, "Itens",          "ITEM");
        addBotaoLateral(side, "Estoque",       "ESTOQUE");
        addBotaoLateral(side, "Entregas",      "ENTREGA");
        addBotaoLateral(side, "Rotas",         "ROTA");

        content.add(new BeneficiarioPanel(), "BENEF");
        content.add(new ItemPanel(),          "ITEM");
        content.add(new EstoquePanel(),       "ESTOQUE");
        content.add(new EntregaPanel(),       "ENTREGA");
        content.add(new RotaPanel(),          "ROTA");

        JPanel root = new JPanel(new BorderLayout());
        root.add(side, BorderLayout.WEST);
        root.add(content, BorderLayout.CENTER);

        setContentPane(root);
        setSize(800, 600);
        revalidate();
        repaint();
    }

    private void addBotaoLateral(JPanel side, String texto, String cardName) {
        JButton btn = new JButton(texto);
        btn.setAlignmentX(Component.CENTER_ALIGNMENT);
        btn.addActionListener((ActionEvent e) -> card.show(content, cardName));
        side.add(btn);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new MainFrame().setVisible(true));
    }
}
