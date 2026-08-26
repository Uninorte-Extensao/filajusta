"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
type Setor = "recepcao" | "administracao"
export function useAuthGuard(requiredSetor?: Setor) {
  const router = useRouter()
  useEffect(() => {
    const stored = localStorage.getItem("filajusta_session")
    
    if (!stored) {
      router.push("/admin/login")
      return
    }
    const session = JSON.parse(stored)
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("filajusta_session")
      router.push("/admin/login")
      return
    }
    if (requiredSetor && session.setor !== requiredSetor) {
      // Wrong role — redirect to their allowed area
      if (session.setor === "recepcao") {
        router.push("/recepcao")
      } else {
        router.push("/admin/painel")
      }
    }
  }, [router, requiredSetor])
  const getSession = () => {
    const stored = localStorage.getItem("filajusta_session")
    if (!stored) return null
    const session = JSON.parse(stored)
    if (Date.now() > session.expiresAt) return null
    return session
  }
  return { getSession }
}
