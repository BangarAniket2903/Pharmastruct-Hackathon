'use server'

import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { nanoid } from 'nanoid'
import { docClient, TABLE_NAME } from '@/lib/db'
import type { ClinicalRecord } from '@/app/actions/extract'

export type SaveResult =
  | { ok: true; savedCount: number }
  | { ok: false; error: string }

// DynamoDB BatchWrite accepts a maximum of 25 items per request.
const BATCH_SIZE = 25

export async function saveRecords(
  records: ClinicalRecord[],
): Promise<SaveResult> {
  if (!records || records.length === 0) {
    return { ok: false, error: 'There are no records to save.' }
  }

  const savedAt = new Date().toISOString()

  // Generate a unique recordId for every entry.
  const items = records.map((record) => ({
    recordId: nanoid(),
    patientAge: record.patientAge,
    gender: record.gender,
    medication: record.medication,
    dosage: record.dosage,
    symptoms: record.symptoms,
    savedAt,
  }))

  try {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE)
      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: batch.map((Item) => ({ PutRequest: { Item } })),
          },
        }),
      )
    }

    return { ok: true, savedCount: items.length }
  } catch (error) {
    console.log('[v0] saveRecords error:', error)
    return {
      ok: false,
      error:
        'Failed to save records to DynamoDB. Verify the PharmaStructRecords table exists and the AWS role has write access.',
    }
  }
}
