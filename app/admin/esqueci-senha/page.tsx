'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { checkEmailExists, resetPassword } from '@/lib/supabase-actions'

type Step = 'email' | 'reset' | 'success'

export default function EsqueciSenhaPage() {
  const router = useRouter()
  
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Digite seu e-mail')
      return
    }
    
    setIsLoading(true)
    
    const exists = await checkEmailExists(email)
    
    setIsLoading(false)
    
    if (!exists) {
      setError('E-mail não encontrado no sistema')
      return
    }
    
    setStep('reset')
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!newPassword || !confirmPassword) {
      setError('Preencha todos os campos')
      return
    }
    
    if (newPassword.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    
    setIsLoading(true)
    
    const result = await resetPassword(email, newPassword)
    
    setIsLoading(false)
    
    if (!result.success) {
      setError(result.error || 'Erro ao redefinir senha')
      return
    }
    
    toast.success('Senha redefinida com sucesso!')
    setStep('success')
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="bg-primary rounded-2xl p-6 mb-6 flex flex-col items-center">
          <Image 
            src="/logo.jpg" 
            alt="VidaPlena Logo" 
            width={60} 
            height={60} 
            className="rounded-xl mb-2"
          />
          <h2 className="text-xl font-bold text-primary-foreground">FilaJusta</h2>
          <p className="text-primary-foreground/80">VidaPlena</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
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
                Digite seu e-mail para redefinir a senha
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                      className="pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verificando...
                    </span>
                  ) : (
                    'Continuar'
                  )}
                </Button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <button 
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              
              <h1 className="text-xl font-bold text-foreground mb-1">
                Criar nova senha
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Digite sua nova senha para <strong>{email}</strong>
              </p>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword" className="text-foreground mb-2 block">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 4 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground mb-2 block">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Digite novamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-destructive text-sm">{error}</p>
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

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                Senha redefinida!
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Sua senha foi alterada com sucesso. Você já pode fazer login com a nova senha.
              </p>
              <Button
                onClick={() => router.push('/admin/login')}
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
