import { NextRequest, NextResponse } from 'next/server'
import { validateHtmlFile, validateHtmlContent } from '@/lib/validators'
import { deployHtml } from '@/lib/upload-service'

export const runtime = 'nodejs'
// Permite uploads até 6MB no body do Vercel
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado. Use o campo "file".' },
        { status: 400 }
      )
    }

    // Valida extensão e tamanho
    const fileValidation = validateHtmlFile(file)
    if (!fileValidation.ok) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 })
    }

    // Lê o conteúdo
    const htmlContent = await file.text()

    // Valida se parece HTML de verdade
    const contentValidation = validateHtmlContent(htmlContent)
    if (!contentValidation.ok) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      )
    }

    // Faz o deploy — passa filename para geração de slug com fallback
    const result = await deployHtml(htmlContent, file.name)

    const baseUrl = req.nextUrl.origin
    const publicUrl = `${baseUrl}/s/${result.slug}`

    return NextResponse.json(
      {
        slug: result.slug,
        url: publicUrl,
        size_bytes: result.size,
        original_filename: file.name,
        deployed_at: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[upload] erro inesperado:', err)
    return NextResponse.json(
      { error: 'Erro interno ao fazer deploy. Tente novamente.' },
      { status: 500 }
    )
  }
}

// Rejeita outros métodos com mensagem clara
export async function GET() {
  return NextResponse.json(
    { error: 'Use POST com multipart/form-data e campo "file".' },
    { status: 405 }
  )
}
