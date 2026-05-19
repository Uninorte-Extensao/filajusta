import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

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
  criado_em: string
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
  paciente?: Paciente
  medico?: Medico
}

export type Especialidade = {
  id: string
  nome: string
  emoji: string
}

// ─── FUNCIONÁRIOS ────────────────────────────────

export async function getAllFuncionarios(): Promise<Funcionario[]> {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("id, nome, email, cpf, setor, criado_em")
    .order("nome")
  if (error) {
    console.error("Error fetching funcionarios:", error.message, error.code, error.details)
    return []
  }
  return data || []
}

export async function deleteFuncionario(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("funcionarios")
    .delete()
    .eq("id", id)
  if (error) {
    console.error("Error deleting funcionario:", error)
    return false
  }
  return true
}

export async function createFuncionario(data: {
  nome: string
  email: string
  cpf: string
  setor: string
  password_hash: string
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("funcionarios").insert([{
    nome: data.nome,
    email: data.email.toLowerCase().trim(),
    cpf: data.cpf.replace(/\D/g, ""),
    setor: data.setor,
    password_hash: data.password_hash,
  }])
  if (error) {
    console.error("Error creating funcionario:", error)
    if (error.code === "23505") {
      return { success: false, error: "E-mail ou CPF já cadastrado." }
    }
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function loginFuncionario(
  email: string,
  password: string
): Promise<{ success: boolean; funcionario?: Funcionario; error?: string }> {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .eq("password_hash", password)
    .single()

  if (error || !data) {
    return { success: false, error: "E-mail ou senha incorretos" }
  }

  return { success: true, funcionario: data as Funcionario }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("id")
    .eq("email", email.toLowerCase())
    .single()
  if (error || !data) return false
  return true
}

export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("funcionarios")
    .update({ password_hash: newPassword })
    .eq("email", email.toLowerCase())
  if (error) {
    console.error("Error resetting password:", error)
    return { success: false, error: "Erro ao redefinir senha" }
  }
  return { success: true }
}

// ─── MÉDICOS ─────────────────────────────────────

export async function getEspecialidades(): Promise<Especialidade[]> {
  const { data, error } = await supabase
    .from("medicos")
    .select("especialidade_id, especialidade_nome, especialidade_emoji")
  if (error) {
    console.error("Error fetching especialidades:", error)
    return []
  }
  const uniqueMap = new Map<string, Especialidade>()
  data?.forEach((m) => {
    if (!uniqueMap.has(m.especialidade_id)) {
      uniqueMap.set(m.especialidade_id, {
        id: m.especialidade_id,
        nome: m.especialidade_nome,
        emoji: m.especialidade_emoji,
      })
    }
  })
  return Array.from(uniqueMap.values())
}

export async function getAllMedicos(): Promise<Medico[]> {
  const { data, error } = await supabase
    .from("medicos")
    .select("*")
    .order("especialidade_nome")
  if (error) {
    console.error("Error fetching medicos:", error)
    return []
  }
  return data || []
}

export async function createMedico(data: {
  nome: string
  registro: string
  especialidade_id: string
  especialidade_nome: string
  especialidade_emoji: string
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("medicos")
    .insert([{ ...data, status: "disponivel" }])
  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Já existe um médico com este registro." }
    }
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function updateMedico(
  id: string,
  data: {
    nome: string
    registro: string
    especialidade_id: string
    especialidade_nome: string
    especialidade_emoji: string
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("medicos")
    .update(data)
    .eq("id", id)
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function deleteMedico(id: string): Promise<boolean> {
  const { error } = await supabase.from("medicos").delete().eq("id", id)
  if (error) {
    console.error("Error deleting medico:", error)
    return false
  }
  return true
}

export async function getMedicosByEspecialidade(
  especialidade_id: string
): Promise<Medico[]> {
  const { data, error } = await supabase
    .from("medicos")
    .select("*")
    .eq("especialidade_id", especialidade_id)
    .eq("status", "disponivel")
    .order("nome")
  if (error) {
    console.error("Error fetching medicos by especialidade:", error)
    return []
  }
  return data || []
}

// ─── AGENDAMENTOS ─────────────────────────────────

export async function getAgendamentosByDate(
  date: string
): Promise<Agendamento[]> {
  const start = `${date}T00:00:00`
  const end = `${date}T23:59:59`
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*, paciente:pacientes(*), medico:medicos(*)")
    .gte("data_hora", start)
    .lte("data_hora", end)
    .order("data_hora", { ascending: true })
  if (error) {
    console.error("Error fetching agendamentos:", error)
    return []
  }
  return data || []
}

export async function searchAgendamentos(
  query: string
): Promise<Agendamento[]> {
  const term = query.trim().replace(/\D/g, "")
  const isCode = query.trim().toUpperCase().startsWith("VPL-")

  if (isCode) {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*, paciente:pacientes(*), medico:medicos(*)")
      .ilike("codigo", query.trim())
      .limit(1)
    if (error) return []
    return data || []
  }

  if (term.length === 11) {
    const { data: paciente } = await supabase
      .from("pacientes")
      .select("id")
      .eq("cpf", term)
      .single()
    if (!paciente) return []

    const { data, error } = await supabase
      .from("agendamentos")
      .select("*, paciente:pacientes(*), medico:medicos(*)")
      .eq("paciente_id", paciente.id)
      .order("data_hora", { ascending: false })
    if (error) return []
    return data || []
  }

  return []
}

export async function getAgendamentoByCodigo(
  codigo: string
): Promise<Agendamento | null> {
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*, paciente:pacientes(*), medico:medicos(*)")
    .eq("codigo", codigo.toUpperCase())
    .single()
  if (error) {
    console.error("Error fetching agendamento by codigo:", error)
    return null
  }
  return data
}

export async function getAgendamentosByCpf(cpf: string): Promise<Agendamento[]> {
  const cleanCpf = cpf.replace(/\D/g, "")
  const { data: paciente } = await supabase
    .from("pacientes")
    .select("id")
    .eq("cpf", cleanCpf)
    .single()
  if (!paciente) return []

  const { data, error } = await supabase
    .from("agendamentos")
    .select("*, paciente:pacientes(*), medico:medicos(*)")
    .eq("paciente_id", paciente.id)
    .order("data_hora", { ascending: false })
  if (error) return []
  return data || []
}

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "VPL-"
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createAgendamento(data: {
  codigo?: string
  paciente_id?: string
  paciente?: {
    nome: string
    cpf: string
    data_nascimento: string
    telefone: string
    cartao_sus?: string
  }
  medico_id: string
  medico_nome: string
  especialidade: string
  data_hora: string
  prioridade: string
  descricao_prioridade?: string | null
  documento_url?: string | null
}): Promise<{ success: boolean; codigo?: string; error?: string }> {
  let pacienteId = data.paciente_id
  if (!pacienteId && data.paciente) {
    const paciente = await upsertPaciente(data.paciente)
    if (!paciente) {
      return { success: false, error: "Erro ao cadastrar paciente" }
    }
    pacienteId = paciente.id
  }
  if (!pacienteId) {
    return { success: false, error: "Paciente não informado" }
  }

  let codigo = data.codigo || generateCode()
  let attempts = 0
  while (!data.codigo && attempts < 10) {
    const { data: existing } = await supabase
      .from("agendamentos")
      .select("codigo")
      .eq("codigo", codigo)
      .single()
    if (!existing) break
    codigo = generateCode()
    attempts++
  }

  const { error } = await supabase.from("agendamentos").insert([{
    codigo,
    paciente_id: pacienteId,
    medico_id: data.medico_id,
    medico_nome: data.medico_nome,
    especialidade: data.especialidade,
    data_hora: data.data_hora,
    prioridade: data.prioridade,
    descricao_prioridade: data.descricao_prioridade ?? null,
    documento_url: data.documento_url ?? null,
    status: "aguardando",
    observacoes: [],
  }])
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, codigo }
}

export async function updateAgendamentoStatus(
  id: string,
  status: string
): Promise<boolean> {
  const { error } = await supabase
    .from("agendamentos")
    .update({ status })
    .eq("id", id)
  if (error) {
    console.error("Error updating status:", error)
    return false
  }
  return true
}

export async function upsertPaciente(data: {
  nome: string
  cpf: string
  data_nascimento: string
  telefone: string
  cartao_sus?: string
}): Promise<{ id: string } | null> {
  const cpfClean = data.cpf.replace(/\D/g, "")

  const { data: existing } = await supabase
    .from("pacientes")
    .select("id")
    .eq("cpf", cpfClean)
    .single()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from("pacientes")
    .insert([{ ...data, cpf: cpfClean }])
    .select("id")
    .single()

  if (error) {
    console.error("Error creating paciente:", error)
    return null
  }
  return created
}

export async function getHorariosOcupados(
  medicoId: string,
  date: string
): Promise<string[]> {
  const start = `${date}T00:00:00`
  const end = `${date}T23:59:59`
  const { data, error } = await supabase
    .from("agendamentos")
    .select("data_hora")
    .eq("medico_id", medicoId)
    .gte("data_hora", start)
    .lte("data_hora", end)
    .in("status", ["aguardando", "confirmado"])
  if (error) return []
  return (data || []).map((a) => a.data_hora)
}
