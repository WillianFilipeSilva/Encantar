package com.encantar;

import com.encantar.view.LogoCarregamento;
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new LogoCarregamento());
    }
}