﻿# Encantar

Sistema de gestão de beneficiários e entregas para a ONG Encantar.


## Configuração do Banco de Dados

1. Instale o MySQL Server
2. Crie um banco de dados chamado `encantar`:

```sql
CREATE DATABASE encantar;
```

3. Execute o script de criação das tabelas localizado em `src/main/resources/sql/create_tables.sql`

## Configuração do Projeto

1. Clone o repositório
2. Abra o projeto em sua IDE favorita
3. Configure as credenciais do banco de dados em `src/main/java/com/encantar/dao/ConnectionFactory.java`
4. Execute `mvn clean install` para baixar as dependências

## Funcionalidades

- Gestão de Beneficiários
    - Cadastro, edição e exclusão
    - Buscar beneficiários por nome, endereço, telefone ou descrição
    - Filtro por status (ativo/inativo)

- Gestão de Itens
    - adição de itens para entregas (ex: Cesta Básica G, 5 unidades)

- Gestão de Entregas
    - Vinculação de beneficiários e itens entregues
    - Controle de status da entrega

- Gestão de Rotas
    - Agrupamento de entregas
    - Geração de relatório em PDF para entrega

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das mudanças (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request
