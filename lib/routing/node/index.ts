/* eslint-disable header/header */
// @ts-no-check
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

/**
 * ### `keywork/routing/node`
 *
 * Everything you need to handle incoming requests in a Worker environment.
 *
 * @packageDocumentation
 * @module routing.node
 */

export * from 'keywork/routing/common'
export * from 'keywork/routing/worker'
import { WorkerRouter } from 'keywork/routing'
import { Request } from 'keywork/platform/http'

import { IncomingMessage, ServerResponse } from 'http'

// const { IncomingMessage, ServerResponse } = await import('node:' + 'http')

/**
 * Node-compatible callback for use with `http.createServer`
 */
export type ServerHandler = (req: IncomingMessage, res: ServerResponse) => void

/** @internal */
export type ProcessChunkCallback = (chunkResult: ReadableStreamDefaultReadResult<Uint8Array>) => Promise<void>

/**
 * Given a `WorkerRouter`, responds to an incoming request from a Node server.
 *
 * @example
 *
 * ```ts
 * import * as http from 'node:http'
 * import { WorkerRouter } from 'keywork/routing'
 * import { respondWithRouter } from 'keywork/routing/node'
 *
 * const router = new WorkerRouter()
 * http.createServer((req, res) => {
 *   respondWithRouter(router, req, res)
 * })
 * ```
 * @see {createServerHandler}
 * @beta Node support is currently experimental and may change in the near future.
 */
export async function respondWithRouter(
  router: WorkerRouter,
  nodeRequest: IncomingMessage,
  nodeResponse: ServerResponse
): Promise<void> {
  const request = new Request(nodeRequest.url || 'http://0.0.0.0', nodeRequest as unknown as RequestInit)
  const response = await router.fetch(request)

  nodeResponse.statusCode = response.status
  nodeResponse.statusMessage = response.statusText

  for (const [name, value] of response.headers.entries()) {
    nodeResponse.setHeader(name, value)
  }

  if (response.body) {
    const reader = response.body.getReader()
    const processChunk: ProcessChunkCallback = async ({ done, value }) => {
      nodeResponse.write(value)

      if (!done) {
        await reader.read().then(processChunk)
      }
    }

    await reader.read().then(processChunk)
  }
}

/**
 * Given a `WorkerRouter`, creates a Node-compatible server handler.
 *
 * @example
 *
 * ```ts
 * import * as http from 'node:http'
 * import { WorkerRouter } from 'keywork/routing'
 * import { createServerHandler } from 'keywork/routing/node'
 *
 * const router = new WorkerRouter()
 * http.createServer(createServerHandler(router))
 * ```
 *
 * @see {respondWithRouter}
 * @beta Node support is currently experimental and may change in the near future.
 */
export function createServerHandler(router: WorkerRouter): ServerHandler {
  return (req, res) => respondWithRouter(router, req, res)
}