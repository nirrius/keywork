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

import { KeyworkResourceError } from 'keywork/errors'

import { renderToReadableStream } from 'react-dom/server.browser'
import { RenderReactStream } from './common.ts'

export const renderReactStream: RenderReactStream = async (children, options) => {
  const controller = new AbortController()
  let error: null | KeyworkResourceError = null

  const stream = await renderToReadableStream(children, {
    ...options,
    signal: controller.signal,
    onError(_error: any) {
      error = KeyworkResourceError.fromUnknownError(_error)
      console.error(error)
    },
  })

  return {
    stream,
    error,
    controller,
  }
}