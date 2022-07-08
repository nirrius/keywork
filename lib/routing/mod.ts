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
 * ### `keywork/routing`
 *
 * Everything you need to handle incoming requests in a Worker environment.
 *
 * - Server-side rendering from your worker, made even faster with streamed responses.
 * - Routing helpers with a low-mental overhead that make splitting your app into separate workers a breeze.
 * - Utilities for parsing paths and URLs.
 *
 * @packageDocumentation
 * @module routing
 */

export * from './RedirectHandler.ts'
export * from './request.ts'
export * from './RouteRequestHandler.ts'
export * from './ServiceBindingRouter.ts'
export * from './WorkerRouter/index.ts'