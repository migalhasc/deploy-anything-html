import { put, list } from '@vercel/blob'
import { generateSlug } from '@/lib/slug-generator'

export interface DeployResult {
  slug: string
  url: string
  size: number
}

/**
 * Faz o deploy de um conteúdo HTML para o Vercel Blob.
 * O slug é extraído automaticamente do <title> ou <h1> do HTML,
 * com fallback para o nome do arquivo e por último nanoid.
 */
export async function deployHtml(
  htmlContent: string,
  filename?: string
): Promise<DeployResult> {
  const slug = await generateSlug(htmlContent, filename)
  const blobPath = `sites/${slug}/index.html`

  const encoder = new TextEncoder()
  const bytes = encoder.encode(htmlContent)

  const blob = await put(blobPath, bytes, {
    contentType: 'text/html; charset=utf-8',
    access: 'private',
    addRandomSuffix: false,
  })

  return {
    slug,
    url: blob.url,
    size: bytes.byteLength,
  }
}

/**
 * Busca o HTML armazenado para um slug específico.
 * Retorna null se não encontrado.
 */
export async function getDeployedHtml(slug: string): Promise<string | null> {
  // Slug inválido rápido — evita chamadas desnecessárias ao Blob
  if (!slug || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{3,58}$/.test(slug)) {
    return null
  }

  const blobPath = `sites/${slug}/index.html`

  try {
    // list() localiza o blob pela pathname (funciona com stores privados)
    const { blobs } = await list({ prefix: blobPath, limit: 1 })
    if (!blobs[0]) return null

    // Store privado: fetch server-side com token como Authorization header
    const response = await fetch(blobs[0].url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}
