a// Script para popular a base de dados Supabase com dados iniciais
// Execute com: node --env-file-if-exists=/vercel/share/.env.project scripts/seed-database.js

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: Variaveis de ambiente Supabase nao configuradas")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Dados dos medicos por especialidade
const medicos = [
  // Cardiologia
  { nome: "Dr. Carlos Alberto Silva", registro: "CRM-12345", especialidade_id: "cardiologia", especialidade_nome: "Cardiologia", especialidade_emoji: "❤️", status: "disponivel" },
  { nome: "Dra. Ana Paula Rodrigues", registro: "CRM-12346", especialidade_id: "cardiologia", especialidade_nome: "Cardiologia", especialidade_emoji: "❤️", status: "disponivel" },
  
  // Dermatologia
  { nome: "Dra. Beatriz Santos", registro: "CRM-22345", especialidade_id: "dermatologia", especialidade_nome: "Dermatologia", especialidade_emoji: "🩺", status: "disponivel" },
  { nome: "Dr. Fernando Costa", registro: "CRM-22346", especialidade_id: "dermatologia", especialidade_nome: "Dermatologia", especialidade_emoji: "🩺", status: "disponivel" },
  
  // Ginecologia
  { nome: "Dra. Marina Oliveira", registro: "CRM-32345", especialidade_id: "ginecologia", especialidade_nome: "Ginecologia", especialidade_emoji: "👩‍⚕️", status: "disponivel" },
  { nome: "Dra. Camila Ferreira", registro: "CRM-32346", especialidade_id: "ginecologia", especialidade_nome: "Ginecologia", especialidade_emoji: "👩‍⚕️", status: "disponivel" },
  
  // Ortopedia
  { nome: "Dr. Ricardo Almeida", registro: "CRM-42345", especialidade_id: "ortopedia", especialidade_nome: "Ortopedia", especialidade_emoji: "🦴", status: "disponivel" },
  { nome: "Dr. Paulo Mendes", registro: "CRM-42346", especialidade_id: "ortopedia", especialidade_nome: "Ortopedia", especialidade_emoji: "🦴", status: "disponivel" },
  
  // Pediatria
  { nome: "Dra. Julia Martins", registro: "CRM-52345", especialidade_id: "pediatria", especialidade_nome: "Pediatria", especialidade_emoji: "👶", status: "disponivel" },
  { nome: "Dr. Gabriel Lima", registro: "CRM-52346", especialidade_id: "pediatria", especialidade_nome: "Pediatria", especialidade_emoji: "👶", status: "disponivel" },
  
  // Oftalmologia
  { nome: "Dr. Roberto Vieira", registro: "CRM-62345", especialidade_id: "oftalmologia", especialidade_nome: "Oftalmologia", especialidade_emoji: "👁️", status: "disponivel" },
  { nome: "Dra. Patricia Souza", registro: "CRM-62346", especialidade_id: "oftalmologia", especialidade_nome: "Oftalmologia", especialidade_emoji: "👁️", status: "disponivel" },
  
  // Neurologia
  { nome: "Dr. Marcelo Barbosa", registro: "CRM-72345", especialidade_id: "neurologia", especialidade_nome: "Neurologia", especialidade_emoji: "🧠", status: "disponivel" },
  { nome: "Dra. Luciana Costa", registro: "CRM-72346", especialidade_id: "neurologia", especialidade_nome: "Neurologia", especialidade_emoji: "🧠", status: "disponivel" },
  
  // Clinico Geral
  { nome: "Dr. Andre Nascimento", registro: "CRM-82345", especialidade_id: "clinico_geral", especialidade_nome: "Clinico Geral", especialidade_emoji: "🏥", status: "disponivel" },
  { nome: "Dra. Fernanda Araujo", registro: "CRM-82346", especialidade_id: "clinico_geral", especialidade_nome: "Clinico Geral", especialidade_emoji: "🏥", status: "disponivel" },
]

// Funcionario de recepcao padrao
const funcionarios = [
  { nome: "Maria Silva", email: "recepcao@vidaplena.com", cpf: "12345678901", setor: "recepcao", password_hash: "123456" },
  { nome: "Joao Santos", email: "admin@vidaplena.com", cpf: "98765432101", setor: "administracao", password_hash: "admin123" },
]

