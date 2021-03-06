/**
 * @file This file is part of the Keywork project.
 * @copyright Nirrius, LLC. All rights reserved.
 * @author Teffen Ellis, et al.
 * @license AGPL-3.0
 *
 * @remarks Keywork is free software for non-commercial purposes.
 * You can be released from the requirements of the license by purchasing a commercial license.
 * Buying such a license is mandatory as soon as you develop commercial activities
 * involving the Keywork software without disclosing the source code of your own applications.
 *
 * @see LICENSE.md in the project root for further licensing information.
 */

import { SpecifierMappings } from 'deno/dnt/transform'

export type KeyworkRuntime = 'common' | 'worker' | 'browser' | 'node' | 'cloudflare' | 'deno'
export const KeyworkRuntimes = new Set<KeyworkRuntime>([
  //
  'common',
  'worker',
  'browser',
  'node',
  'cloudflare',
  'deno',
])
export const compatibleRuntimes: Record<KeyworkRuntime, KeyworkRuntime[]> = {
  common: ['common'],
  worker: ['worker', 'common'],
  cloudflare: ['cloudflare', 'worker', 'common'],
  deno: ['deno', 'worker', 'common'],
  browser: ['browser', 'common'],
  node: ['node', 'common'],
}

export const RUNTIME_PLACEHOLDER = '{{RUNTIME}}'

/**
 * @internal
 * @deprecated
 * @todo FilePaths should be globbed.
 */
export function createRuntimeMappings(runtime: KeyworkRuntime, ...filePaths: string[]): SpecifierMappings {
  const mappings: Record<string, string> = {}
  const fromRuntime: KeyworkRuntime = runtime === 'worker' ? 'node' : 'worker'

  for (const filePath of filePaths) {
    mappings[filePath] = filePath.replaceAll(fromRuntime, runtime)
  }

  return mappings
}

/**
 * @deprecated
 */
export function isCompatibleWith(compatibleRuntime: KeyworkRuntime[], pathSegments: string[]): boolean {
  const specifierIsIncompatible = pathSegments.some((segment) => {
    if (!KeyworkRuntimes.has(segment as KeyworkRuntime)) return false

    return !compatibleRuntime.includes(segment as KeyworkRuntime)
  })

  return !specifierIsIncompatible

  // const remappedSpecifierWithRuntime = remappedSpecifier.replaceAll(RUNTIME_PLACEHOLDER, runtime)
}
