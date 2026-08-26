const somenteNumeros = (valor) => String(valor || '').replace(/\D/g, '');

const cpfValido = (valor) => {
  const cpf = somenteNumeros(valor);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base, fator) => {
    let total = 0;
    for (let indice = 0; indice < base.length; indice += 1) {
      total += Number(base[indice]) * (fator - indice);
    }
    const resto = (total * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const primeiroDigito = calcularDigito(cpf.slice(0, 9), 10);
  const segundoDigito = calcularDigito(cpf.slice(0, 10), 11);
  return primeiroDigito === Number(cpf[9]) && segundoDigito === Number(cpf[10]);
};

module.exports = { somenteNumeros, cpfValido };
