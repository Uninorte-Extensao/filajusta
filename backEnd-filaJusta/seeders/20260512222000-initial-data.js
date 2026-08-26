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
  ['Camila Azevedo Rocha', '1996-08-29']
];

const pacientes = pacientesBase.map(([nome, dataNascimento], indice) => ({
  id: uuid(301 + indice),
  nome,
  cpf: gerarCpf(100000001 + indice),
  telefone: `(92) 99${String(indice + 1).padStart(3, '0')}-${String(2200 + indice).padStart(4, '0')}`,
  email: `${slug(nome)}@exemplo.com`,
  data_nascimento: dataNascimento
}));

const padraoConsultas = [
  { dia: 0, horario: '07:00', paciente: 0, medico: 0, status: 'atendido', prioridade: 'normal' },
  { dia: 0, horario: '07:30', paciente: 1, medico: 1, status: 'falta', prioridade: 'idoso' },
  { dia: 0, horario: '08:00', paciente: 2, medico: 2, status: 'cancelado', prioridade: 'pcd' },
  { dia: 1, horario: '07:00', paciente: 3, medico: 3, status: 'atendido', prioridade: 'gestante' },
  { dia: 1, horario: '07:30', paciente: 4, medico: 4, status: 'falta', prioridade: 'normal' },
  { dia: 1, horario: '08:00', paciente: 5, medico: 5, status: 'cancelado', prioridade: 'idoso' },
  { dia: 2, horario: '07:00', paciente: 6, medico: 6, status: 'aguardando', prioridade: 'pcd' },
  { dia: 2, horario: '07:30', paciente: 7, medico: 7, status: 'confirmado', prioridade: 'gestante' },
  { dia: 2, horario: '08:00', paciente: 8, medico: 8, status: 'aguardando', prioridade: 'normal' },
  { dia: 2, horario: '08:30', paciente: 9, medico: 9, status: 'confirmado', prioridade: 'idoso' },
  { dia: 3, horario: '09:00', paciente: 10, medico: 10, status: 'aguardando', prioridade: 'pcd' },
  { dia: 3, horario: '09:30', paciente: 11, medico: 11, status: 'confirmado', prioridade: 'gestante' },
  { dia: 3, horario: '10:00', paciente: 0, medico: 12, status: 'cancelado', prioridade: 'normal' },
  { dia: 3, horario: '10:30', paciente: 1, medico: 13, status: 'aguardando', prioridade: 'idoso' },
  { dia: 4, horario: '11:00', paciente: 2, medico: 14, status: 'confirmado', prioridade: 'pcd' },
  { dia: 4, horario: '11:30', paciente: 3, medico: 15, status: 'aguardando', prioridade: 'gestante' },
  { dia: 4, horario: '13:00', paciente: 4, medico: 16, status: 'confirmado', prioridade: 'normal' },
  { dia: 4, horario: '13:30', paciente: 5, medico: 17, status: 'aguardando', prioridade: 'idoso' },
  { dia: 5, horario: '16:30', paciente: 6, medico: 18, status: 'confirmado', prioridade: 'pcd' },
  { dia: 5, horario: '17:00', paciente: 7, medico: 19, status: 'aguardando', prioridade: 'gestante' }
];

const codigosConsultas = padraoConsultas.map((_, indice) => `VPL-A${String(indice + 1).padStart(3, '0')}`);

const montarConsultas = () => {
  const diasAgenda = [...diasUteisAnteriores(2), ...proximosDiasUteis(4)];

  return padraoConsultas.map((item, indice) => ({
    id: uuid(401 + indice),
    paciente_id: pacientes[item.paciente].id,
    medico_id: medicos[item.medico].id,
    codigo: codigosConsultas[indice],
    consulta_em: emManaus(diasAgenda[item.dia], item.horario),
    status: item.status,
    prioridade: item.prioridade,
    observacoes: `Consulta seed para testes de ${item.status} com prioridade ${item.prioridade}.`
  }));
};

const legado = {
  emailsUsuarios: ['admin@filajusta.local', 'recepcao@filajusta.local'],
  crmsMedicos: ['CRM-AM 12345', 'CRM-AM 67890'],
  cpfsPacientes: ['11144477735', '22255588846', '33366699957', '44477700068'],
  codigosConsultas: ['VPL-IDOS', 'VPL-PCD0', 'VPL-GEST', 'VPL-FALT']
};

module.exports = {
  async up(queryInterface) {
    const agora = new Date();
    const senhaHash = await bcrypt.hash('123456', 12);
    const consultas = montarConsultas();

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
    await queryInterface.bulkDelete('consultas', {
      codigo: { [Op.in]: [...codigosConsultas, ...legado.codigosConsultas] }
    });
    await queryInterface.bulkDelete('pacientes', {
      cpf: { [Op.in]: [...pacientes.map((paciente) => paciente.cpf), ...legado.cpfsPacientes] }
    });
    await queryInterface.bulkDelete('medicos', {
      crm: { [Op.in]: [...medicos.map((medico) => medico.crm), ...legado.crmsMedicos] }
    });
    await queryInterface.bulkDelete('especialidades', {
      nome: { [Op.in]: especialidades.map((especialidade) => especialidade.nome) }
    });
    await queryInterface.bulkDelete('usuarios', {
      email: { [Op.in]: ['admin@filajusta.com', 'recepcao@filajusta.com', ...legado.emailsUsuarios] }
    });
  }
};
