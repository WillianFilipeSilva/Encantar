package com.encantar.view;

import javax.swing.*;
import java.net.URL;

public class LogoCarregamento extends JWindow {
    public LogoCarregamento() {
        URL caminhoLogo = getClass().getClassLoader().getResource("img/LogoEncantar.png");
        JLabel rotuloLogo = (caminhoLogo != null)
                ? new JLabel(new ImageIcon(caminhoLogo))
                : new JLabel("ENCANTAR", SwingConstants.CENTER);
        if (caminhoLogo == null) rotuloLogo.setFont(rotuloLogo.getFont().deriveFont(32f));

        add(rotuloLogo);
        pack();
        setLocationRelativeTo(null);
        setAlwaysOnTop(true);
        setVisible(true);

        Timer temporizadorLogo = new Timer(2000, e -> {
            dispose();
            new LoginFrame().setVisible(true);
        });
        temporizadorLogo.setRepeats(false);
        temporizadorLogo.start();
    }
}
