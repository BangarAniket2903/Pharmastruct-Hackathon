import { Activity, ShieldCheck } from 'lucide-react'

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card/40 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
          <Activity className="size-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            PharmaStruct
          </h1>
          <p className="text-xs text-muted-foreground">
            Clinical Note Intelligence
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
        <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
        HIPAA-aware · De-identified processing
      </div>
    </header>
  )
}
