package com.encantar;

import com.encantar.view.LogoCarregamento;
import com.encantar.view.MainFrame;

import javax.swing.*;

public class Main {
    public static void main(String[] args) {
        //SwingUtilities.invokeLater(LogoCarregamento::new);
        new MainFrame().setVisible(true);
    }
}