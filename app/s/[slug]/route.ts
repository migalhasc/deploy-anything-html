import { NextRequest, NextResponse } from 'next/server'
import { getDeployedHtml } from '@/lib/upload-service'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const html = await getDeployedHtml(slug)

  if (!html) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página não encontrada</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .box { text-align: center; padding: 2rem; }
    h1 { font-size: 1.5rem; color: #111; margin-bottom: 0.5rem; }
    p { color: #6b7280; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Página não encontrada</h1>
    <p>O link <code>${slug}</code> não existe ou foi removido.</p>
  </div>
</body>
</html>`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    )
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Sem cache agressivo — permite re-deploy futuro
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
    },
  })
}
