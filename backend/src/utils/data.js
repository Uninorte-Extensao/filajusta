const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const ambiente = require('../config/ambiente');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(ambiente.fusoHorario);

const FUSO_HORARIO = ambiente.fusoHorario;

const possuiFusoExplicito = (valor) => typeof valor === 'string' && /([zZ]|[+-]\d{2}:?\d{2})$/.test(valor);
const somenteData = (valor) => typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor);

const paraDataLocal = (valor) => {
  if (somenteData(valor)) return dayjs.tz(`${valor}T00:00:00`, FUSO_HORARIO);
  if (valor instanceof Date || possuiFusoExplicito(valor)) return dayjs(valor).tz(FUSO_HORARIO);
  return dayjs.tz(valor, FUSO_HORARIO);
};

const inicioDoDia = (valor) => paraDataLocal(valor).startOf('day').toDate();
const fimDoDia = (valor) => paraDataLocal(valor).endOf('day').toDate();
const formatarDataManaus = (valor) => paraDataLocal(valor).format();

const diaUtil = (valor) => {
  const diaSemana = paraDataLocal(valor).day();
  return diaSemana >= 1 && diaSemana <= 5;
};

const horarioComercial = (valor) => {
  const data = paraDataLocal(valor);
  const hora = data.hour();
  const minuto = data.minute();
  const dentroDoHorario = hora > 7 && hora < 17;
  const inicioPermitido = hora === 7 && [0, 30].includes(minuto);
  const fimPermitido = hora === 17 && minuto === 0;
  return diaUtil(valor) && (dentroDoHorario || inicioPermitido || fimPermitido) && [0, 30].includes(minuto) && data.second() === 0;
};

module.exports = {
  dayjs,
  FUSO_HORARIO,
  paraDataLocal,
  inicioDoDia,
  fimDoDia,
  formatarDataManaus,
  diaUtil,
  horarioComercial
};
