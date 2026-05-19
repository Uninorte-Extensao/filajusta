'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/contexts/app-context'
import { createFuncionario } from '@/lib/supabase-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, CreditCard, Lock, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FormErrors {
  nome?: string
  email?: string
  cpf?: string
  cargo?: string
  senha?: string
  confirmarSenha?: string
}

function formatCpf(value: string): string {
  const clean = value.replace(/\D/g, '')
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
}

function validateCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1+$/.test(clean)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i)
  }
  let d1 = (sum * 10) % 11
  if (d1 === 10) d1 = 0
  if (d1 !== parseInt(clean[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i)
  }
  let d2 = (sum * 10) % 11
  if (d2 === 10) d2 = 0
  if (d2 !== parseInt(clean[10])) return false

  return true
}

export default function AdminCadastroPage() {
  const router = useRouter()
  const { register } = useApp()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [setor, setSetor] = useState<string>('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail inválido'
    }

    if (!cpf) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!validateCpf(cpf)) {
      newErrors.cpf = 'CPF inválido'
    }

    if (!setor) {
      newErrors.cargo = 'Setor é obrigatório'
    }

    if (!senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (senha.length < 4) {
      newErrors.senha = 'Senha deve ter no mínimo 4 caracteres'
    }

    if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCpfChange = (value: string) => {
    setCpf(formatCpf(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    const cpfClean = cpf.replace(/\D/g, '')
    const emailClean = email.toLowerCase().trim()
    const setorValue = setor as "recepcao" | "administracao"

    const supabaseResult = await createFuncionario({
      nome: nome.trim(),
      email: emailClean,
      cpf: cpfClean,
      setor: setorValue,
      password_hash: senha,
    })

    if (!supabaseResult.success) {
      setIsLoading(false)
      toast.error(supabaseResult.error || 'Erro ao cadastrar no sistema')
      return
    }

    const localResult = register({
      nome: nome.trim(),
      email: emailClean,
      cpf: cpfClean,
      cargo: setorValue === "administracao" ? "Administração" : "Recepção",
      setor: setorValue,
      senha,
    })

    setIsLoading(false)

    if (localResult.success) {
      toast.success('Conta criada com sucesso!')
      router.push('/admin/login')
    } else {
      toast.success('Funcionário salvo. Use o login com o e-mail cadastrado.')
      router.push('/admin/login')
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="bg-primary rounded-2xl p-6 mb-6 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="VidaPlena Logo"
            width={150}
            height={150}
            className="rounded-xl mb-2"
          />
          
          <p className="text-6xl-primary-foreground/80">VidaPlena</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h1 className="text-xl font-bold text-foreground mb-1">
            Cadastro de Funcionário
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Crie sua conta para acessar o painel interno
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <Label htmlFor="nome" className="text-foreground mb-2 block">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="nome"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={cn(
                    'pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground',
                    errors.nome && 'border-destructive'
                  )}
                />
              </div>
              {errors.nome && <p className="text-destructive text-sm mt-1">{errors.nome}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-foreground mb-2 block">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    'pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground',
                    errors.email && 'border-destructive'
                  )}
                />
              </div>
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor="cpf" className="text-foreground mb-2 block">CPF</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => handleCpfChange(e.target.value)}
                  maxLength={14}
                  className={cn(
                    'pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground',
                    errors.cpf && 'border-destructive'
                  )}
                />
              </div>
              {errors.cpf && <p className="text-destructive text-sm mt-1">{errors.cpf}</p>}
            </div>

            {/* Setor */}
            <div>
              <Label htmlFor="setor" className="text-foreground mb-2 block">Setor/Cargo</Label>
              <Select value={setor} onValueChange={setSetor}>
                <SelectTrigger className={cn(
                  'h-12 rounded-xl bg-input text-foreground',
                  errors.cargo && 'border-destructive'
                )}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <SelectValue placeholder="Selecione o setor" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="recepcao">Recepção</SelectItem>
                  <SelectItem value="administracao">Administração</SelectItem>
                </SelectContent>
              </Select>
              {errors.cargo && <p className="text-destructive text-sm mt-1">{errors.cargo}</p>}
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="senha" className="text-foreground mb-2 block">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="Mínimo 4 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={cn(
                    'pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground',
                    errors.senha && 'border-destructive'
                  )}
                />
              </div>
              {errors.senha && <p className="text-destructive text-sm mt-1">{errors.senha}</p>}
            </div>

            {/* Confirmar Senha */}
            <div>
              <Label htmlFor="confirmarSenha" className="text-foreground mb-2 block">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmarSenha"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className={cn(
                    'pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground',
                    errors.confirmarSenha && 'border-destructive'
                  )}
                />
              </div>
              {errors.confirmarSenha && <p className="text-destructive text-sm mt-1">{errors.confirmarSenha}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* LGPD Notice */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Seus dados são protegidos conforme a LGPD.
          </p>

          {/* Login Link */}
          <div className="text-center mt-6">
            <Link href="/admin/login" className="text-sm text-primary hover:underline">
              Já tem uma conta? Fazer login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
