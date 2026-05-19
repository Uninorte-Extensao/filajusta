"use client"

import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = (localStorage.getItem("filajusta_theme") as "light" | "dark") || "light"
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    localStorage.setItem("filajusta_theme", next)
    document.documentElement.setAttribute("data-theme", next)
  }

  return { theme, toggleTheme, mounted }
}
