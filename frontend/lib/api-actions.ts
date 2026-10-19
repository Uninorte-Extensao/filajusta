// ─── TYPES ───────────────────────────────────────

export type Funcionario = {
  id: string
  nome: string
  email: string
  cpf: string
  setor: "recepcao" | "administracao"
  criado_em: string
}

export type Medico = {
  id: string
  nome: string
  registro: string
  especialidade_id: string
  especialidade_nome: string
  especialidade_emoji: string
  telefone?: string | null
  email?: string | null
  ativo?: boolean
  status: "disponivel" | "em_consulta" | "ausente"
  criado_em?: string
  especialidade?: {
    id: string
    nome: string
    emoji?: string
  } | null
}

export type Paciente = {
  id: string
  nome: string
  cpf: string
  data_nascimento: string
  telefone: string
  cartao_sus?: string
}

export type Agendamento = {
  id: string
  codigo: string
  paciente_id: string
  medico_id: string
  medico_nome: string
  especialidade: string
  data_hora: string
  status:
    | "aguardando"
    | "confirmado"
    | "atendido"
    | "cancelado"
    | "falta"
  prioridade: "normal" | "idoso" | "pcd" | "gestante"
  descricao_prioridade?: string | null
  documento_url?: string | null
  observacoes: string | null
  criado_em: string
  paciente?: Paciente | null
  medico?: Medico | null
}

export type Especialidade = {
  id: string
  nome: string
  emoji: string
}

export type AdminSession = {
  id: string
  userId: string
  nome: string
  email: string
  setor: "recepcao" | "administracao"
  cargo: string
  expiresAt: number
}

// ─── CONFIGURAÇÃO DA API ─────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

function apiUrl(path: string) {
  return `${API_URL}${path}`
}

// ─── AUTENTICAÇÃO ────────────────────────────────

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("filajusta_token")

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return headers
}

function mapPerfilToSetor(
  perfil: string
): "recepcao" | "administracao" {
  return perfil === "admin"
    ? "administracao"
    : "recepcao"
}

// ─── MAPPERS ─────────────────────────────────────

function mapMedico(m: any): Medico {
  return {
    id: m.id || "",
    nome: m.nome || "",
    registro: m.crm || m.registro || "",
    especialidade_id:
      m.especialidade_id ||
      m.especialidade?.id ||
      "",
    especialidade_nome:
      m.especialidade?.nome ||
      m.especialidade_nome ||
      "",
    especialidade_emoji:
      m.especialidade?.emoji ||
      m.especialidade_emoji ||
      "",
    telefone:
      m.telefone ??
      null,
    email:
      m.email ??
      null,
    ativo:
      typeof m.ativo === "boolean"
        ? m.ativo
        : true,
    status:
      m.status ||
      "disponivel",
    criado_em:
      m.criado_em ||
      m.createdAt ||
      "",
    especialidade: m.especialidade
      ? {
          id: m.especialidade.id || "",
          nome: m.especialidade.nome || "",
          emoji: m.especialidade.emoji || "",
        }
      : null,
  }
}

function mapConsulta(c: any): Agendamento {
  const documentos =
    Array.isArray(c.documentos)
      ? c.documentos
      : []

  const primeiroDocumento =
    documentos.length > 0
      ? documentos[0]
      : null

  return {
    id: c.id || "",
    codigo: c.codigo || "",

    paciente_id:
      c.paciente_id ||
      c.paciente?.id ||
      "",

    medico_id:
      c.medico_id ||
      c.medico?.id ||
      "",

    medico_nome:
      c.medico?.nome ||
      c.medico_nome ||
      "",

    especialidade:
      c.medico?.especialidade?.nome ||
      c.medico?.especialidade_nome ||
      c.especialidade ||
      "",

    data_hora:
      c.consulta_em ||
      c.data_hora ||
      "",

    status:
      c.status ||
      "aguardando",

    prioridade:
      c.prioridade ||
      "normal",

    descricao_prioridade:
      c.descricao_prioridade ||
      null,

    documento_url:
      c.documento_url ||
      primeiroDocumento?.url ||
      primeiroDocumento?.arquivo_url ||
      primeiroDocumento?.caminho ||
      null,

    observacoes:
      c.observacoes ||
      null,

    criado_em:
      c.criado_em ||
      c.createdAt ||
      "",

    paciente: c.paciente
      ? {
          id: c.paciente.id || "",
          nome:
            c.paciente.nome ||
            "",
          cpf:
            c.paciente.cpf ||
            "",
          telefone:
            c.paciente.telefone ||
            "",
          data_nascimento:
            c.paciente.data_nascimento ||
            "",
          cartao_sus:
            c.paciente.cartao_sus,
        }
      : c.paciente_nome
        ? {
            id:
              c.paciente_id ||
              "",
            nome:
              c.paciente_nome ||
              "",
            cpf:
              c.paciente_cpf ||
              "",
            telefone:
              c.paciente_telefone ||
              "",
            data_nascimento:
              c.paciente_data_nascimento ||
              "",
            cartao_sus:
              c.paciente_cartao_sus,
          }
        : null,

    medico: c.medico
      ? mapMedico(c.medico)
      : null,
  }
}

