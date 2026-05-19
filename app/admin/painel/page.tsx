"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Stethoscope,
  Users,
  LogOut,
  Sun,
  Moon,
  Loader2,
  UserCog,
  Search,
} from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { toast } from "sonner"
import {
  getAllFuncionarios,
  getAllMedicos,
  createMedico,
  updateMedico,
  deleteMedico,
  deleteFuncionario,
  type Funcionario,
  type Medico,
} from "@/lib/supabase-actions"

const ESPECIALIDADES = [
  { id: "clinico-geral", nome: "Clínico Geral", emoji: "🩺" },
  { id: "cardiologia", nome: "Cardiologia", emoji: "❤️" },
  { id: "neurologia", nome: "Neurologia", emoji: "🧠" },
  { id: "pediatria", nome: "Pediatria", emoji: "👶" },
  { id: "ortopedia", nome: "Ortopedia", emoji: "🦴" },
  { id: "oftalmologia", nome: "Oftalmologia", emoji: "👁️" },
  { id: "dermatologia", nome: "Dermatologia", emoji: "🧴" },
  { id: "ginecologia", nome: "Ginecologia", emoji: "🧑‍⚕️" },
  { id: "odontologia", nome: "Odontologia", emoji: "🦷" },
  { id: "pneumologia", nome: "Pneumologia", emoji: "🫁" },
]

