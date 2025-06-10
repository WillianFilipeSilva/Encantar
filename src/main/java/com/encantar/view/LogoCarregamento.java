package com.encantar.view;

import javax.swing.*;
import java.net.URL;

public class LogoCarregamento extends JWindow {
    public LogoCarregamento() {
        URL caminhoLogo = getClass().getClassLoader().getResource("img/LogoEncantar.png");
        JLabel label = (caminhoLogo != null)
                ? new JLabel(new ImageIcon(caminhoLogo))
                : new JLabel("ENCANTAR", SwingConstants.CENTER);
        if (caminhoLogo == null) label.setFont(label.getFont().deriveFont(32f));

        add(label);
        pack();
        setLocationRelativeTo(null);
        setAlwaysOnTop(true);
        setVisible(true);

        Timer tempoLogo = new Timer(2000, e -> {
            dispose();
            new LoginFrame().setVisible(true);
        });
        tempoLogo.setRepeats(false);
        tempoLogo.start();
    }
}