// ─── AUTH ────────────────────────────────────────

export async function loginFuncionario(
  email: string,
  senha: string
): Promise<AdminSession> {
  const res = await fetch(
    apiUrl("/api/autenticacao/login"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        senha,
      }),
    }
  )

  const json = await res.json()

  if (!res.ok || !json.sucesso) {
    throw new Error(
      json.mensagem ||
        "E-mail ou senha incorretos"
    )
  }

  const usuario =
    json.dados?.usuario

  const token =
    json.dados?.token

  const setor =
    mapPerfilToSetor(
      usuario?.perfil || ""
    )

  const session: AdminSession = {
    id: usuario?.id || "",
    userId: usuario?.id || usuario?.email || "",
    nome: usuario?.nome || "",
    email: usuario?.email || "",
    setor,
    cargo:
      setor === "administracao"
        ? "Administração"
        : "Recepção",
    expiresAt:
      Date.now() +
      8 * 60 * 60 * 1000,
  }

  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(
        "filajusta_token",
        token
      )
    }

    localStorage.setItem(
      "filajusta_session",
      JSON.stringify(session)
    )

    localStorage.setItem(
      "filajusta_login_attempts",
      JSON.stringify({
        attempts: 0,
        lockout: null,
      })
    )
  }

  return session
}

export async function checkEmailExists(
  _email: string
): Promise<boolean> {
  return false
}

export async function resetPassword(
  _email: string,
  _newPassword: string
): Promise<{
  success: boolean
  error?: string
}> {
  return {
    success: false,
    error:
      "Redefinição de senha não disponível pela API.",
  }
}
export async function solicitarRecuperacaoSenha(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(
    apiUrl("/api/autenticacao/recuperacao/solicitar"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  )

  const json = await res.json()

  if (!res.ok || !json.sucesso) {
    return {
      success: false,
      error:
        json.mensagem ||
        "Não foi possível solicitar a recuperação",
    }
  }

  return { success: true }
}

export async function validarCodigoRecuperacao(
  email: string,
  codigo: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(
    apiUrl("/api/autenticacao/recuperacao/validar"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, codigo }),
    }
  )

  const json = await res.json()

  if (!res.ok || !json.sucesso) {
    return {
      success: false,
      error:
        json.mensagem ||
        "Código inválido ou expirado",
    }
  }

  return { success: true }
}

export async function redefinirSenha(
  email: string,
  codigo: string,
  novaSenha: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(
    apiUrl("/api/autenticacao/recuperacao/redefinir"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        codigo,
        novaSenha,
      }),
    }
  )

  const json = await res.json()

  if (!res.ok || !json.sucesso) {
    return {
      success: false,
      error:
        json.mensagem ||
        "Não foi possível redefinir a senha",
    }
  }

  return { success: true }
}

// ─── ESPECIALIDADES ─────────────────────────────

export async function getEspecialidades(): Promise<
  Especialidade[]