export default function AdminPainelPage() {
  const router = useRouter()
  const { theme, toggleTheme, mounted } = useTheme()

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("medicos")

  // Médicos state
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [medicosSearch, setMedicosSearch] = useState("")
  const [isMedicoDialogOpen, setIsMedicoDialogOpen] = useState(false)
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null)
  const [medicoForm, setMedicoForm] = useState({
    nome: "",
    registro: "",
    especialidade_id: "",
  })
  const [medicoSubmitting, setMedicoSubmitting] = useState(false)
  const [medicoError, setMedicoError] = useState("")

  // Funcionários state
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [funcionariosSearch, setFuncionariosSearch] = useState("")
  const [deletingFuncionarioId, setDeletingFuncionarioId] = useState<string | null>(null)

  const { getSession } = useAuthGuard("administracao")

  // ── loadData definido ANTES do useEffect ──────────────────────────────────
  const loadData = async () => {
    setLoading(true)
    try {
      const [medicosData, funcionariosData] = await Promise.all([
        getAllMedicos(),
        getAllFuncionarios(),
      ])
      setMedicos(medicosData)
      setFuncionarios(funcionariosData)
      if (funcionariosData.length === 0) {
        console.warn("[painel] Nenhum funcionário retornado do Supabase — verifique RLS ou cadastre novamente.")
      }
    } catch (err) {
      console.error("[painel] Error loading data:", err)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const s = getSession()
    if (s) {
      setSession(s)
      loadData()
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("filajusta_session")
    router.push("/admin/login")
  }

  // ── Médicos ───────────────────────────────────────────────────────────────

  const openCreateMedicoDialog = () => {
    setEditingMedico(null)
    setMedicoForm({ nome: "", registro: "", especialidade_id: "" })
    setMedicoError("")
    setIsMedicoDialogOpen(true)
  }

  const openEditMedicoDialog = (medico: Medico) => {
    setEditingMedico(medico)
    setMedicoForm({
      nome: medico.nome,
      registro: medico.registro,
      especialidade_id: medico.especialidade_id,
    })
    setMedicoError("")
    setIsMedicoDialogOpen(true)
  }

  const handleMedicoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMedicoSubmitting(true)
    setMedicoError("")

    try {
      if (!medicoForm.nome || !medicoForm.registro || !medicoForm.especialidade_id) {
        setMedicoError("Preencha todos os campos obrigatórios")
        setMedicoSubmitting(false)
        return
      }

      const especialidade = ESPECIALIDADES.find((e) => e.id === medicoForm.especialidade_id)
      if (!especialidade) {
        setMedicoError("Especialidade inválida")
        setMedicoSubmitting(false)
        return
      }

      if (editingMedico) {
        const result = await updateMedico(editingMedico.id, {
          nome: medicoForm.nome,
          registro: medicoForm.registro,
          especialidade_id: medicoForm.especialidade_id,
          especialidade_nome: especialidade.nome,
          especialidade_emoji: especialidade.emoji,
        })
        if (!result.success) {
          setMedicoError(result.error || "Erro ao atualizar médico")
          setMedicoSubmitting(false)
          return
        }
        toast.success("Médico atualizado com sucesso!")
      } else {
        const result = await createMedico({
          nome: medicoForm.nome,
          registro: medicoForm.registro,
          especialidade_id: medicoForm.especialidade_id,
          especialidade_nome: especialidade.nome,
          especialidade_emoji: especialidade.emoji,
        })
        if (!result.success) {
          setMedicoError(result.error || "Erro ao cadastrar médico")
          setMedicoSubmitting(false)
          return
        }
        toast.success("Médico cadastrado com sucesso!")
      }

      setIsMedicoDialogOpen(false)
      loadData()
    } catch (err) {
      console.error("[painel] Error saving medico:", err)
      setMedicoError("Erro ao salvar médico")
    } finally {
      setMedicoSubmitting(false)
    }
  }

  const handleDeleteMedico = async (medico: Medico) => {
    if (!confirm(`Deseja realmente excluir ${medico.nome}?`)) return
    try {
      const success = await deleteMedico(medico.id)
      if (success) {
        toast.success("Médico excluído com sucesso!")
        loadData()
      } else {
        toast.error("Erro ao excluir médico")
      }
    } catch (err) {
      console.error("[painel] Error deleting medico:", err)
      toast.error("Erro ao excluir médico")
    }
  }

  // ── Funcionários ──────────────────────────────────────────────────────────

  const handleDeleteFuncionario = async (funcionario: Funcionario) => {
    if (funcionario.id === session?.id) {
      toast.error("Você não pode excluir sua própria conta")
      return
    }
    if (!confirm(`Deseja realmente excluir ${funcionario.nome}?`)) return

    setDeletingFuncionarioId(funcionario.id)
    try {
      const success = await deleteFuncionario(funcionario.id)
      if (success) {
        toast.success("Funcionário excluído com sucesso!")
        loadData()
      } else {
        toast.error("Erro ao excluir funcionário")
      }
    } catch (err) {
      console.error("[painel] Error deleting funcionario:", err)
      toast.error("Erro ao excluir funcionário")
    } finally {
      setDeletingFuncionarioId(null)
    }
  }

  // ── Filtros ───────────────────────────────────────────────────────────────

  const filteredMedicos = medicos.filter((m) => {
    const query = medicosSearch.toLowerCase()
    return (
      m.nome.toLowerCase().includes(query) ||
      m.registro.toLowerCase().includes(query) ||
      m.especialidade_nome.toLowerCase().includes(query)
    )
  })

  const filteredFuncionarios = funcionarios.filter((f) => {
    const query = funcionariosSearch.toLowerCase()
    return (
      f.nome.toLowerCase().includes(query) ||
      f.email.toLowerCase().includes(query) ||
      f.setor.toLowerCase().includes(query)
    )
  })

  // ── Render ────────────────────────────────────────────────────────────────

  if (!session) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary p-4 pb-6 rounded-b-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/recepcao")}
              className="inline-flex items-center gap-2 text-primary-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </button>
            <div className="flex items-center gap-2">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
                  aria-label="Alternar tema"
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-primary-foreground" />
                  )}
                </button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserCog className="h-8 w-8 text-primary-foreground" />
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                Painel Administrativo
              </h1>
              <p className="text-primary-foreground/80">
                Gerencie médicos e funcionários
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="medicos" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Médicos
              </TabsTrigger>
              <TabsTrigger value="funcionarios" className="gap-2">
                <Users className="h-4 w-4" />
                Funcionários
              </TabsTrigger>
            </TabsList>

            {/* ── Aba Médicos ── */}
            <TabsContent value="medicos">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative flex-1 w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar médico..."
                    value={medicosSearch}
                    onChange={(e) => setMedicosSearch(e.target.value)}
                    className="pl-9 bg-card border-border"
                  />
                </div>
                <Button onClick={openCreateMedicoDialog} className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Novo Médico
                </Button>
              </div>

              {filteredMedicos.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {medicosSearch ? "Nenhum médico encontrado" : "Nenhum médico cadastrado"}
                  </p>
                  {!medicosSearch && (
                    <Button onClick={openCreateMedicoDialog} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Cadastrar Primeiro Médico
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Nome</TableHead>
                        <TableHead className="text-muted-foreground">Registro</TableHead>
                        <TableHead className="text-muted-foreground">Especialidade</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedicos.map((medico) => (
                        <TableRow key={medico.id} className="border-border">
                          <TableCell className="font-medium text-foreground">
                            {medico.nome}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {medico.registro}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-sm">
                              {medico.especialidade_emoji} {medico.especialidade_nome}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                medico.status === "disponivel"
                                  ? "bg-green-500/20 text-green-600"
                                  : medico.status === "em_consulta"
                                  ? "bg-blue-500/20 text-blue-600"
                                  : "bg-gray-500/20 text-gray-600"
                              }`}
                            >
                              {medico.status === "disponivel"
                                ? "Disponível"
                                : medico.status === "em_consulta"
                                ? "Em Consulta"
                                : "Ausente"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditMedicoDialog(medico)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMedico(medico)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ── Aba Funcionários ── */}
            <TabsContent value="funcionarios">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative flex-1 w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar funcionário..."
                    value={funcionariosSearch}
                    onChange={(e) => setFuncionariosSearch(e.target.value)}
                    className="pl-9 bg-card border-border"
                  />
                </div>
                <Button
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => router.push("/admin/cadastro")}
                >
                  <Plus className="h-4 w-4" />
                  Novo Funcionário
                </Button>
              </div>

              {filteredFuncionarios.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {funcionariosSearch
                      ? "Nenhum funcionário encontrado"
                      : "Nenhum funcionário cadastrado"}
                  </p>
                  {!funcionariosSearch && (
                    <Button
                      className="gap-2"
                      onClick={() => router.push("/admin/cadastro")}
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar Primeiro Funcionário
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Nome</TableHead>
                        <TableHead className="text-muted-foreground">E-mail</TableHead>
                        <TableHead className="text-muted-foreground">Setor</TableHead>
                        <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFuncionarios.map((funcionario) => (
                        <TableRow key={funcionario.id} className="border-border">
                          <TableCell className="font-medium text-foreground">
                            {funcionario.nome}
                            {funcionario.id === session?.id && (
                              <span className="ml-2 text-xs text-primary">(Você)</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {funcionario.email}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                funcionario.setor === "administracao"
                                  ? "bg-purple-500/20 text-purple-600"
                                  : "bg-blue-500/20 text-blue-600"
                              }`}
                            >
                              {funcionario.setor === "administracao"
                                ? "Administração"
                                : "Recepção"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFuncionario(funcionario)}
                              disabled={
                                funcionario.id === session?.id ||
                                deletingFuncionarioId === funcionario.id
                              }
                              className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-50"
                            >
                              {deletingFuncionarioId === funcionario.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Médico Dialog */}
      <Dialog open={isMedicoDialogOpen} onOpenChange={setIsMedicoDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingMedico ? "Editar Médico" : "Novo Médico"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingMedico
                ? "Atualize as informações do médico"
                : "Preencha as informações para cadastrar um novo médico"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMedicoSubmit} className="space-y-4">
            {medicoError && (
              <div className="p-3 bg-destructive/20 border border-destructive rounded-lg text-destructive text-sm">
                {medicoError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-foreground">
                Nome Completo *
              </Label>
              <Input
                id="nome"
                value={medicoForm.nome}
                onChange={(e) => setMedicoForm({ ...medicoForm, nome: e.target.value })}
                placeholder="Dr. João Silva"
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registro" className="text-foreground">
                CRM/CRO *
              </Label>
              <Input
                id="registro"
                value={medicoForm.registro}
                onChange={(e) => setMedicoForm({ ...medicoForm, registro: e.target.value })}
                placeholder="CRM-AM 12345"
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidade" className="text-foreground">
                Especialidade *
              </Label>
              <Select
                value={medicoForm.especialidade_id}
                onValueChange={(value) =>
                  setMedicoForm({ ...medicoForm, especialidade_id: value })
                }
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {ESPECIALIDADES.map((esp) => (
                    <SelectItem key={esp.id} value={esp.id} className="text-foreground">
                      {esp.emoji} {esp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMedicoDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={medicoSubmitting} className="flex-1">
                {medicoSubmitting
                  ? "Salvando..."
                  : editingMedico
                  ? "Salvar Alterações"
                  : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
