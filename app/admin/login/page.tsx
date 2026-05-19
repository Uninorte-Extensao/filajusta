'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useApp } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, session, logout, loginAttempts, lockoutUntil } = useApp()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lockoutRemaining, setLockoutRemaining] = useState(0)
  const [showLogoutOption, setShowLogoutOption] = useState(false)

  // Check if session exists and is valid
  useEffect(() => {
    if (session && session.expiresAt > Date.now()) {
      setShowLogoutOption(true)
    } else {
      setShowLogoutOption(false)
    }
  }, [session])

  // Lockout countdown
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemaining(0)
      return
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000))
      setLockoutRemaining(remaining)
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 1000)
    return () => clearInterval(interval)
  }, [lockoutUntil])

  const isLocked = lockoutRemaining > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLocked) return

    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    setError('')
    
    await new Promise(resolve => setTimeout(resolve, 800))

    const result = await login(email, password)

    setIsLoading(false)

    if (result.success) {
      toast.success('Login realizado com sucesso!')
      router.push('/recepcao')
    } else {
      setError(result.error || 'Credenciais inválidas')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          <h2 className="text-xl font-bold text-primary-foreground">FilaJusta</h2>
          <p className="text-primary-foreground/80">VidaPlena</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h1 className="text-xl font-bold text-foreground mb-1">
            Acesso Restrito
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Painel da Recepção — VidaPlena
          </p>

          {/* Already logged in option */}
          {showLogoutOption && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground mb-3">
                Você já está logado como <strong>{session?.nome}</strong>
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => router.push('/recepcao')}
                  className="flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm"
                >
                  Ir para Recepção
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    logout()
                    setShowLogoutOption(false)
                  }}
                  className="flex-1 h-10 rounded-lg text-sm"
                >
                  Sair e trocar conta
                </Button>
              </div>
            </div>
          )}

          {/* Lockout Warning */}
          {isLocked && (
            <div className="bg-destructive/20 border border-destructive rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Conta temporariamente bloqueada</p>
                <p className="text-sm text-destructive/80">
                  Tente novamente em {formatTime(lockoutRemaining)}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-foreground mb-2 block">E-mail</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLocked}
                  className="pl-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-foreground mb-2 block">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked}
                  className="pl-10 pr-10 h-12 rounded-xl bg-input text-foreground placeholder:text-muted-foreground disabled:opacity-50"
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

            {/* Error Message */}
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Área exclusiva para funcionários da clínica
          </p>

          {/* Links */}
          <div className="flex flex-col items-center gap-3 mt-6">
            <Link href="/admin/esqueci-senha" className="text-sm text-muted-foreground hover:text-primary hover:underline">
              Esqueci minha senha
            </Link>
            <Link href="/admin/cadastro" className="text-sm text-primary hover:underline">
              Criar nova conta
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
