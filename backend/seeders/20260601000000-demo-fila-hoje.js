'use strict';

/**
 * Fila de demonstracao para o dia atual (fuso de Manaus): 8 pacientes aguardando,
 * em 3 medicos de 3 especialidades, com prioridades diferentes (idoso, pcd, gestante e normal).
 *
 * Depende do seed inicial (usa os mesmos IDs de medicos e pacientes).
 * Pode ser executado de novo a qualquer momento para trazer a fila para a data de hoje:
 *   npm run db:seed:demo
 */
const TIMEZONE = 'America/Manaus';
const uuid = (numero) => `00000000-0000-4000-8000-${String(numero).padStart(12, '0')}`;

const hojeEmManaus = () => {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .formatToParts(new Date())
    .reduce((resultado, parte) => ({ ...resultado, [parte.type]: parte.value }), {});

  return `${partes.year}-${partes.month}-${partes.day}`;
};

// [codigo, paciente, medico, horario, prioridade, score_risco, nivel_risco]
const fila = [
  ['VPL-F001', 301, 201, '08:00', 'idoso', 35, 'baixo'],
  ['VPL-F002', 302, 201, '08:30', 'normal', 62, 'medio'],
  ['VPL-F003', 313, 201, '09:00', 'idoso', 24, 'baixo'],
  ['VPL-F004', 305, 204, '08:00', 'pcd', 78, 'alto'],
  ['VPL-F005', 306, 207, '08:00', 'gestante', 31, 'baixo'],
  ['VPL-F006', 308, 207, '08:30', 'gestante', 48, 'medio'],
  ['VPL-F007', 311, 204, '08:30', 'normal', 83, 'alto'],
  ['VPL-F008', 314, 207, '09:00', 'pcd', 55, 'medio']
];

const codigos = fila.map(([codigo]) => codigo);

module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*)::int AS total FROM medicos WHERE id IN (:medicos)`,
      { replacements: { medicos: [201, 204, 207].map(uuid) } }
    );
    if (total !== 3) {
      throw new Error('Seed de demonstracao exige o seed inicial (medicos 201, 204 e 207). Rode "npm run db:seed" antes.');
    }

    const hoje = hojeEmManaus();
    const agora = new Date();

    // Permite repetir o seed em outro dia sem violar a unicidade do codigo.
    await queryInterface.bulkDelete('consultas', { codigo: codigos });

    await queryInterface.bulkInsert(
      'consultas',
      fila.map(([codigo, paciente, medico, horario, prioridade, scoreRisco, nivelRisco], indice) => ({
        id: uuid(900 + indice),
        paciente_id: uuid(paciente),
        medico_id: uuid(medico),
        codigo,
        consulta_em: new Date(`${hoje}T${horario}:00-04:00`),
        status: 'aguardando',
        prioridade,
        score_risco: scoreRisco,
        nivel_risco: nivelRisco,
        observacoes: 'Fila de demonstracao.',
        criado_em: agora,
        atualizado_em: agora
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('consultas', { codigo: codigos });
  }
};
