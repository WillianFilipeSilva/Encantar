package com.encantar.view;

import javax.swing.*;
import java.net.URL;

public class LogoCarregamento extends JWindow {
    public LogoCarregamento() {
        URL url = getClass().getClassLoader().getResource("img/LogoEncantar.png");
        JLabel label = (url != null)
                ? new JLabel(new ImageIcon(url))
                : new JLabel("ENCANTAR", SwingConstants.CENTER);
        if (url == null) label.setFont(label.getFont().deriveFont(32f));

        add(label);
        pack();
        setLocationRelativeTo(null);
        setAlwaysOnTop(true);
        setVisible(true);

        Timer t = new Timer(2000, e -> {
            dispose();
            new LoginFrame().setVisible(true);
        });
        t.setRepeats(false);
        t.start();
    }
}