> {
  try {
    const res = await fetch(
      apiUrl("/api/especialidades")
    )

    const json = await res.json()

    if (!res.ok || !json.sucesso) {
      return []
    }

    const raw =
      json.dados || []

    const lista =
      Array.isArray(raw)
        ? raw
        : []

    const emojiMap: Record<
      string,
      string
    > = {
      "Clinica Geral": "🩺",
      "Clínica Geral": "🩺",
      "Clínico Geral": "🩺",
      Cardiologia: "❤️",
      Neurologia: "🧠",
      Pediatria: "👶",
      Ortopedia: "🦴",
      Oftalmologia: "👁️",
      Dermatologia: "🧴",
      Ginecologia: "🧑‍⚕️",
      Odontologia: "🦷",
      Pneumologia: "🫁",
      Endocrinologia: "⚗️",
      Psiquiatria: "🧠",
    }

    return lista.map(
      (e: any) => ({
        id: e.id || "",
        nome: e.nome || "",
        emoji:
          e.emoji ||
          emojiMap[e.nome] ||
          "🏥",
      })
    )
  } catch (error) {
    console.error(
      "Erro ao buscar especialidades:",
      error
    )

    return []
  }
}

// ─── MÉDICOS ────────────────────────────────────

export async function getAllMedicos(): Promise<
  Medico[]
> {
  try {
    const res = await fetch(
      apiUrl("/api/admin/medicos"),
      {
        headers: authHeaders(),
      }
    )

    const json = await res.json()

    if (!res.ok || !json.sucesso) {
      return []
    }

    const lista =
      json.dados?.medicos ||
      json.dados ||
      []

    return (
      Array.isArray(lista)
        ? lista
        : []
    ).map(mapMedico)
  } catch (error) {
    console.error(
      "Erro ao buscar médicos:",
      error
    )

    return []
  }
}

export async function getMedicosByEspecialidade(
  especialidade_id: string
): Promise<Medico[]> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/medicos?especialidade_id=${encodeURIComponent(
          especialidade_id
        )}`
      )
    )

    const json = await res.json()

    if (!res.ok || !json.sucesso) {
      return []
    }

    const lista =
      json.dados?.medicos ||
      json.dados ||
      []

    return (
      Array.isArray(lista)
        ? lista
        : []
    ).map(mapMedico)
  } catch (error) {
    console.error(
      "Erro ao buscar médicos por especialidade:",
      error
    )

    return []
  }
}

export async function createMedico(
  data: {
    nome: string
    registro: string
    especialidade_id: string
    telefone?: string | null
    email?: string | null
    ativo?: boolean
  }
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const res = await fetch(
      apiUrl("/api/admin/medicos"),
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          nome: data.nome.trim(),
          crm: data.registro.trim(),
          especialidade_id:
            data.especialidade_id,
          telefone:
            data.telefone?.trim() || null,
          email:
            data.email?.trim() || null,
          ativo:
            data.ativo ?? true,
        }),
      }
    )

    const json = await res.json()

    return {
      success:
        res.ok &&
        json.sucesso === true,
      error:
        json.sucesso
          ? undefined
          : json.mensagem ||
            "Não foi possível criar o médico.",
    }
  } catch (error) {
    console.error(
      "Erro ao criar médico:",
      error
    )

    return {
      success: false,
      error:
        "Erro ao conectar com a API.",
    }
  }
}

export async function updateMedico(
  id: string,
  data: {
    nome?: string
    registro?: string
    especialidade_id?: string
    telefone?: string | null
    email?: string | null
    ativo?: boolean
  }
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const body: Record<string, unknown> = {}

    if (data.nome !== undefined) {
      body.nome = data.nome.trim()
    }

    if (data.registro !== undefined) {
      body.crm = data.registro.trim()
    }

    if (data.especialidade_id !== undefined) {
      body.especialidade_id =
        data.especialidade_id
    }

    if (data.telefone !== undefined) {
      body.telefone =
        data.telefone?.trim() || null
    }

    if (data.email !== undefined) {
      body.email =
        data.email?.trim() || null
    }

    if (data.ativo !== undefined) {
      body.ativo = data.ativo
    }

    const res = await fetch(
      apiUrl(
        `/api/admin/medicos/${encodeURIComponent(
          id
        )}`
      ),
      {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(body),
      }
    )

    const json = await res.json()

    return {
      success:
        res.ok &&
        json.sucesso === true,
      error:
        json.sucesso
          ? undefined
          : json.mensagem ||
            "Não foi possível atualizar o médico.",
    }
  } catch (error) {
    console.error(
      "Erro ao atualizar médico:",
      error
    )

    return {
      success: false,
      error:
        "Erro ao conectar com a API.",
    }
  }
}

export async function deleteMedico(
  id: string
): Promise<boolean> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/admin/medicos/${encodeURIComponent(
          id
        )}`
      ),
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    )

    const json = await res.json()

    return (
      res.ok &&
      json.sucesso === true
    )
  } catch (error) {
    console.error(
      "Erro ao excluir médico:",
      error
    )

    return false
  }
}

