export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-07-15'

const fallbackProjectId = 'aoxze287'
const fallbackDataset = 'production'

function sanitizeProjectId(raw?: string) {
  const value = (raw || fallbackProjectId).trim()
  const normalized = value.replace(/\s+/g, '')
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new Error(
      `Invalid Sanity projectId "${normalized}". Use only lowercase a-z, 0-9, and dashes.`
    )
  }
  return normalized
}

function sanitizeDataset(raw?: string) {
  const value = (raw || fallbackDataset).trim()
  const normalized = value.replace(/\s+/g, '')
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new Error(
      `Invalid Sanity dataset "${normalized}". Use only lowercase a-z, 0-9, and dashes.`
    )
  }
  return normalized
}

export const dataset = sanitizeDataset(process.env.NEXT_PUBLIC_SANITY_DATASET)
export const projectId = sanitizeProjectId(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
)
