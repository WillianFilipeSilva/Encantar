SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE =
        'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP SCHEMA IF EXISTS encantar;

CREATE SCHEMA IF NOT EXISTS encantar DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE encantar;

DROP TABLE IF EXISTS encantar.beneficiario;

CREATE TABLE IF NOT EXISTS encantar.beneficiario
(
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    nome           VARCHAR(100) NOT NULL,
    endereco       VARCHAR(200) NOT NULL,
    telefone       VARCHAR(20)  NOT NULL,
    descricao      VARCHAR(300) NOT NULL     DEFAULT '',
    status         VARCHAR(20)  NOT NULL DEFAULT 'ATIVO',
    data_inscricao DATE         NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_beneficiario_status (status),
    INDEX idx_beneficiario_data_inscricao (data_inscricao)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS encantar.rota;

CREATE TABLE IF NOT EXISTS encantar.rota
(
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    nome         VARCHAR(100) NOT NULL,
    data_criacao DATE         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE',
    PRIMARY KEY (id),
    INDEX idx_rota_status (status)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS encantar.entrega;

CREATE TABLE IF NOT EXISTS encantar.entrega
(
    id              BIGINT      NOT NULL AUTO_INCREMENT,
    beneficiario_id BIGINT      NOT NULL,
    quantidade      INT         NOT NULL,
    data_entrega    DATE        NOT NULL,
    status          VARCHAR(20) NOT NULL,
    descricao       VARCHAR(300) NOT NULL     DEFAULT '',
    rota_id         BIGINT      NOT NULL,
    PRIMARY KEY (id),
    INDEX beneficiario_id (beneficiario_id),
    INDEX rota_id (rota_id),
    INDEX idx_entrega_data_entrega (data_entrega),
    INDEX idx_entrega_status (status),
    CONSTRAINT entrega_beneficiario FOREIGN KEY (beneficiario_id) REFERENCES encantar.beneficiario (id),
    CONSTRAINT entrega_rota FOREIGN KEY (rota_id) REFERENCES encantar.rota (id) ON DELETE CASCADE ON UPDATE CASCADE
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS encantar.item;

CREATE TABLE IF NOT EXISTS encantar.item
(
    id        BIGINT       NOT NULL AUTO_INCREMENT,
    nome      VARCHAR(100) NOT NULL,
    descricao VARCHAR(300) NOT NULL     DEFAULT '',
    PRIMARY KEY (id),
    INDEX idx_item_nome (nome)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS encantar.entrega_item;

CREATE TABLE IF NOT EXISTS encantar.entrega_item
(
    entrega_id BIGINT NOT NULL,
    item_id    BIGINT NOT NULL,
    PRIMARY KEY (entrega_id, item_id),
    INDEX item_id (item_id),
    CONSTRAINT entregai_entrega FOREIGN KEY (entrega_id) REFERENCES encantar.entrega (id),
    CONSTRAINT entregai_item FOREIGN KEY (item_id) REFERENCES encantar.item (id)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS encantar.estoque;

CREATE TABLE IF NOT EXISTS encantar.estoque
(
    id           BIGINT NOT NULL AUTO_INCREMENT,
    item_id      BIGINT NOT NULL,
    quantidade   INT    NOT NULL,
    data_entrada DATE   NOT NULL,
    PRIMARY KEY (id),
    INDEX item_id (item_id),
    CONSTRAINT estoque_item FOREIGN KEY (item_id) REFERENCES encantar.item (id)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;

SET SQL_MODE = @OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;