// ─── HORÁRIOS ───────────────────────────────────

export async function getHorariosOcupados(
  medico_id: string,
  data: string
): Promise<string[]> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/horarios?medico_id=${encodeURIComponent(
          medico_id
        )}&data=${encodeURIComponent(
          data
        )}`
      )
    )

    const json = await res.json()

    if (!res.ok || !json.sucesso) {
      return []
    }

    return (
      json.dados?.ocupados ||
      []
    )
  } catch (error) {
    console.error(
      "Erro ao buscar horários ocupados:",
      error
    )

    return []
  }
}

export async function getHorariosDisponiveis(
  medico_id: string,
  data: string
): Promise<string[]> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/horarios?medico_id=${encodeURIComponent(
          medico_id
        )}&data=${encodeURIComponent(
          data
        )}`
      )
    )

    const json = await res.json()

    if (!res.ok || !json.sucesso) {
      return []
    }

    return (
      json.dados?.disponiveis ||
      []
    )
  } catch (error) {
    console.error(
      "Erro ao buscar horários disponíveis:",
      error
    )

    return []
  }
}

// ─── AGENDAMENTOS — PÚBLICO ─────────────────────

export async function createAgendamento(
  data: {
    paciente: {
      nome: string
      cpf: string
      data_nascimento?: string
      telefone: string
      email?: string | null
      cartao_sus?: string
    }
    medico_id: string
    medico_nome?: string
    especialidade?: string
    data_hora: string
    prioridade:
      | "normal"
      | "idoso"
      | "pcd"
      | "gestante"
    descricao_prioridade?: string | null
    documento_url?: string | null
  }
): Promise<{
  success: boolean
  codigo?: string
  error?: string
}> {
  try {
    const res = await fetch(
      apiUrl("/api/consultas"),
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          medico_id:
            data.medico_id,

          consulta_em:
            data.data_hora,

          paciente_nome:
            data.paciente.nome,

          paciente_cpf:
            data.paciente.cpf.replace(
              /\D/g,
              ""
            ),

          paciente_telefone:
            data.paciente.telefone,

          paciente_email:
            data.paciente.email ||
            null,

          prioridade:
            data.prioridade,

          descricao_prioridade:
            data.descricao_prioridade ||
            null,
        }),
      }
    )

    const json = await res.json()

    if (!res.ok || !json.sucesso) {
      return {
        success: false,
        error:
          json.mensagem ||
          "Não foi possível agendar a consulta.",
      }
    }

    return {
      success: true,
      codigo:
        json.dados?.codigo,
    }
  } catch (error) {
    console.error(
      "Erro ao criar agendamento:",
      error
    )

    return {
      success: false,
      error:
        "Erro ao conectar com a API.",
    }
  }
}

// ─── BUSCA GLOBAL ───────────────────────────────

export async function searchAgendamentos(
  query: string
): Promise<Agendamento[]> {
  const valor =
    query.trim()

  const term =
    valor.replace(/\D/g, "")

  const isCode =
    valor
      .toUpperCase()
      .startsWith("VPL-")

  if (isCode) {
    const agendamento =
      await getAgendamentoByCodigo(
        valor
      )

    return agendamento
      ? [agendamento]
      : []
  }

  if (term.length === 11) {
    return getAgendamentosByCpf(
      term
    )
  }

  return []
}

// ─── BUSCA CÓDIGO + CPF ─────────────────────────

export async function searchByCodigoAndCpf(
  codigo: string,
  cpf: string
): Promise<Agendamento | null> {
  try {
    const cleanCpf =
      cpf.replace(/\D/g, "")

    const res = await fetch(
      apiUrl(
        `/api/consultas/codigo/${encodeURIComponent(
          codigo.trim().toUpperCase()
        )}?cpf=${encodeURIComponent(
          cleanCpf
        )}`
      )
    )

    const json =
      await res.json()

    if (
      !res.ok ||
      !json.sucesso ||
      !json.dados
    ) {
      return null
    }

    return mapConsulta(
      json.dados
    )
  } catch (error) {
    console.error(
      "Erro ao buscar consulta:",
      error
    )

    return null
  }
}