// Pacientes de exemplo
const pacientes = [
  { nome: "Jose da Silva", cpf: "11122233344", data_nascimento: "1955-03-15", telefone: "11999998888", cartao_sus: "123456789012345" },
  { nome: "Maria Oliveira", cpf: "22233344455", data_nascimento: "1988-07-22", telefone: "11988887777", cartao_sus: "234567890123456" },
  { nome: "Pedro Santos", cpf: "33344455566", data_nascimento: "1965-01-10", telefone: "11977776666", cartao_sus: "345678901234567" },
  { nome: "Ana Costa", cpf: "44455566677", data_nascimento: "1992-11-05", telefone: "11966665555", cartao_sus: "456789012345678" },
]

async function seed() {
  console.log("Iniciando seed do banco de dados...")

  // 1. Inserir medicos (primeiro verifica se ja existem)
  console.log("Inserindo medicos...")
  const { data: existingMedicos } = await supabase.from("medicos").select("registro")
  const existingRegistros = existingMedicos?.map(m => m.registro) || []
  const newMedicos = medicos.filter(m => !existingRegistros.includes(m.registro))
  
  if (newMedicos.length > 0) {
    const { error: medicosError } = await supabase
      .from("medicos")
      .insert(newMedicos)

    if (medicosError) {
      console.error("Erro ao inserir medicos:", medicosError)
    } else {
      console.log(`${newMedicos.length} medicos inseridos com sucesso`)
    }
  } else {
    console.log("Medicos ja existem no banco")
  }

  // 2. Inserir funcionarios
  console.log("Inserindo funcionarios...")
  const { error: funcionariosError } = await supabase
    .from("funcionarios")
    .upsert(funcionarios, { onConflict: "email" })

  if (funcionariosError) {
    console.error("Erro ao inserir funcionarios:", funcionariosError)
  } else {
    console.log(`${funcionarios.length} funcionarios inseridos/atualizados com sucesso`)
  }

  // 3. Inserir pacientes
  console.log("Inserindo pacientes...")
  const { error: pacientesError } = await supabase
    .from("pacientes")
    .upsert(pacientes, { onConflict: "cpf" })

  if (pacientesError) {
    console.error("Erro ao inserir pacientes:", pacientesError)
  } else {
    console.log(`${pacientes.length} pacientes inseridos/atualizados com sucesso`)
  }

  // 4. Buscar IDs dos medicos e pacientes inseridos para criar agendamentos de exemplo
  const { data: medicosData } = await supabase.from("medicos").select("id, nome, especialidade_nome").limit(4)
  const { data: pacientesData } = await supabase.from("pacientes").select("id, nome")

  if (medicosData && pacientesData && medicosData.length > 0 && pacientesData.length > 0) {
    console.log("Inserindo agendamentos de exemplo...")
    
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)
    
    const agendamentos = [
      {
        codigo: "VPL-TEST",
        paciente_id: pacientesData[0].id,
        medico_id: medicosData[0].id,
        medico_nome: medicosData[0].nome,
        especialidade: medicosData[0].especialidade_nome,
        data_hora: `${hoje.toISOString().split("T")[0]}T09:00:00`,
        status: "aguardando",
        prioridade: "idoso",
        observacoes: [],
      },
      {
        codigo: "VPL-DEMO",
        paciente_id: pacientesData[1].id,
        medico_id: medicosData[1].id,
        medico_nome: medicosData[1].nome,
        especialidade: medicosData[1].especialidade_nome,
        data_hora: `${hoje.toISOString().split("T")[0]}T10:00:00`,
        status: "confirmado",
        prioridade: "normal",
        observacoes: [],
      },
      {
        codigo: "VPL-EXMP",
        paciente_id: pacientesData[2].id,
        medico_id: medicosData[2].id,
        medico_nome: medicosData[2].nome,
        especialidade: medicosData[2].especialidade_nome,
        data_hora: `${amanha.toISOString().split("T")[0]}T14:00:00`,
        status: "aguardando",
        prioridade: "pcd",
        descricao_prioridade: "Cadeirante",
        observacoes: [],
      },
    ]

    const { error: agendamentosError } = await supabase
      .from("agendamentos")
      .upsert(agendamentos, { onConflict: "codigo" })

    if (agendamentosError) {
      console.error("Erro ao inserir agendamentos:", agendamentosError)
    } else {
      console.log(`${agendamentos.length} agendamentos de exemplo inseridos`)
    }
  }

  console.log("\nSeed concluido!")
  console.log("\nCredenciais de teste:")
  console.log("- Recepcao: recepcao@vidaplena.com / 123456")
  console.log("- Admin: admin@vidaplena.com / admin123")
}

seed().catch(console.error)
