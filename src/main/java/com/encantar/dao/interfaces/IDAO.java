package com.encantar.dao.interfaces;

public interface IDAO<T> {
    void criar(T entidade);

    T buscarPorId(Long id);

    void atualizar(T entidade);

    void deletar(Long id);
} 