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
  status: "disponivel" | "em_consulta" | "ausente"
  criado_em?: string
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
  status: "aguardando" | "confirmado" | "atendido" | "cancelado" | "falta"
  prioridade: "normal" | "idoso" | "pcd" | "gestante"
  descricao_prioridade?: string | null
  documento_url?: string | null
  observacoes: any[]
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

function apiUrl(path: string) {
  return `${API_URL}${path}`
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("filajusta_token")
    if (token) headers.Authorization = `Bearer ${token}`
  }
  return headers
}

function mapPerfilToSetor(perfil: string): "recepcao" | "administracao" {
  return perfil === "admin" ? "administracao" : "recepcao"
}

function mapMedico(m: any): Medico {
  return {
    id: m.id,
    nome: m.nome,
    registro: m.crm || m.registro || "",
    especialidade_id: m.especialidade_id,
    especialidade_nome: m.especialidade?.nome || m.especialidade_nome || "",
    especialidade_emoji: m.especialidade?.emoji || m.especialidade_emoji || "",
    status: m.status || "disponivel",
    criado_em: m.criado_em || m.createdAt,
  }
}

function mapConsulta(c: any): Agendamento {
  return {
    id: c.id,
    codigo: c.codigo,
    paciente_id: c.paciente_id || c.paciente?.id || "",
    medico_id: c.medico_id || c.medico?.id || "",
    medico_nome: c.medico?.nome || c.medico_nome || "",
    especialidade: c.medico?.especialidade?.nome || c.especialidade || "",
    data_hora: c.consulta_em || c.data_hora,
    status: c.status,
    prioridade: c.prioridade || "normal",
    descricao_prioridade: c.descricao_prioridade || null,
    documento_url: c.documento_url || null,
    observacoes: c.observacoes || [],
    criado_em: c.criado_em || c.createdAt || "",
    paciente: c.paciente
      ? {
          id: c.paciente.id,
          nome: c.paciente.nome || c.paciente_nome,
          cpf: c.paciente.cpf || c.paciente_cpf,
          telefone: c.paciente.telefone || c.paciente_telefone,
          data_nascimento: c.paciente.data_nascimento || "",
          cartao_sus: c.paciente.cartao_sus,
        }
      : c.paciente_nome
        ? {
            id: c.paciente_id || "",
            nome: c.paciente_nome,
            cpf: c.paciente_cpf || "",
            telefone: c.paciente_telefone || "",
            data_nascimento: "",
          }
        : null,
    medico: c.medico ? mapMedico(c.medico) : null,
  }
}

// ─── AUTH ────────────────────────────────────────

export async function loginFuncionario(email: string, senha: string): Promise<AdminSession> {
  const res = await fetch(apiUrl("/api/autenticacao/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  })
  const json = await res.json()
  if (!json.sucesso) throw new Error(json.mensagem || "E-mail ou senha incorretos")

  const setor = mapPerfilToSetor(json.dados.usuario.perfil)
  const session: AdminSession = {
    id: json.dados.usuario.id,
    userId: json.dados.usuario.email,
    nome: json.dados.usuario.nome,
    email: json.dados.usuario.email,
    setor,
    cargo: setor === "administracao" ? "Administração" : "Recepção",
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("filajusta_token", json.dados.token)
    localStorage.setItem("filajusta_session", JSON.stringify(session))
    localStorage.setItem(
      "filajusta_login_attempts",
      JSON.stringify({ attempts: 0, lockout: null })
    )
  }

  return session
}

export async function checkEmailExists(_email: string): Promise<boolean> {
  return false
}

export async function resetPassword(
  _email: string,
  _newPassword: string
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Redefinição de senha não disponível pela API." }
}

// ─── ESPECIALIDADES ────────────────────────────────

export async function getEspecialidades(): Promise<Especialidade[]> {
  try {
    const res = await fetch(`${API_URL}/api/especialidades`)
    const json = await res.json()
    const lista = json.dados || json || []

    const emojiMap: Record<string, string> = {
      "Clinica Geral": "🩺",
      "Clínico Geral": "🩺",
      "Cardiologia": "❤️",
      "Neurologia": "🧠",
      "Pediatria": "👶",
      "Ortopedia": "🦴",
      "Oftalmologia": "👁️",
      "Dermatologia": "🧴",
      "Ginecologia": "🧑‍⚕️",
      "Odontologia": "🦷",
      "Pneumologia": "🫁",
      "Endocrinologia": "⚗️",
      "Psiquiatria": "🧠",
    }

    return lista.map((e: any) => ({
      id: e.id,
      nome: e.nome,
      emoji: emojiMap[e.nome] || "🏥",
    }))
  } catch (err) {
    console.error("Erro ao buscar especialidades:", err)
    return []
  }
}

// ─── MÉDICOS ─────────────────────────────────────

export async function getAllMedicos(): Promise<Medico[]> {
  const res = await fetch(apiUrl("/api/medicos"), {
    headers: authHeaders(),
  })
  const json = await res.json()
  const lista = json.dados?.medicos || json.dados || []
  return (Array.isArray(lista) ? lista : []).map(mapMedico)
}

export async function getMedicosByEspecialidade(especialidade_id: string): Promise<Medico[]> {
  const res = await fetch(
    apiUrl(`/api/medicos?especialidade_id=${encodeURIComponent(especialidade_id)}`)
  )
  const json = await res.json()
  const lista = json.dados?.medicos || json.dados || []
  return (Array.isArray(lista) ? lista : []).map(mapMedico)
}

export async function createMedico(data: {
  nome: string
  registro: string
  especialidade_id: string
  especialidade_nome?: string
  especialidade_emoji?: string
}): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(apiUrl("/api/admin/medicos"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      nome: data.nome,
      crm: data.registro,
      especialidade_id: data.especialidade_id,
    }),
  })
  const json = await res.json()
  return { success: json.sucesso, error: json.mensagem }
}

