'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  KeyRound,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  solicitarRecuperacaoSenha,
  validarCodigoRecuperacao,
  redefinirSenha,
} from '@/lib/api-actions'

type Step = 'email' | 'codigo' | 'reset' | 'success'

export default function EsqueciSenhaPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')

  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // ─────────────────────────────────────────────
  // ETAPA 1 - SOLICITAR CÓDIGO
  // ─────────────────────────────────────────────

  const handleEmailSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError('')

    const emailNormalizado = email
      .trim()
      .toLowerCase()

    if (!emailNormalizado) {
      setError('Digite seu e-mail')
      return
    }

    setIsLoading(true)

    try {
      const result =
        await solicitarRecuperacaoSenha(
          emailNormalizado
        )

      if (!result.success) {
        setError(
          result.error ||
            'Não foi possível solicitar a recuperação'
        )
        return
      }

      setEmail(emailNormalizado)

      toast.success(
        'Código de recuperação enviado!'
      )

      setStep('codigo')
    } catch (err) {
      console.error(err)

      setError(
        'Não foi possível conectar com o servidor'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // ETAPA 2 - VALIDAR CÓDIGO
  // ─────────────────────────────────────────────

  const handleCodigoSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError('')

    const codigoLimpo = codigo.trim()

    if (!codigoLimpo) {
      setError('Digite o código recebido')
      return
    }

    if (!/^\d{6}$/.test(codigoLimpo)) {
      setError(
        'O código deve conter 6 números'
      )
      return
    }

    setIsLoading(true)

    try {
      const result =
        await validarCodigoRecuperacao(
          email,
          codigoLimpo
        )

      if (!result.success) {
        setError(
          result.error ||
            'Código inválido ou expirado'
        )
        return
      }

      setCodigo(codigoLimpo)
      setStep('reset')
    } catch (err) {
      console.error(err)

      setError(
        'Não foi possível conectar com o servidor'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // REENVIAR CÓDIGO
  // ─────────────────────────────────────────────

  const handleReenviarCodigo = async () => {
    setError('')
    setIsLoading(true)

    try {
      const result =
        await solicitarRecuperacaoSenha(email)

      if (!result.success) {
        setError(
          result.error ||
            'Não foi possível reenviar o código'
        )
        return
      }

      setCodigo('')

      toast.success(
        'Um novo código foi enviado!'
      )
    } catch (err) {
      console.error(err)

      setError(
        'Não foi possível conectar com o servidor'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // ETAPA 3 - REDEFINIR SENHA
  // ─────────────────────────────────────────────

  const handleResetSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Preencha todos os campos')
      return
    }

    if (newPassword.length < 6) {
      setError(
        'A senha deve ter pelo menos 6 caracteres'
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setIsLoading(true)

    try {
      const result = await redefinirSenha(
        email,
        codigo,
        newPassword
      )

      if (!result.success) {
        setError(
          result.error ||
            'Erro ao redefinir senha'
        )
        return
      }

      toast.success(
        'Senha redefinida com sucesso!'
      )

      setStep('success')
    } catch (err) {
      console.error(err)

      setError(
        'Não foi possível conectar com o servidor'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* LOGO */}

        <div className="bg-primary rounded-2xl p-6 mb-6 flex flex-col items-center">
          <Image
            src="/logo.jpg"
            alt="VidaPlena Logo"
            width={60}
            height={60}
            className="rounded-xl mb-2"
          />

          <h2 className="text-xl font-bold text-primary-foreground">
            FilaJusta
          </h2>

          <p className="text-primary-foreground/80">
            VidaPlena
          </p>
        </div>

        {/* CARD */}

        <div className="bg-card border border-border rounded-2xl p-6">

          {/* ───────────────────────────── */}
          {/* ETAPA E-MAIL */}
          {/* ───────────────────────────── */}

          {step === 'email' && (
            <>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Link>

              <h1 className="text-xl font-bold text-foreground mb-1">
                Esqueci minha senha
              </h1>

              <p className="text-sm text-muted-foreground mb-6">
                Digite seu e-mail para receber
                um código de recuperação.
              </p>

              <form
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div>
                  <Label
                    htmlFor="email"
                    className="text-foreground mb-2 block"
                  >
                    E-mail
                  </Label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      autoComplete="email"
                      className="pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-destructive text-sm">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />

                      Enviando...
                    </span>
                  ) : (
                    'Enviar código'
                  )}
                </Button>
              </form>
            </>
          )}

          {/* ───────────────────────────── */}
          {/* ETAPA CÓDIGO */}
          {/* ───────────────────────────── */}

          {step === 'codigo' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setCodigo('')
                  setStep('email')
                }}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>

              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>

              <h1 className="text-xl font-bold text-foreground mb-1">
                Verifique seu e-mail
              </h1>

              <p className="text-sm text-muted-foreground mb-6">
                Enviamos um código de 6 dígitos
                para{' '}
                <strong className="text-foreground">
                  {email}
                </strong>
                .
              </p>

              <form
                onSubmit={handleCodigoSubmit}
                className="space-y-4"
              >
                <div>
                  <Label
                    htmlFor="codigo"
                    className="text-foreground mb-2 block"
                  >
                    Código de recuperação
                  </Label>

                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                    <Input
                      id="codigo"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      value={codigo}
                      onChange={(e) => {
                        const valor =
                          e.target.value.replace(
                            /\D/g,
                            ''
                          )

                        setCodigo(valor)
                      }}
                      className="pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground text-center text-lg tracking-[0.35em] font-semibold"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-destructive text-sm">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    codigo.length !== 6
                  }
                  className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />

                      Verificando...
                    </span>
                  ) : (
                    'Validar código'
                  )}
                </Button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleReenviarCodigo}
                  className="w-full text-sm text-primary hover:underline disabled:opacity-50"
                >
                  Não recebeu? Reenviar código
                </button>
              </form>
            </>
          )}

          {/* ───────────────────────────── */}
          {/* ETAPA NOVA SENHA */}
          {/* ───────────────────────────── */}

          {step === 'reset' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setStep('codigo')
                }}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>

              <h1 className="text-xl font-bold text-foreground mb-1">
                Criar nova senha
              </h1>

              <p className="text-sm text-muted-foreground mb-6">
                Digite sua nova senha para{' '}
                <strong>{email}</strong>
              </p>

              <form
                onSubmit={handleResetSubmit}
                className="space-y-4"
              >
                <div>
                  <Label
                    htmlFor="newPassword"
                    className="text-foreground mb-2 block"
                  >
                    Nova senha
                  </Label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                    <Input
                      id="newPassword"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-foreground mb-2 block"
                  >
                    Confirmar senha
                  </Label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                    <Input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Digite novamente"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-destructive text-sm">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />

                      Salvando...
                    </span>
                  ) : (
                    'Redefinir senha'
                  )}
                </Button>
              </form>
            </>
          )}

          {/* ───────────────────────────── */}
          {/* SUCESSO */}
          {/* ───────────────────────────── */}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>

              <h1 className="text-xl font-bold text-foreground mb-2">
                Senha redefinida!
              </h1>

              <p className="text-sm text-muted-foreground mb-6">
                Sua senha foi alterada com
                sucesso. Você já pode fazer login
                com a nova senha.
              </p>

              <Button
                onClick={() =>
                  router.push('/admin/login')
                }
                className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                Ir para o login
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}