const { Consulta, Paciente } = require('../banco/modelos');

/**
 * Calcula o score de risco de no-show (0 a 100) e classifica o nível de risco.
 * @param {Object} params
 * @param {string} params.paciente_id - ID do paciente
 * @param {string|Date} params.consulta_em - Data/hora da consulta agendada
 * @param {string} params.prioridade - Tipo de prioridade (normal, idoso, pcd, gestante)
 */
async function calcularRiscoNoShow({ paciente_id, consulta_em, prioridade }) {
  let score = 0;

  try {
    // 1. Pesquisa histórico de consultas anteriores do paciente no banco
    const historico = await Consulta.findAll({
      where: { paciente_id },
      attributes: ['status']
    });

    if (historico && historico.length > 0) {
      const totalConsultas = historico.length;
      const faltasAnteriores = historico.filter(c => c.status === 'falta').length;

      // Se já possui faltas registradas, acrescenta até 50 pontos de risco proporcionalmente
      if (faltasAnteriores > 0) {
        const taxaFaltas = faltasAnteriores / totalConsultas;
        score += taxaFaltas * 50;
      }
    }

    // 2. Fator de Antecedência do Agendamento (agendamentos muito distantes aumentam esquecimento)
    const dataConsulta = new Date(consulta_em);
    const hoje = new Date();
    const diasAntecedencia = Math.ceil((dataConsulta - hoje) / (1000 * 60 * 60 * 24));

    if (diasAntecedencia >= 5) {
      score += 25;
    } else if (diasAntecedencia >= 3) {
      score += 15;
    }

    // 3. Fator de Dia da Semana (Segundas e Sextas-feiras têm estatisticamente maior taxa de ausência)
    const diaSemana = dataConsulta.getDay(); // 1 = Segunda, 5 = Sexta
    if (diaSemana === 1 || diaSemana === 5) {
      score += 15;
    }

    // 4. Fator de Prioridade Legal (Atendimentos prioritários possuem menor taxa de ausência)[cite: 1]
    if (prioridade && prioridade !== 'normal') {
      score -= 10;
    }

    // Normaliza a pontuação entre 0 e 100
    const scoreFinal = Math.min(Math.max(Math.round(score), 0), 100);

    // Classificação por faixas de risco
    let nivelRisco = 'baixo';
    if (scoreFinal >= 70) {
      nivelRisco = 'alto';
    } else if (scoreFinal >= 40) {
      nivelRisco = 'medio';
    }

    return { score_risco: scoreFinal, nivel_risco: nivelRisco };
  } catch (error) {
    // Fallback de segurança em caso de falha no cálculo
    return { score_risco: 0, nivel_risco: 'baixo' };
  }
}

module.exports = { calcularRiscoNoShow };