// ─── CONSULTA POR CÓDIGO ────────────────────────

export async function getAgendamentoByCodigo(
  codigo: string,
  cpf?: string
): Promise<Agendamento | null> {
  const cleanCpf =
    cpf?.replace(/\D/g, "") ||
    ""

  if (cleanCpf.length === 11) {
    return searchByCodigoAndCpf(
      codigo,
      cleanCpf
    )
  }

  try {
    const res = await fetch(
      apiUrl(
        `/api/consultas/codigo/${encodeURIComponent(
          codigo.trim().toUpperCase()
        )}`
      )
    )

    const json =
      await res.json()

    if (
      !res.ok ||
      !json.sucesso ||
      !json.dados
    ) {
      return null
    }

    return mapConsulta(
      json.dados
    )
  } catch (error) {
    console.error(
      "Erro ao buscar consulta:",
      error
    )

    return null
  }
}

// ─── CONSULTAS POR CPF ─────────────────────────

export async function getAgendamentosByCpf(
  cpf: string
): Promise<Agendamento[]> {
  const term =
    cpf.replace(/\D/g, "")

  if (term.length !== 11) {
    return []
  }

  try {
    const res = await fetch(
      apiUrl(
        `/api/recepcao/consultas?cpf=${encodeURIComponent(
          term
        )}`
      ),
      {
        headers: authHeaders(),
      }
    )

    const json =
      await res.json()

    if (
      !res.ok ||
      !json.sucesso
    ) {
      return []
    }

    const lista =
      json.dados?.consultas ||
      json.dados ||
      []

    return (
      Array.isArray(lista)
        ? lista
        : []
    ).map(mapConsulta)
  } catch (error) {
    console.error(
      "Erro na busca de consultas por CPF:",
      error
    )

    return []
  }
}

// ─── CONFIRMAR CONSULTA ─────────────────────────

export async function confirmarConsulta(
  codigo: string,
  cpf: string
): Promise<boolean> {
  try {
    const cleanCpf =
      cpf.replace(/\D/g, "")

    const res = await fetch(
      apiUrl(
        `/api/consultas/codigo/${encodeURIComponent(
          codigo.trim().toUpperCase()
        )}/confirmar?cpf=${encodeURIComponent(
          cleanCpf
        )}`
      ),
      {
        method: "PATCH",
      }
    )

    const json =
      await res.json()

    return (
      res.ok &&
      json.sucesso === true
    )
  } catch (error) {
    console.error(
      "Erro ao confirmar consulta:",
      error
    )

    return false
  }
}

// ─── CANCELAR CONSULTA ─────────────────────────

export async function cancelarConsulta(
  codigo: string,
  cpf: string
): Promise<boolean> {
  try {
    const cleanCpf =
      cpf.replace(/\D/g, "")

    const res = await fetch(
      apiUrl(
        `/api/consultas/codigo/${encodeURIComponent(
          codigo.trim().toUpperCase()
        )}/cancelar?cpf=${encodeURIComponent(
          cleanCpf
        )}`
      ),
      {
        method: "PATCH",
      }
    )

    const json =
      await res.json()

    return (
      res.ok &&
      json.sucesso === true
    )
  } catch (error) {
    console.error(
      "Erro ao cancelar consulta:",
      error
    )

    return false
  }
}

// ─── RECEPÇÃO ───────────────────────────────────

