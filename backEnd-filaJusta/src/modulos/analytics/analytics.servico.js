const { banco } = require('../../config/banco'); // Instância da conexão com o banco/Supabase
const { Consulta, Paciente, Medico, Especialidade, sequelize } = require('../../banco/modelos');

class AnalyticsServico {
  // Retorna os indicadores de visão geral (KPIs)
  async obterKPIs() {
    const totalAgendamentos = await Consulta.count({ where: { excluido_em: null } });
    const totalAtendidos = await Consulta.count({ where: { status: 'atendido', excluido_em: null } });
    const totalFaltas = await Consulta.count({ where: { status: 'falta', excluido_em: null } });
    const totalCancelados = await Consulta.count({ where: { status: 'cancelado', excluido_em: null } });
    const consultasAltoRisco = await Consulta.count({ 
      where: { nivel_risco: 'alto', status: 'aguardando', excluido_em: null } 
    });

    const taxaNoShowPercentual = totalAgendamentos > 0 
      ? Number(((totalFaltas / totalAgendamentos) * 100).toFixed(2)) 
      : 0;

    return {
      totalAgendamentos,
      totalAtendidos,
      totalFaltas,
      totalCancelados,
      taxaNoShowPercentual,
      consultasAltoRisco
    };
  }

  // Retorna os dados agrupados por especialidade oriundos da View SQL
  async obterNoShowPorEspecialidade() {
    const [resultados] = await sequelize.query('SELECT * FROM vw_analytics_geral');
    return resultados;
  }

  // Retorna a lista de consultas com risco alto para ação da recepção[cite: 1]
  async obterConsultasAltoRisco() {
    return await Consulta.findAll({
      where: {
        nivel_risco: 'alto',
        status: 'aguardando',
        excluido_em: null
      },
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id', 'nome', 'telefone', 'cpf'] },
        { 
          model: Medico, 
          as: 'medico', 
          attributes: ['id', 'nome'],
          include: [{ model: Especialidade, as: 'especialidade', attributes: ['nome'] }] 
        }
      ],
      order: [['consulta_em', 'ASC']]
    });
  }
}

module.exports = new AnalyticsServico();