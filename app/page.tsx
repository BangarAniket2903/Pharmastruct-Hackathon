'use client'

import { useState, useTransition } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { NoteInput } from '@/components/note-input'
import { ResultsTable } from '@/components/results-table'
import { extractClinicalData, type ClinicalRecord } from '@/app/actions/extract'

export default function Page() {
  const [note, setNote] = useState('')
  const [records, setRecords] = useState<ClinicalRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [hasProcessed, setHasProcessed] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleProcess() {
    // Re-entrancy guard: never fire while a request is in flight or the note is empty.
    // The AI extraction must ONLY run from this explicit user-triggered handler.
    if (isPending || note.trim().length === 0) return

    setError(null)
    setNotice(null)
    startTransition(async () => {
      const result = await extractClinicalData(note)
      if (result.ok) {
        setRecords(result.records)
        setNotice(result.notice ?? null)
        setHasProcessed(true)
      } else {
        setRecords([])
        setError(result.error)
        setHasProcessed(true)
      }
    })
  }

  function handleSaveToDatabase() {
    // Placeholder for the upcoming database step.
    console.log('[v0] Save to Database clicked — records ready to persist:', records)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">
              Clinical Note Extraction
            </h2>
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              Transform unstructured physician notes into structured,
              query-ready patient records.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <NoteInput
              value={note}
              onChange={setNote}
              onProcess={handleProcess}
              isProcessing={isPending}
              charCount={note.length}
            />
            <ResultsTable
              records={records}
              isProcessing={isPending}
              hasProcessed={hasProcessed}
              error={error}
              notice={notice}
              onSave={handleSaveToDatabase}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
