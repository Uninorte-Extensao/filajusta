"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Stethoscope,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import {
  createMedico,
  deleteMedico,
  getAllMedicos,
  getEspecialidades,
  updateMedico,
  type Especialidade,
  type Medico,
} from "@/lib/api-actions"

export default function CadastroMedicosPage() {
  const router = useRouter()
  const { getSession } = useAuthGuard("administracao")

  const [doctors, setDoctors] = useState<Medico[]>([])
  const [specialties, setSpecialties] = useState<Especialidade[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Medico | null>(null)

  const [formData, setFormData] = useState({
    nome: "",
    registro: "",
    especialidade_id: "",
    telefone: "",
    email: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const session = getSession()

    if (!session) {
      return
    }

    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    try {
      const [medicos, especialidades] = await Promise.all([
        getAllMedicos(),
        getEspecialidades(),
      ])

      console.log("=== ESPECIALIDADES RECEBIDAS DA API ===")
      console.table(especialidades)

      setDoctors(medicos)
      setSpecialties(especialidades)
    } catch (err) {
      console.error(
        "[CadastroMedicosPage] Erro ao carregar dados:",
        err
      )

      toast.error("Erro ao carregar profissionais")
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingDoctor(null)

    setFormData({
      nome: "",
      registro: "",
      especialidade_id: "",
      telefone: "",
      email: "",
    })

    setError("")
    setIsDialogOpen(true)
  }

  function openEditDialog(doctor: Medico) {
    setEditingDoctor(doctor)

    setFormData({
      nome: doctor.nome,
      registro: doctor.registro,
      especialidade_id: doctor.especialidade_id,
      telefone: doctor.telefone || "",
      email: doctor.email || "",
    })

    setError("")
    setIsDialogOpen(true)
  }

  function handleEspecialidadeChange(value: string) {
    console.log("=== ESPECIALIDADE SELECIONADA ===")
    console.log("value:", value)

    const encontrada = specialties.find(
      (specialty) => specialty.id === value
    )

    console.log("especialidade encontrada:", encontrada)

    setFormData((prev) => ({
      ...prev,
      especialidade_id: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    console.log("=== DEBUG CADASTRO MÉDICO ===")
    console.log("formData:", formData)
    console.log(
      "especialidade_id:",
      formData.especialidade_id
    )
    console.log("specialties:", specialties)

    setSubmitting(true)
    setError("")

    try {
      if (
        !formData.nome.trim() ||
        !formData.registro.trim() ||
        !formData.especialidade_id
      ) {
        setError("Preencha todos os campos obrigatórios")
        return
      }

      /*
       * Nossa API usa UUID para especialidade_id.
       *
       * Exemplo válido:
       * 00000000-0000-4000-8000-000000000108
       *
       * Isso também impede que valores antigos como
       * "neurologia" sejam enviados para a API.
       */
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      if (!uuidRegex.test(formData.especialidade_id)) {
        console.error(
          "[CadastroMedicosPage] especialidade_id inválido:",
          formData.especialidade_id
        )

        setError(
          `Especialidade inválida. ID recebido: ${formData.especialidade_id}`
        )

        return
      }

      const payload = {
        nome: formData.nome.trim(),
        registro: formData.registro.trim(),
        especialidade_id: formData.especialidade_id,
        telefone: formData.telefone.trim() || null,
        email: formData.email.trim() || null,
        ativo: editingDoctor
          ? editingDoctor.ativo ?? true
          : true,
      }

      console.log("=== PAYLOAD QUE SERÁ ENVIADO ===")
      console.log(payload)

      if (editingDoctor) {
        const result = await updateMedico(
          editingDoctor.id,
          payload
        )

        if (!result.success) {
          setError(
            result.error ||
              "Erro ao atualizar profissional"
          )

          return
        }

        toast.success(
          "Profissional atualizado com sucesso!"
        )
      } else {
        const result = await createMedico(payload)

        if (!result.success) {
          setError(
            result.error ||
              "Erro ao cadastrar profissional"
          )

          return
        }

        toast.success(
          "Profissional cadastrado com sucesso!"
        )
      }

      setIsDialogOpen(false)

      setFormData({
        nome: "",
        registro: "",
        especialidade_id: "",
        telefone: "",
        email: "",
      })

      setEditingDoctor(null)

      await loadData()
    } catch (err) {
      console.error(
        "[CadastroMedicosPage] Erro ao salvar profissional:",
        err
      )

      setError("Erro ao salvar profissional")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(doctor: Medico) {
    const confirmou = confirm(
      `Deseja realmente excluir ${doctor.nome}?`
    )

    if (!confirmou) {
      return
    }

    try {
      const success = await deleteMedico(
        doctor.id
      )

      if (!success) {
        toast.error(
          "Não foi possível excluir o profissional"
        )

        return
      }

      toast.success(
        "Profissional excluído com sucesso!"
      )

      await loadData()
    } catch (err) {
      console.error(
        "[CadastroMedicosPage] Erro ao excluir profissional:",
        err
      )

      toast.error("Erro ao excluir profissional")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary p-4 pb-6 rounded-b-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                router.push("/admin/painel")
              }
              className="inline-flex items-center gap-2 text-primary-foreground"
            >
              <ArrowLeft className="h-5 w-5" />

              <span className="font-medium">
                Voltar
              </span>
            </button>

            <Logo
              size="small"
              showImage={false}
            />
          </div>

          <div className="flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-primary-foreground" />

            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                Cadastro de Profissionais
              </h1>

              <p className="text-primary-foreground/80">
                Gerencie médicos e especialistas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {/* Actions */}
        <div className="flex justify-between items-center gap-3 mb-6">
          <p className="text-muted-foreground">
            {doctors.length} profissional(is) cadastrado(s)
          </p>

          <Dialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Novo Profissional
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-secondary border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editingDoctor
                    ? "Editar Profissional"
                    : "Novo Profissional"}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 bg-destructive/20 border border-destructive rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Nome */}
                <div className="space-y-2">
                  <Label
                    htmlFor="nome"
                    className="text-foreground"
                  >
                    Nome Completo *
                  </Label>

                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nome: e.target.value,
                      })
                    }
                    placeholder="Dr. João Silva"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* CRM */}
                <div className="space-y-2">
                  <Label
                    htmlFor="crm"
                    className="text-foreground"
                  >
                    CRM *
                  </Label>

                  <Input
                    id="crm"
                    value={formData.registro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registro: e.target.value,
                      })
                    }
                    placeholder="CRM/AM 123456"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Especialidade */}
                <div className="space-y-2">
                  <Label
                    htmlFor="specialty"
                    className="text-foreground"
                  >
                    Especialidade *
                  </Label>

                  <Select
                    value={formData.especialidade_id}
                    onValueChange={
                      handleEspecialidadeChange
                    }
                  >
                    <SelectTrigger
                      id="specialty"
                      className="bg-background border-border text-foreground"
                    >
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>

                    <SelectContent className="bg-secondary border-border">
                      {specialties.map(
                        (specialty) => (
                          <SelectItem
                            key={specialty.id}
                            value={specialty.id}
                            className="text-foreground"
                          >
                            {specialty.emoji}{" "}
                            {specialty.nome}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="telefone"
                    className="text-foreground"
                  >
                    Telefone
                  </Label>

                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefone: e.target.value,
                      })
                    }
                    placeholder="(92) 99999-9999"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-foreground"
                  >
                    E-mail
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="medico@vidaplena.com"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setIsDialogOpen(false)
                    }
                    className="flex-1"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </span>
                    ) : editingDoctor ? (
                      "Salvar Alterações"
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Carregando...
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-secondary rounded-xl border border-border">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />

            <p className="text-muted-foreground mb-4">
              Nenhum profissional cadastrado
            </p>

            <Button
              onClick={openCreateDialog}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Profissional
            </Button>
          </div>
        ) : (
          <div className="bg-secondary rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Nome
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    CRM
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Especialidade
                  </TableHead>

                  <TableHead className="text-muted-foreground">
                    Contato
                  </TableHead>

                  <TableHead className="text-muted-foreground text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow
                    key={doctor.id}
                    className="border-border"
                  >
                    <TableCell className="font-medium text-foreground">
                      {doctor.nome}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {doctor.registro}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {doctor.especialidade_emoji &&
                          `${doctor.especialidade_emoji} `}

                        {doctor.especialidade_nome}
                      </span>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {doctor.telefone && (
                        <div>
                          {doctor.telefone}
                        </div>
                      )}

                      {doctor.email && (
                        <div>
                          {doctor.email}
                        </div>
                      )}

                      {!doctor.telefone &&
                        !doctor.email && (
                          <span>—</span>
                        )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            openEditDialog(doctor)
                          }
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(doctor)
                          }
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
      </div>
    </main>
  )
}