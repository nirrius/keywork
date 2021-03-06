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

import type { BuildOptions } from 'esbuild'

/**
 * ESBuild options for the browser bundle.
 *
 * @public
 * @category ESBuild
 */
export function createBrowserBuildOptions(entryPoints: string[], outdir: string): BuildOptions {
  return {
    bundle: true,
    entryPoints,
    format: 'esm',
    keepNames: true,
    outdir,
    platform: 'browser',
    banner: {
      js: `/**
* @file This bundle is generated to run in browser environment.
*/
/* eslint-disable */`,
    },
  }
}
