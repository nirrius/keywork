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

import type { KeyworkDocumentReference } from '../KeyworkDocumentReference.ts'

export interface PutOrPatchOptions {
  expiration?: number
  expirationTtl?: number
}

export type DeserializationTransformers = 'text' | 'json' | 'arrayBuffer' | 'stream'

export type DeserializationTypes = string | ArrayBuffer | typeof globalThis.ReadableStream

export interface KVNamespaceListOptions {
  limit?: number
  prefix?: string | null
  cursor?: string
}

export interface FetchListOptions extends Omit<KVNamespaceListOptions, 'prefix'> {}

export interface KVNamespaceListKey<Metadata> {
  name: string
  expiration?: number
  metadata?: Metadata
}

export interface KVNamespaceListResult<Metadata> {
  keys: KVNamespaceListKey<Metadata>[]
  list_complete: boolean
  cursor?: string
}

export interface CollectionDocumentReferencesResponse<ExpectedType extends DeserializationTypes | {}>
  extends KVNamespaceListResult<unknown> {
  documents: KeyworkDocumentReference<ExpectedType>[]
}
