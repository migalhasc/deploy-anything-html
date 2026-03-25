'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch: servidor não conhece o tema resolvido.
  // Só exibe o ícone correto após montar no cliente.
  useEffect(() => { setMounted(true) }, [])

  const next = () => {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  const Icon = !mounted
    ? MonitorIcon // igual ao default do servidor
    : theme === 'system'
      ? MonitorIcon
      : resolvedTheme === 'dark'
        ? MoonIcon
        : SunIcon

  return (
    <Button variant="ghost" size="icon" className="size-8" onClick={next} title="Alternar tema">
      <Icon className="size-4" />
    </Button>
  )
}
