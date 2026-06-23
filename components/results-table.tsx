'use client'

import type { ClinicalRecord } from '@/app/actions/extract'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Database,
  Info,
  Loader2,
  Pill,
  TableProperties,
} from 'lucide-react'

interface ResultsTableProps {
  records: ClinicalRecord[]
  isProcessing: boolean
  hasProcessed: boolean
  error: string | null
  notice: string | null
  onSave: () => void
}

const COLUMNS = [
  { key: 'patientAge', label: 'Patient Age' },
  { key: 'gender', label: 'Gender' },
  { key: 'medication', label: 'Medication' },
  { key: 'dosage', label: 'Dosage' },
  { key: 'symptoms', label: 'Symptoms' },
] as const

function CellValue({ value }: { value: string }) {
  if (!value || value.trim() === '') {
    return <span className="text-muted-foreground/50">—</span>
  }
  return <span>{value}</span>
}

export function ResultsTable({
  records,
  isProcessing,
  hasProcessed,
  error,
  notice,
  onSave,
}: ResultsTableProps) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <TableProperties className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Extracted Records
          </h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 font-mono text-xs text-muted-foreground">
          <Database className="size-3" aria-hidden="true" />
          {records.length} {records.length === 1 ? 'row' : 'rows'}
        </span>
      </div>

      {notice && records.length > 0 && (
        <div className="flex items-start gap-2 border-b border-border bg-accent/40 px-5 py-3">
          <Info
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="text-xs text-muted-foreground">{notice}</p>
        </div>
      )}

      <div className="relative flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-secondary/80 backdrop-blur">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, i) => (
              <tr
                key={i}
                className="border-b border-border/60 transition-colors hover:bg-secondary/40"
              >
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={
                      col.key === 'medication'
                        ? 'px-4 py-3 align-top font-medium text-foreground'
                        : 'px-4 py-3 align-top text-foreground/90'
                    }
                  >
                    {col.key === 'medication' && record[col.key] ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Pill
                          className="size-3.5 text-primary"
                          aria-hidden="true"
                        />
                        {record[col.key]}
                      </span>
                    ) : (
                      <CellValue value={record[col.key]} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty / loading / error states */}
        {records.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            {isProcessing ? (
              <>
                <Loader2
                  className="size-7 animate-spin text-primary"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  Analyzing clinical note and structuring records…
                </p>
              </>
            ) : error ? (
              <>
                <AlertCircle
                  className="size-7 text-destructive"
                  aria-hidden="true"
                />
                <p className="text-sm text-destructive">{error}</p>
              </>
            ) : (
              <>
                <div className="flex size-12 items-center justify-center rounded-full border border-border bg-secondary/50">
                  <Database
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="max-w-xs text-sm text-muted-foreground">
                  {hasProcessed
                    ? 'No structured records were found in this note.'
                    : 'Extracted patient and medication data will appear here after processing.'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <p className="text-xs text-muted-foreground">
          {records.length > 0
            ? `${records.length} ${records.length === 1 ? 'record' : 'records'} ready to persist.`
            : 'Process a note to enable saving.'}
        </p>
        <Button
          type="button"
          onClick={onSave}
          disabled={records.length === 0 || isProcessing}
        >
          <Database className="size-4" aria-hidden="true" />
          Save to Database
        </Button>
      </div>
    </section>
  )
}
