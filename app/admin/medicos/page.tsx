"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Plus, Pencil, Trash2, UserPlus, Stethoscope } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuthGuard } from "@/hooks/use-auth-guard"

type Specialty = {
  id: string
  name: string
  emoji: string
}

type Doctor = {
  id: string
  name: string
  crm: string
  specialty_id: string
  phone: string | null
  email: string | null
  active: boolean
  specialty?: Specialty
}

export default function CadastroMedicosPage() {
  const router = useRouter()
  const { getSession } = useAuthGuard("administracao")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    crm: "",
    specialty_id: "",
    phone: "",
    email: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [doctorsRes, specialtiesRes] = await Promise.all([
        supabase.from("doctors").select("*, specialty:specialties(*)").eq("active", true).order("name"),
        supabase.from("specialties").select("*").eq("active", true).order("name"),
      ])

      if (doctorsRes.data) setDoctors(doctorsRes.data)
      if (specialtiesRes.data) setSpecialties(specialtiesRes.data)
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingDoctor(null)
    setFormData({ name: "", crm: "", specialty_id: "", phone: "", email: "" })
    setError("")
    setIsDialogOpen(true)
  }

  function openEditDialog(doctor: Doctor) {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      crm: doctor.crm,
      specialty_id: doctor.specialty_id,
      phone: doctor.phone || "",
      email: doctor.email || "",
    })
    setError("")
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      if (!formData.name || !formData.crm || !formData.specialty_id) {
        setError("Preencha todos os campos obrigatórios")
        return
      }

      if (editingDoctor) {
        const { error: updateError } = await supabase
          .from("doctors")
          .update({
            name: formData.name,
            crm: formData.crm,
            specialty_id: formData.specialty_id,
            phone: formData.phone || null,
            email: formData.email || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingDoctor.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("doctors").insert({
          name: formData.name,
          crm: formData.crm,
          specialty_id: formData.specialty_id,
          phone: formData.phone || null,
          email: formData.email || null,
        })

        if (insertError) {
          if (insertError.code === "23505") {
            setError("Já existe um profissional com este CRM")
            return
          }
          throw insertError
        }
      }

      setIsDialogOpen(false)
      loadData()
    } catch (err) {
      console.error("Error saving doctor:", err)
      setError("Erro ao salvar profissional")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(doctor: Doctor) {
    if (!confirm(`Deseja realmente excluir ${doctor.name}?`)) return

    try {
      await supabase.from("doctors").update({ active: false }).eq("id", doctor.id)
      loadData()
    } catch (err) {
      console.error("Error deleting doctor:", err)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary p-4 pb-6 rounded-b-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/recepcao")}
              className="inline-flex items-center gap-2 text-primary-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </button>
            <Logo size="small" showImage={false} />
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
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {doctors.length} profissional(is) cadastrado(s)
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Novo Profissional
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-secondary border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editingDoctor ? "Editar Profissional" : "Novo Profissional"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/20 border border-destructive rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dr. João Silva"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crm" className="text-foreground">
                    CRM *
                  </Label>
                  <Input
                    id="crm"
                    value={formData.crm}
                    onChange={(e) =>
                      setFormData({ ...formData, crm: e.target.value })
                    }
                    placeholder="CRM/SP 123456"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-foreground">
                    Especialidade *
                  </Label>
                  <Select
                    value={formData.specialty_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specialty_id: value })
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      {specialties.map((specialty) => (
                        <SelectItem
                          key={specialty.id}
                          value={specialty.id}
                          className="text-foreground"
                        >
                          {specialty.emoji} {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="medico@vidaplena.com"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting
                      ? "Salvando..."
                      : editingDoctor
                      ? "Salvar Alterações"
                      : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando...
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-secondary rounded-xl border border-border">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum profissional cadastrado
            </p>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Profissional
            </Button>
          </div>
        ) : (
          <div className="bg-secondary rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground">CRM</TableHead>
                  <TableHead className="text-muted-foreground">
                    Especialidade
                  </TableHead>
                  <TableHead className="text-muted-foreground">Contato</TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {doctor.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doctor.crm}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {doctor.specialty?.emoji} {doctor.specialty?.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {doctor.phone && <div>{doctor.phone}</div>}
                      {doctor.email && <div>{doctor.email}</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(doctor)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doctor)}
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
