'use strict';

const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const TIMEZONE = 'America/Manaus';

const uuid = (numero) => `00000000-0000-4000-8000-${String(numero).padStart(12, '0')}`;

const ids = {
  admin: uuid(1),
  recepcao: uuid(2)
};

const gerarCpf = (semente) => {
  const base = String(semente).padStart(9, '0').slice(-9).split('').map(Number);
  const calcularDigito = (numeros, fatorInicial) => {
    const soma = numeros.reduce((total, numero, indice) => total + numero * (fatorInicial - indice), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const primeiroDigito = calcularDigito(base, 10);
  const segundoDigito = calcularDigito([...base, primeiroDigito], 11);
  return [...base, primeiroDigito, segundoDigito].join('');
};

const dataAtualManaus = () => {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .formatToParts(new Date())
    .reduce((resultado, parte) => {
      resultado[parte.type] = parte.value;
      return resultado;
    }, {});

  return `${partes.year}-${partes.month}-${partes.day}`;
};

const ehDiaUtil = (data) => ![0, 6].includes(data.getUTCDay());

const criarDataManaus = (data) => new Date(`${data}T00:00:00-04:00`);

const formatarData = (data) => data.toISOString().slice(0, 10);

const diasUteisAnteriores = (quantidade) => {
  const base = criarDataManaus(dataAtualManaus());
  const dias = [];
  let deslocamento = 1;

  while (dias.length < quantidade) {
    const data = new Date(base);
    data.setUTCDate(base.getUTCDate() - deslocamento);
    if (ehDiaUtil(data)) dias.unshift(formatarData(data));
    deslocamento += 1;
  }

  return dias;
};

const proximosDiasUteis = (quantidade) => {
  const base = criarDataManaus(dataAtualManaus());
  const dias = [];
  let deslocamento = 1;

  while (dias.length < quantidade) {
    const data = new Date(base);
    data.setUTCDate(base.getUTCDate() + deslocamento);
    if (ehDiaUtil(data)) dias.push(formatarData(data));
    deslocamento += 1;
  }

  return dias;
};

const emManaus = (data, horario) => new Date(`${data}T${horario}:00-04:00`);

const especialidades = [
  ['Clinica Geral', 'Atendimento medico geral e acompanhamento inicial.'],
  ['Pediatria', 'Atendimento medico para criancas e adolescentes.'],
  ['Ginecologia', 'Saude da mulher e acompanhamento ginecologico.'],
  ['Cardiologia', 'Avaliacao, prevencao e acompanhamento cardiologico.'],
  ['Dermatologia', 'Diagnostico e cuidado de pele, cabelos e unhas.'],
  ['Ortopedia', 'Avaliacao de ossos, articulacoes, musculos e lesoes.'],
  ['Oftalmologia', 'Avaliacao clinica da visao e saude ocular.'],
  ['Neurologia', 'Acompanhamento de condicoes neurologicas.'],
  ['Psiquiatria', 'Avaliacao e cuidado em saude mental.'],
  ['Endocrinologia', 'Acompanhamento hormonal e metabolico.']
].map(([nome, descricao], indice) => ({
  id: uuid(101 + indice),
  nome,
  descricao,
  ativo: true
}));

const nomesMedicos = [
  'Dra. Helena Costa',
  'Dr. Marcos Lima',
  'Dra. Ana Beatriz Souza',
  'Dr. Rafael Almeida',
  'Dra. Camila Rocha',
  'Dr. Felipe Nascimento',
  'Dra. Juliana Martins',
  'Dr. Bruno Carvalho',
  'Dra. Larissa Ribeiro',
  'Dr. Gustavo Pereira',
  'Dra. Mariana Torres',
  'Dr. Thiago Duarte',
  'Dra. Paula Fernandes',
  'Dr. Renato Azevedo',
  'Dra. Vanessa Barros',
  'Dr. Eduardo Moreira',
  'Dra. Simone Castro',
  'Dr. Andre Lopes',
  'Dra. Natalia Farias',
  'Dr. Caio Mendes',
  'Dra. Fernanda Sales',
  'Dr. Lucas Teixeira',
  'Dra. Priscila Vieira',
  'Dr. Mateus Correia',
  'Dra. Aline Moraes',
  'Dr. Diego Ramos',
  'Dra. Carolina Batista',
  'Dr. Henrique Fonseca',
  'Dra. Livia Cardoso',
  'Dr. Otavio Nunes'
];

const slug = (texto) =>
  texto
    .toLowerCase()
    .replace(/^dr[a]?\.\s*/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.');

const medicos = nomesMedicos.map((nome, indice) => ({
  id: uuid(201 + indice),
  especialidade_id: especialidades[Math.floor(indice / 3)].id,
  nome,
  crm: `CRM-AM ${10001 + indice}`,
  telefone: `(92) 98${String(indice + 1).padStart(3, '0')}-${String(1100 + indice).padStart(4, '0')}`,
  email: `${slug(nome)}@filajusta.com`,
  ativo: true
}));

const pacientesBase = [
  ['Joao Batista Oliveira', '1961-02-12'],
  ['Maria Eduarda Santos', '1988-06-23'],
  ['Carlos Alberto Pereira', '1975-10-04'],
  ['Ana Clara Rodrigues', '1994-03-18'],
  ['Pedro Henrique Alves', '2001-11-30'],
  ['Fernanda Costa Lima', '1982-07-09'],
  ['Roberto Nascimento Silva', '1958-01-27'],
  ['Patricia Almeida Gomes', '1990-12-15'],
  ['Lucas Martins Carvalho', '1998-05-21'],
  ['Juliana Ribeiro Ferreira', '1992-09-11'],
  ['Marcos Vinicius Duarte', '1985-04-02'],
  ['Camila Azevedo Rocha', '1996-08-29'],
  ['Antônio Carlos Silva', '1952-05-14'],
  ['Beatriz Souza Mendes', '1999-01-20'],
  ['Gabriel Monteiro Lima', '2003-08-11']
];

const pacientes = pacientesBase.map(([nome, dataNascimento], indice) => ({
  id: uuid(301 + indice),
  nome,
  cpf: gerarCpf(100000001 + indice),
  telefone: `(92) 99${String(indice + 1).padStart(3, '0')}-${String(2200 + indice).padStart(4, '0')}`,
  email: `${slug(nome)}@exemplo.com`,
  data_nascimento: dataNascimento
}));

// Horários de atendimento disponíveis no expediente
const horariosAtendimento = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

/**
 * Função simuladora do SmartPredict para calcular o score e nível de risco durante o seed.
 */
const calcularRiscoSeed = (historicoConsultas, pacienteId, dataConsultaEm, prioridade) => {
  let score = 0;

  // 1. Histórico prévio do paciente no seed
  const historicoPaciente = historicoConsultas.filter(c => c.paciente_id === pacienteId);
  const totalConsultas = historicoPaciente.length;
  const faltasAnteriores = historicoPaciente.filter(c => c.status === 'falta').length;

  let scoreHistorico = 0;
  if (totalConsultas > 0 && faltasAnteriores > 0) {
    const taxaFaltas = faltasAnteriores / totalConsultas;
    scoreHistorico = taxaFaltas * 50;
  }

  // 2. Antecedência
  const dataConsulta = new Date(dataConsultaEm);
  const hoje = new Date();
  const diasAntecedencia = Math.ceil((dataConsulta - hoje) / (1000 * 60 * 60 * 24));

  // 3. Regra de Antecedência > 3 dias + Prioridade
  if (diasAntecedencia > 3 && faltasAnteriores > 0) {
    const prio = (prioridade || '').toLowerCase();
    if (prio === 'idoso') {
      scoreHistorico *= 1.5;
    } else if (prio === 'pcd' || prio === 'gestante') {
      scoreHistorico *= 1.3;
    }
  }

  score += scoreHistorico;

  if (diasAntecedencia >= 5) {
    score += 25;
  } else if (diasAntecedencia >= 3) {
    score += 15;
  }

  const diaSemana = dataConsulta.getDay();
  if (diaSemana === 1 || diaSemana === 5) {
    score += 15;
  }

  if (prioridade && prioridade !== 'normal' && diasAntecedencia <= 3) {
    score -= 10;
  }

  const scoreFinal = Math.min(Math.max(Math.round(score), 0), 100);

  let nivelRisco = 'baixo';
  if (scoreFinal >= 70) {
    nivelRisco = 'alto';
  } else if (scoreFinal >= 40) {
    nivelRisco = 'medio';
  }

  return { score_risco: scoreFinal, nivel_risco: nivelRisco };
};

/**
 * Gera mais de 100 consultas distribuídas entre os dias úteis passados e futuros.
 */
const gerarColecao100Consultas = () => {
  const diasPassados = diasUteisAnteriores(10); // 10 dias úteis de histórico
  const diasFuturos = proximosDiasUteis(5);     // 5 dias úteis de agendamentos futuros
  const todasConsultas = [];
  let contadorCodigo = 1;

  // Status possíveis para o histórico (passado)
  const statusPassados = ['atendido', 'atendido', 'atendido', 'falta', 'cancelado'];
  const prioridades = ['normal', 'idoso', 'pcd', 'gestante'];

  // 1. POVOAMENTO HISTÓRICO (Dias Passados: Gera volume para BI e histórico de faltas)
  diasPassados.forEach((dia, idxDia) => {
    // 7 consultas por dia passado (total: 70 consultas históricas)
    for (let i = 0; i < 7; i++) {
      const pacienteIndex = (idxDia + i) % pacientes.length;
      const medicoIndex = (idxDia * 2 + i) % medicos.length;
      const horario = horariosAtendimento[i * 2];
      const status = statusPassados[(idxDia + i) % statusPassados.length];
      const prioridade = prioridades[(idxDia + i) % prioridades.length];

      const consultaEm = emManaus(dia, horario);
      const pacienteId = pacientes[pacienteIndex].id;

      // Calcula risco sintético
      const { score_risco, nivel_risco } = calcularRiscoSeed(todasConsultas, pacienteId, consultaEm, prioridade);

      todasConsultas.push({
        id: uuid(400 + contadorCodigo),
        paciente_id: pacienteId,
        medico_id: medicos[medicoIndex].id,
        codigo: `VPL-A${String(contadorCodigo).padStart(3, '0')}`,
        consulta_em: consultaEm,
        status,
        prioridade,
        score_risco,
        nivel_risco,
        observacoes: `Consulta historica seed (${status}) para testes de analytics.`
      });

      contadorCodigo++;
    }
  });

  // 2. POVOAMENTO FUTURO (Dias Futuros: Agendamentos ativos, incluindo cenários SmartPredict e BI)
  const statusFuturos = ['aguardando', 'confirmado'];

  diasFuturos.forEach((dia, idxDia) => {
    // 7 consultas por dia futuro (total: 35 consultas futuras)
    for (let i = 0; i < 7; i++) {
      const pacienteIndex = (idxDia + i) % pacientes.length;
      const medicoIndex = (idxDia * 3 + i) % medicos.length;
      const horario = horariosAtendimento[i * 2 + 1];
      const status = statusFuturos[(idxDia + i) % statusFuturos.length];
      const prioridade = prioridades[(idxDia + i) % prioridades.length];

      const consultaEm = emManaus(dia, horario);
      const pacienteId = pacientes[pacienteIndex].id;

      // Calcula risco preditivo com base no histórico construído
      const { score_risco, nivel_risco } = calcularRiscoSeed(todasConsultas, pacienteId, consultaEm, prioridade);

      todasConsultas.push({
        id: uuid(400 + contadorCodigo),
        paciente_id: pacienteId,
        medico_id: medicos[medicoIndex].id,
        codigo: `VPL-A${String(contadorCodigo).padStart(3, '0')}`,
        consulta_em: consultaEm,
        status,
        prioridade,
        score_risco,
        nivel_risco,
        observacoes: `Consulta futura agendada (${status}) com risco preditivo ${nivel_risco}.`
      });

      contadorCodigo++;
    }
  });

  return todasConsultas;
};

const codigosConsultasLegado = ['VPL-IDOS', 'VPL-PCD0', 'VPL-GEST', 'VPL-FALT'];

module.exports = {
  async up(queryInterface) {
    const agora = new Date();
    const senhaHash = await bcrypt.hash('123456', 12);

    // Gera as 105 consultas com dados analíticos e preditivos completos
    const consultas = gerarColecao100Consultas();

    await queryInterface.bulkInsert('usuarios', [
      {
        id: ids.admin,
        nome: 'Administrador FilaJusta',
        email: 'admin@filajusta.com',
        senha_hash: senhaHash,
        perfil: 'admin',
        ativo: true,
        criado_em: agora,
        atualizado_em: agora
      },
      {
        id: ids.recepcao,
        nome: 'Recepcao FilaJusta',
        email: 'recepcao@filajusta.com',
        senha_hash: senhaHash,
        perfil: 'recepcao',
        ativo: true,
        criado_em: agora,
        atualizado_em: agora
      }
    ]);

    await queryInterface.bulkInsert(
      'especialidades',
      especialidades.map((especialidade) => ({
        ...especialidade,
        criado_em: agora,
        atualizado_em: agora
      }))
    );

    await queryInterface.bulkInsert(
      'medicos',
      medicos.map((medico) => ({
        ...medico,
        criado_em: agora,
        atualizado_em: agora
      }))
    );

    await queryInterface.bulkInsert(
      'pacientes',
      pacientes.map((paciente) => ({
        ...paciente,
        criado_em: agora,
        atualizado_em: agora
      }))
    );

    await queryInterface.bulkInsert(
      'consultas',
      consultas.map((consulta) => ({
        ...consulta,
        criado_em: agora,
        atualizado_em: agora
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('consultas', null, {});
    await queryInterface.bulkDelete('pacientes', {
      cpf: { [Op.in]: pacientes.map((paciente) => paciente.cpf) }
    });
    await queryInterface.bulkDelete('medicos', {
      crm: { [Op.in]: medicos.map((medico) => medico.crm) }
    });
    await queryInterface.bulkDelete('especialidades', {
      nome: { [Op.in]: especialidades.map((especialidade) => especialidade.nome) }
    });
    await queryInterface.bulkDelete('usuarios', {
      email: { [Op.in]: ['admin@filajusta.com', 'recepcao@filajusta.com'] }
    });
  }
};