export async function updateMedico(
  id: string,
  data: {
    nome: string
    registro: string
    especialidade_id: string
    especialidade_nome?: string
    especialidade_emoji?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(apiUrl(`/api/admin/medicos/${id}`), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      nome: data.nome,
      crm: data.registro,
      especialidade_id: data.especialidade_id,
    }),
  })
  const json = await res.json()
  return { success: json.sucesso, error: json.mensagem }
}

export async function deleteMedico(id: string): Promise<boolean> {
  const res = await fetch(apiUrl(`/api/admin/medicos/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  })
  const json = await res.json()
  return json.sucesso
}

// ─── HORÁRIOS ─────────────────────────────────────

export async function getHorariosOcupados(medico_id: string, data: string): Promise<string[]> {
  const res = await fetch(
    apiUrl(`/api/horarios?medico_id=${encodeURIComponent(medico_id)}&data=${encodeURIComponent(data)}`)
  )
  const json = await res.json()
  return json.dados?.ocupados || []
}

export async function getHorariosDisponiveis(medico_id: string, data: string): Promise<string[]> {
  const res = await fetch(
    apiUrl(`/api/horarios?medico_id=${encodeURIComponent(medico_id)}&data=${encodeURIComponent(data)}`)
  )
  const json = await res.json()
  return json.dados?.disponiveis || []
}

// ─── AGENDAMENTOS — PÚBLICO ───────────────────────

export async function createAgendamento(data: {
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
  prioridade: string
  descricao_prioridade?: string | null
  documento_url?: string | null
}): Promise<{ success: boolean; codigo?: string; error?: string }> {
  const res = await fetch(apiUrl("/api/consultas"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      medico_id: data.medico_id,
      consulta_em: data.data_hora,
      paciente_nome: data.paciente.nome,
      paciente_cpf: data.paciente.cpf.replace(/\D/g, ""),
      paciente_telefone: data.paciente.telefone,
      paciente_email: data.paciente.email || null,
      prioridade: data.prioridade,
      descricao_prioridade: data.descricao_prioridade || null,
    }),
  })
  const json = await res.json()
  if (!json.sucesso) return { success: false, error: json.mensagem }
  return { success: true, codigo: json.dados.codigo }
}

export async function searchAgendamentos(query: string): Promise<Agendamento[]> {
  const term = query.trim().replace(/\D/g, "")
  const isCode = query.trim().toUpperCase().startsWith("VPL-")

  if (isCode) return []

  if (term.length === 11) {
    const res = await fetch(
      apiUrl(`/api/recepcao/consultas?cpf=${encodeURIComponent(term)}`),
      { headers: authHeaders() }
    )
    const json = await res.json()
    const lista = json.dados?.consultas || json.dados || []
    return (Array.isArray(lista) ? lista : []).map(mapConsulta)
  }

  return []
}

export async function searchByCodigoAndCpf(
  codigo: string,
  cpf: string
): Promise<Agendamento | null> {
  const cleanCpf = cpf.replace(/\D/g, "")
  const res = await fetch(
    apiUrl(`/api/consultas/codigo/${encodeURIComponent(codigo)}?cpf=${encodeURIComponent(cleanCpf)}`)
  )
  const json = await res.json()
  if (!json.sucesso) return null
  return mapConsulta(json.dados)
}

export async function getAgendamentoByCodigo(
  codigo: string,
  cpf?: string
): Promise<Agendamento | null> {
  const cleanCpf = cpf?.replace(/\D/g, "") || ""
  if (cleanCpf.length === 11) {
    return searchByCodigoAndCpf(codigo.trim(), cleanCpf)
  }
  const res = await fetch(
    apiUrl(`/api/consultas/codigo/${encodeURIComponent(codigo.trim().toUpperCase())}`)
  )
  const json = await res.json()
  if (!json.sucesso) return null
  return mapConsulta(json.dados)
}

export async function getAgendamentosByCpf(cpf: string): Promise<Agendamento[]> {
  const term = cpf.replace(/\D/g, "")
  if (term.length !== 11) return []

  const res = await fetch(apiUrl(`/api/consultas?cpf=${encodeURIComponent(term)}`))
  const json = await res.json()
  if (!json.sucesso) return []

  const dados = json.dados
  if (Array.isArray(dados)) return dados.map(mapConsulta)
  if (dados) return [mapConsulta(dados)]
  return []
}

export async function confirmarConsulta(codigo: string, cpf: string): Promise<boolean> {
  const cleanCpf = cpf.replace(/\D/g, "")
  const res = await fetch(
    apiUrl(`/api/consultas/codigo/${encodeURIComponent(codigo)}/confirmar?cpf=${encodeURIComponent(cleanCpf)}`),
    { method: "PATCH" }
  )
  const json = await res.json()
  return json.sucesso
}

export async function cancelarConsulta(codigo: string, cpf: string): Promise<boolean> {
  const cleanCpf = cpf.replace(/\D/g, "")
  const res = await fetch(
    apiUrl(`/api/consultas/codigo/${encodeURIComponent(codigo)}/cancelar?cpf=${encodeURIComponent(cleanCpf)}`),
    { method: "PATCH" }
  )
  const json = await res.json()
  return json.sucesso
}

// ─── AGENDAMENTOS — RECEPÇÃO ──────────────────────

export async function getAgendamentosByDate(data: string): Promise<Agendamento[]> {
  const res = await fetch(
    apiUrl(`/api/recepcao/agenda/dia?data=${encodeURIComponent(data)}`),
    { headers: authHeaders() }
  )
  const json = await res.json()
  // Backend returns { dados: { data: "...", consultas: [...] } }
  const consultas = json.dados?.consultas || json.dados || []
  return (Array.isArray(consultas) ? consultas : []).map(mapConsulta)
}

export async function getAllAgendamentos(): Promise<Agendamento[]> {
  const res = await fetch(apiUrl("/api/recepcao/consultas"), {
    headers: authHeaders(),
  })
  const json = await res.json()
  // Backend may return { dados: { consultas: [...] } } or { dados: [...] }
  const consultas = json.dados?.consultas || json.dados || []
  return (Array.isArray(consultas) ? consultas : []).map(mapConsulta)
}

export async function updateAgendamentoStatus(id: string, status: string): Promise<boolean> {
  const res = await fetch(apiUrl(`/api/recepcao/consultas/${id}/status`), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })
  const json = await res.json()
  return json.sucesso
}

// ─── FUNCIONÁRIOS ─────────────────────────────────

export async function getAllFuncionarios(): Promise<Funcionario[]> {
  const res = await fetch(apiUrl("/api/admin/usuarios"), {
    headers: authHeaders(),
  })
  const json = await res.json()
  const lista = json.dados?.usuarios || json.dados || []
  return (Array.isArray(lista) ? lista : []).map((u: any) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    cpf: u.cpf || "",
    setor: u.perfil === "admin" ? "administracao" : "recepcao",
    criado_em: u.criado_em || u.createdAt || "",
  }))
}

export async function deleteFuncionario(id: string): Promise<boolean> {
  const res = await fetch(apiUrl(`/api/admin/usuarios/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  })
  const json = await res.json()
  return json.sucesso
}

export async function createFuncionario(_data: {
  nome: string
  email: string
  cpf: string
  setor: string
  password_hash: string
}): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Cadastro de funcionário não disponível pela API." }
}

export async function upsertPaciente(_data: {
  nome: string
  cpf: string
  data_nascimento: string
  telefone: string
  cartao_sus?: string
}): Promise<{ id: string } | null> {
  return null
}