export async function getAgendamentosByDate(
  data: string
): Promise<Agendamento[]> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/recepcao/agenda/dia?data=${encodeURIComponent(
          data
        )}`
      ),
      {
        headers: authHeaders(),
      }
    )

    const json =
      await res.json()

    if (
      !res.ok ||
      !json.sucesso
    ) {
      return []
    }

    const consultas =
      json.dados?.consultas ||
      json.dados ||
      []

    return (
      Array.isArray(consultas)
        ? consultas
        : []
    ).map(mapConsulta)
  } catch (error) {
    console.error(
      "Erro ao buscar agenda:",
      error
    )

    return []
  }
}

export async function getAllAgendamentos(): Promise<
  Agendamento[]
> {
  try {
    const res = await fetch(
      apiUrl(
        "/api/recepcao/consultas"
      ),
      {
        headers: authHeaders(),
      }
    )

    const json =
      await res.json()

    if (
      !res.ok ||
      !json.sucesso
    ) {
      return []
    }

    const consultas =
      json.dados?.consultas ||
      json.dados ||
      []

    return (
      Array.isArray(consultas)
        ? consultas
        : []
    ).map(mapConsulta)
  } catch (error) {
    console.error(
      "Erro ao buscar agendamentos:",
      error
    )

    return []
  }
}

export async function updateAgendamentoStatus(
  id: string,
  status:
    | "aguardando"
    | "confirmado"
    | "atendido"
    | "cancelado"
    | "falta"
): Promise<boolean> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/recepcao/consultas/${encodeURIComponent(
          id
        )}/status`
      ),
      {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          status,
        }),
      }
    )

    const json =
      await res.json()

    return (
      res.ok &&
      json.sucesso === true
    )
  } catch (error) {
    console.error(
      "Erro ao atualizar status:",
      error
    )

    return false
  }
}

// ─── FUNCIONÁRIOS ──────────────────────────────

export async function getAllFuncionarios(): Promise<
  Funcionario[]
> {
  try {
    const res = await fetch(
      apiUrl(
        "/api/admin/usuarios"
      ),
      {
        headers: authHeaders(),
      }
    )

    const json =
      await res.json()

    if (
      !res.ok ||
      !json.sucesso
    ) {
      return []
    }

    const lista =
      json.dados?.usuarios ||
      json.dados ||
      []

    return (
      Array.isArray(lista)
        ? lista
        : []
    ).map((u: any) => ({
      id: u.id || "",
      nome: u.nome || "",
      email: u.email || "",
      cpf: u.cpf || "",
      setor:
        u.perfil === "admin"
          ? "administracao"
          : "recepcao",
      criado_em:
        u.criado_em ||
        u.createdAt ||
        "",
    }))
  } catch (error) {
    console.error(
      "Erro ao buscar funcionários:",
      error
    )

    return []
  }
}

export async function deleteFuncionario(
  id: string
): Promise<boolean> {
  try {
    const res = await fetch(
      apiUrl(
        `/api/admin/usuarios/${encodeURIComponent(
          id
        )}`
      ),
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    )

    const json =
      await res.json()

    return (
      res.ok &&
      json.sucesso === true
    )
  } catch (error) {
    console.error(
      "Erro ao excluir funcionário:",
      error
    )

    return false
  }
}

export async function createFuncionario(
  data: {
    nome: string
    email: string
    cpf: string
    setor: string
    password_hash: string
  }
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const res = await fetch(
      apiUrl(
        "/api/admin/usuarios"
      ),
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          cpf: data.cpf.replace(
            /\D/g,
            ""
          ),
          perfil:
            data.setor ===
            "administracao"
              ? "admin"
              : "recepcao",
          senha:
            data.password_hash,
        }),
      }
    )

    const json =
      await res.json()

    return {
      success:
        res.ok &&
        json.sucesso === true,
      error:
        json.sucesso
          ? undefined
          : json.mensagem ||
            "Não foi possível cadastrar o funcionário.",
    }
  } catch (error) {
    console.error(
      "Erro ao criar funcionário:",
      error
    )

    return {
      success: false,
      error:
        "Erro ao conectar com a API.",
    }
  }
}

// ─── PACIENTES ──────────────────────────────────

export async function upsertPaciente(
  data: {
    nome: string
    cpf: string
    data_nascimento: string
    telefone: string
    cartao_sus?: string
  }
): Promise<{
  id: string
} | null> {
  try {
    const res = await fetch(
      apiUrl("/api/pacientes"),
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          nome: data.nome,
          cpf: data.cpf.replace(
            /\D/g,
            ""
          ),
          data_nascimento:
            data.data_nascimento,
          telefone:
            data.telefone,
          cartao_sus:
            data.cartao_sus ||
            null,
        }),
      }
    )

    const json =
      await res.json()

    if (
      !res.ok ||
      !json.sucesso
    ) {
      return null
    }

    return {
      id:
        json.dados?.id ||
        json.dados?.paciente?.id ||
        "",
    }
  } catch (error) {
    console.error(
      "Erro ao cadastrar paciente:",
      error
    )

    return null
  }
}