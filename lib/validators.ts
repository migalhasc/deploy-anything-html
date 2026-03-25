const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export type ValidationResult =
  | { ok: true; content: string }
  | { ok: false; error: string }

export function validateHtmlFile(file: File): ValidationResult {
  if (file.size === 0) {
    return { ok: false, error: 'Arquivo está vazio.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: 'Arquivo muito grande. Limite: 5MB.' }
  }

  const name = file.name.toLowerCase()
  const mime = file.type.toLowerCase()

  const validExtension = name.endsWith('.html') || name.endsWith('.htm')
  const validMime =
    mime === 'text/html' || mime === 'application/octet-stream' || mime === ''

  if (!validExtension && !validMime) {
    return { ok: false, error: 'Apenas arquivos HTML são aceitos.' }
  }

  return { ok: true, content: '' }
}

export function validateHtmlContent(text: string): ValidationResult {
  const trimmed = text.trim().toLowerCase()

  // Aceita qualquer coisa que pareça HTML — tag, doctype, ou pelo menos um elemento
  const looksLikeHtml =
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<head') ||
    trimmed.startsWith('<body') ||
    trimmed.includes('<html') ||
    trimmed.includes('</html>') ||
    // Aceita fragmentos HTML válidos também
    /<[a-z][\s\S]*>/i.test(trimmed)

  if (!looksLikeHtml) {
    return { ok: false, error: 'O conteúdo não parece ser HTML válido.' }
  }

  return { ok: true, content: text }
}
