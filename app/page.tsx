import { ThemeSwitcher } from '@/components/theme-switcher'
import { UploadZone } from '@/components/upload-zone'
import { MessageCircleIcon } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Topbar ─────────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b border-border bg-card flex items-center px-6 justify-between shrink-0">
        <span className="font-serif text-[15px] tracking-tight text-foreground">
          Publica HTML
        </span>
        <ThemeSwitcher />
      </header>

      {/* ── Main content ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl flex flex-col gap-8">

          {/* ── Hero ── valor direto, sem repetir o nome da marca ──────────────── */}
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-[28px] font-normal tracking-tight leading-snug">
              Seu HTML no ar<br />em segundos.
            </h1>
          </div>

          {/* ── Upload section ─────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <UploadZone />
          </section>

          {/* ── Separator ──────────────────────────────────────────────────────── */}
          <div className="border-t border-border" />

          {/* ── Como funciona ──────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: '01',
                  title: 'Arraste o arquivo',
                  desc: 'Qualquer .html gerado por IA, editor ou ferramenta.',
                },
                {
                  step: '02',
                  title: 'Processamos tudo',
                  desc: 'Renomeamos, hospedamos e geramos uma URL limpa.',
                },
                {
                  step: '03',
                  title: 'Compartilhe o link',
                  desc: 'Uma URL pública permanente, pronta para enviar.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-lg border border-border bg-card px-5 py-5 flex flex-col gap-3"
                >
                  <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Passo {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-none mb-1">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Separator ──────────────────────────────────────────────────────── */}
          <div className="border-t border-border" />

          {/* ── Entre em contato ───────────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
              Encontrou algum problema ou o site não abriu corretamente?
            </p>
            <a
              href="https://wa.me/5581999453738"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <MessageCircleIcon className="size-4 text-muted-foreground" />
              Fale via WhatsApp
            </a>
          </section>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card px-6 py-4">
        <p className="text-[11px] text-muted-foreground font-light text-center">
          Publica HTML · Hospedagem simples para arquivos HTML
        </p>
      </footer>

    </div>
  )
}
