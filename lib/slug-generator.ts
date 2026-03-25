import { nanoid } from 'nanoid'
import { list } from '@vercel/blob'

// Títulos genéricos que não devem virar slug — forçam fallback para nanoid
const GENERIC_TITLES = new Set([
  'untitled', 'document', 'page', 'index', 'home',
  'titulo', 'sem-titulo', 'pagina', 'nova-pagina',
  'meu-site', 'my-site', 'my-page', 'new-page',
])

// Slugs reservados que colidiriam com rotas da app
const RESERVED_SLUGS = new Set([
  's', 'api', 'admin', '_next', 'static', 'public',
  'assets', 'favicon.ico', 'robots.txt', 'sitemap.xml',
])

/**
 * Extrai o melhor candidato a título do HTML.
 * Cascata: <title> → <h1> → null
 */
function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch?.[1]?.trim()) return titleMatch[1].trim()

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match?.[1]?.trim()) return h1Match[1].trim()

  return null
}

/**
 * Normaliza qualquer string para formato slug válido:
 * - lowercase
 * - remove acentos e diacríticos
 * - substitui qualquer caractere não alfanumérico por hífen
 * - colapsa hífens duplos e remove das bordas
 * - trunca em 40 chars sem cortar no meio de uma palavra
 */
export function normalizeToSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove diacríticos: ç→c, ã→a, etc.
    .replace(/[^a-z0-9]+/g, '-')     // não alfanumérico → hífen
    .replace(/^-+|-+$/g, '')         // remove hífens nas bordas
    .replace(/-{2,}/g, '-')          // colapsa hífens duplos
    .slice(0, 40)
    .replace(/-+$/g, '')             // remove hífen residual após truncar
}

/**
 * Verifica se um slug já está ocupado no Blob.
 * Em caso de erro de rede, assume ocupado para não sobrescrever.
 */
async function isSlugTaken(slug: string): Promise<boolean> {
  try {
    const { blobs } = await list({
      prefix: `sites/${slug}/index.html`,
      limit: 1,
    })
    return blobs.length > 0
  } catch {
    return true // seguro: prefere conflito a sobrescrever
  }
}

/**
 * Gera slug único a partir do conteúdo HTML.
 *
 * Cascata de fontes:
 *   1. <title> do HTML
 *   2. <h1> do HTML
 *   3. nome do arquivo (sem extensão)
 *   4. nanoid(8) como último recurso
 *
 * Se a base já estiver ocupada, adiciona sufixo de 4 chars (até 5 tentativas).
 */
export async function generateSlug(
  html: string,
  filename?: string
): Promise<string> {
  // --- Tenta extrair título do HTML ---
  const title = extractTitle(html)
  let baseSlug: string | null = null

  if (title) {
    const normalized = normalizeToSlug(title)
    if (
      normalized.length >= 3 &&
      !GENERIC_TITLES.has(normalized) &&
      !RESERVED_SLUGS.has(normalized)
    ) {
      baseSlug = normalized
    }
  }

  // --- Fallback: nome do arquivo ---
  if (!baseSlug && filename) {
    const fromFile = normalizeToSlug(filename.replace(/\.html?$/i, ''))
    if (
      fromFile.length >= 3 &&
      !GENERIC_TITLES.has(fromFile) &&
      !RESERVED_SLUGS.has(fromFile)
    ) {
      baseSlug = fromFile
    }
  }

  // --- Sem base válida: nanoid direto ---
  if (!baseSlug) return nanoid(8)

  // --- Base disponível: usa slug limpo ---
  if (!(await isSlugTaken(baseSlug))) return baseSlug

  // --- Conflito: adiciona sufixo curto, tenta até 5x ---
  for (let i = 0; i < 5; i++) {
    const candidate = `${baseSlug}-${nanoid(4)}`
    if (!(await isSlugTaken(candidate))) return candidate
  }

  // --- Último recurso ---
  return nanoid(8)
}
