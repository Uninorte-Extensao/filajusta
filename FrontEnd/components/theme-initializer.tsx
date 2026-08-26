"use client"

import { useEffect } from "react"

export function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("filajusta_theme") || "light"
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  return null
}
