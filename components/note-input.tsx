'use client'

import { Button } from '@/components/ui/button'
import { FileText, Loader2, Sparkles } from 'lucide-react'

const SAMPLE_NOTE = `Patient is a 54-year-old male presenting with persistent hypertension and intermittent chest tightness. Started on Lisinopril 10mg once daily. Also reports seasonal allergic rhinitis; prescribed Loratadine 10mg once daily as needed. History of type 2 diabetes managed with Metformin 500mg twice daily. Complains of mild insomnia.`

interface NoteInputProps {
  value: string
  onChange: (value: string) => void
  onProcess: () => void
  isProcessing: boolean
  charCount: number
}

export function NoteInput({
  value,
  onChange,
  onProcess,
  isProcessing,
  charCount,
}: NoteInputProps) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary" aria-hidden="true" />
          <label
            htmlFor="clinical-note"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            Raw Clinical Note
          </label>
        </div>
        <button
          type="button"
          onClick={() => onChange(SAMPLE_NOTE)}
          className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Load sample note
        </button>
      </div>

      <div className="relative flex-1">
        <textarea
          id="clinical-note"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste unstructured doctor notes here..."
          spellCheck={false}
          className="h-full min-h-[280px] w-full resize-none rounded-lg border border-input bg-secondary/40 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <span className="pointer-events-none absolute bottom-3 right-3 rounded bg-background/70 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {charCount} chars
        </span>
      </div>

      <Button
        onClick={onProcess}
        disabled={isProcessing || value.trim().length === 0}
        size="lg"
        className="group h-12 w-full text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
      >
        {isProcessing ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Processing Clinical Data…
          </>
        ) : (
          <>
            <Sparkles className="size-4" aria-hidden="true" />
            Process Data
          </>
        )}
      </Button>
    </section>
  )
}
