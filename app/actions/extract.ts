'use server'

import { generateText, Output } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const recordSchema = z.object({
  patientAge: z
    .string()
    .describe('Patient age as written, e.g. "54" or "54 years". Empty string if not mentioned.'),
  gender: z
    .string()
    .describe('Patient gender, e.g. "Male", "Female". Empty string if not mentioned.'),
  medication: z
    .string()
    .describe('Name of a single prescribed or mentioned medication.'),
  dosage: z
    .string()
    .describe('Dosage and frequency for that medication, e.g. "500mg twice daily". Empty string if not mentioned.'),
  symptoms: z
    .string()
    .describe('Comma-separated symptoms or conditions relevant to this medication.'),
})

const extractionSchema = z.object({
  records: z
    .array(recordSchema)
    .describe(
      'One row per medication mentioned in the note. If no medication is found, return a single row with the patient details and empty medication/dosage.',
    ),
})

export type ClinicalRecord = z.infer<typeof recordSchema>

export type ExtractResult =
  | { ok: true; records: ClinicalRecord[]; source: 'ai' | 'mock'; notice?: string }
  | { ok: false; error: string }

// Realistic fallback data shown when the live AI call fails (e.g. 429 quota).
// Keeps the demo functional without a working Gemini quota.
const MOCK_RECORDS: ClinicalRecord[] = [
  {
    patientAge: '54',
    gender: 'Male',
    medication: 'Metformin',
    dosage: '500mg twice daily',
    symptoms: 'Type 2 diabetes, fatigue, increased thirst',
  },
  {
    patientAge: '67',
    gender: 'Female',
    medication: 'Lisinopril',
    dosage: '10mg once daily',
    symptoms: 'Hypertension, occasional headaches',
  },
  {
    patientAge: '42',
    gender: 'Female',
    medication: 'Atorvastatin',
    dosage: '20mg at bedtime',
    symptoms: 'High cholesterol, chest tightness',
  },
  {
    patientAge: '38',
    gender: 'Male',
    medication: 'Amoxicillin',
    dosage: '500mg every 8 hours for 7 days',
    symptoms: 'Acute bacterial sinusitis, fever, nasal congestion',
  },
  {
    patientAge: '71',
    gender: 'Male',
    medication: 'Warfarin',
    dosage: '5mg once daily',
    symptoms: 'Atrial fibrillation, shortness of breath',
  },
]

export async function extractClinicalData(note: string): Promise<ExtractResult> {
  const trimmed = note.trim()

  if (!trimmed) {
    return { ok: false, error: 'Please paste a clinical note before processing.' }
  }

  try {
    const { experimental_output } = await generateText({
      model: google('gemini-2.0-flash'),
      system:
        'You are a clinical data extraction engine for a healthcare platform. ' +
        'You read unstructured doctor notes and extract structured patient and medication data. ' +
        'Be precise and never invent values. If a field is not present in the note, return an empty string for it. ' +
        'Create one record per distinct medication mentioned. Normalize gender to "Male" or "Female" when clear.',
      prompt: `Extract structured clinical data from the following note:\n\n"""\n${trimmed}\n"""`,
      experimental_output: Output.object({ schema: extractionSchema }),
    })

    return { ok: true, records: experimental_output.records, source: 'ai' }
  } catch (error) {
    console.log('[v0] extractClinicalData error, falling back to mock data:', error)

    const status =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error as { statusCode?: number }).statusCode
        : undefined

    const notice =
      status === 429
        ? 'Gemini quota reached — showing sample data so the demo stays functional.'
        : status === 401 || status === 403
          ? 'Gemini authentication failed — showing sample data so the demo stays functional.'
          : 'Live extraction unavailable — showing sample data so the demo stays functional.'

    // Always keep the demo usable: return realistic mock records on any failure.
    return { ok: true, records: MOCK_RECORDS, source: 'mock', notice }
  }
}
