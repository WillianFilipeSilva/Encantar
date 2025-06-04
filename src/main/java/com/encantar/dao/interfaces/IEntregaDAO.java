package com.encantar.dao.interfaces;

import com.encantar.model.Entrega;
import com.encantar.model.enums.StatusEntrega;

import java.time.LocalDate;
import java.util.List;

public interface IEntregaDAO extends IDAO<Entrega> {
    List<Entrega> buscarPorBeneficiario(Long beneficiarioId);

    List<Entrega> buscarPorStatus(StatusEntrega status);

    List<Entrega> buscarPorData(LocalDate data);

    List<Entrega> buscarPorRota(Long rotaId);

    List<Entrega> buscarTodos();
} 