import { DURATION_ONE_WEEK } from '@keywork/utils'

export type CacheControlHeader = HeadersInit & {
  'Cache-Control': string
}

export interface CacheControlOptions {
  [cacheControlKey: string]: number | boolean | string

  'max-age': number
  'must-revalidate': boolean
  immutable: boolean
}

export function createCacheControlHeader(options: Partial<CacheControlOptions> | undefined): CacheControlHeader {
  options = options || { 'max-age': DURATION_ONE_WEEK, 'must-revalidate': true }

  const headerValues: string[] = []

  for (const [key, value] of Object.entries(options)) {
    if (typeof value === 'boolean') {
      if (!value) continue

      headerValues.push(key)
    }

    headerValues.push(`${key}=${value}`)
  }

  return {
    'Cache-Control': headerValues.join(', '),
  }
}
