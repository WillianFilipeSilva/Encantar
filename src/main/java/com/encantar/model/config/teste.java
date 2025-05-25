package main.java.com.encantar.model.config;

import java.sql.Connection;
import java.sql.SQLException;

public class teste {
    public static void main(String[] args) {
        try (Connection conn = Conexao.getConnection()) {
            System.out.println("✅ Conectado com sucesso ao MySQL!");
        } catch (SQLException e) {
            System.out.println("❌ Erro: " + e.getMessage());
        }
    }
}

