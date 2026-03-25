'use client'

import { useCallback, useRef, useState } from 'react'
import {
  UploadCloudIcon,
  FileIcon,
  XIcon,
  CheckCircle2Icon,
  Loader2Icon,
  CopyIcon,
  ExternalLinkIcon,
  AlertTriangleIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Types ────────────────────────────────────────────────────────────────────

type State =
  | { status: 'idle' }
  | { status: 'dragging' }
  | { status: 'uploading'; filename: string }
  | { status: 'success'; slug: string; url: string; filename: string; size: number }
  | { status: 'error'; message: string }

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UploadZone() {
  const [state, setState] = useState<State>({ status: 'idle' })
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Upload ─────────────────────────────────────────────────────────────────

  const upload = useCallback(async (file: File) => {
    if (!file.name.match(/\.html?$/i)) {
      setState({ status: 'error', message: 'Apenas arquivos .html são aceitos.' })
      return
    }

    setState({ status: 'uploading', filename: file.name })

    try {
      const body = new FormData()
      body.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()

      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Erro ao publicar. Tente novamente.' })
        return
      }

      setState({
        status: 'success',
        slug: data.slug,
        url: data.url,
        filename: file.name,
        size: data.size_bytes,
      })
    } catch {
      setState({ status: 'error', message: 'Falha na conexão. Verifique sua internet.' })
    }
  }, [])

  // ── Drag & drop ────────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const onDragLeave = () => setDragOver(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  const reset = () => setState({ status: 'idle' })

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback para contextos sem permissão de Clipboard API
      const el = document.createElement('textarea')
      el.value = url
      el.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    toast.success('Link copiado!')
  }

  const isUploading = state.status === 'uploading'
  const hasFile = isUploading

  // ── Success ────────────────────────────────────────────────────────────────

  if (state.status === 'success') {
    const publicUrl = state.url.replace('http://localhost:3000', window.location.origin)

    return (
      <div className="flex flex-col gap-5">

        {/* Stats grid — idêntico ao CDP post-import dialog */}
        <div className="grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden border border-border">
          {[
            { label: 'Status', value: '✓', accent: true },
            { label: 'Tamanho', value: formatSize(state.size) },
            { label: 'Slug', value: `/${state.slug.split('-').slice(0, 2).join('-')}…`, mono: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-card px-3 py-4 flex flex-col gap-1 items-center text-center">
              <span className={cn(
                'font-sans text-[28px] font-light tracking-[-0.03em] leading-none',
                stat.accent && 'text-success'
              )}>
                {stat.value}
              </span>
              <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* URL copiável */}
        <div>
          <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-normal">
            Link público
          </span>
          <div className="mt-2 h-9 rounded-lg border border-border bg-card flex items-center gap-2 px-3">
            <span className="flex-1 text-sm font-mono text-foreground truncate">
              {publicUrl.replace(/^https?:\/\//, '')}
            </span>
            <button
              onClick={() => copyUrl(publicUrl)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
              title="Copiar link"
            >
              <CopyIcon className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Badge + ações */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="badge-success rounded-full px-2.5 py-0.5 text-[11px] font-normal gap-1.5"
          >
            <CheckCircle2Icon className="size-3" />
            Publicado
          </Badge>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs gap-1.5 text-muted-foreground"
              onClick={reset}
            >
              Publicar outro
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 text-xs gap-1.5"
              onClick={() => window.open(publicUrl, '_blank')}
            >
              Abrir site
              <ExternalLinkIcon className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (state.status === 'error') {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-dashed border-border bg-card px-5 py-8 flex flex-col items-center gap-3 text-center">
          <AlertTriangleIcon className="size-5 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </div>
        <Badge
          variant="outline"
          className="badge-error rounded-full px-2.5 py-0.5 text-[11px] font-normal gap-1.5 w-fit"
        >
          <span className="size-1.5 rounded-full bg-current inline-block" />
          Erro ao publicar
        </Badge>
        <Button size="sm" className="h-9 px-5 text-sm w-fit" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  // ── Drop zone (idle + dragging + uploading) ────────────────────────────────

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Drop zone — estilo exato do CDP UploadPage */}
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'relative h-[88px] rounded-lg border-2 border-dashed',
          'flex items-center justify-center gap-3 transition-colors',
          !isUploading && 'cursor-pointer',
          dragOver
            ? 'border-foreground/40 bg-muted/40'
            : isUploading
              ? 'border-border/60 bg-muted/20'
              : 'border-border/60 hover:border-muted-foreground/40 hover:bg-muted/20'
        )}
      >
        {isUploading ? (
          <div className="flex items-center gap-2.5 px-4 w-full">
            <Loader2Icon className="size-4 text-muted-foreground/60 flex-shrink-0 animate-spin" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{state.filename}</p>
              <p className="text-[11px] text-muted-foreground font-light">Publicando…</p>
            </div>
          </div>
        ) : hasFile ? (
          <div className="flex items-center gap-2.5 px-4 w-full">
            <FileIcon className="size-5 text-muted-foreground/60 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{(state as { filename?: string }).filename}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); reset() }}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-center px-4">
            <UploadCloudIcon className="size-5 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Arraste ou{' '}
              <span className="text-foreground underline underline-offset-2">escolha um arquivo</span>
            </p>
            <p className="text-[10px] text-muted-foreground/50">.html, .htm · máx. 6 MB</p>
          </div>
        )}
      </div>
    </>
  )
}
