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

import * as fs from 'fs/promises'
import { readFileSync } from 'fs'
import * as path from 'path'
import TypeDoc from 'typedoc'
import { MarkdownTheme } from 'typedoc-plugin-markdown'
import { checkFileExists } from '../common/files/index.js'
import { projectPath } from '../common/paths/index.js'
import * as ProjectFiles from '../common/project/index.js'

export interface CategoryConfig {
  name?: string
  label?: string
  dirName?: string
  collapsible?: boolean
  collapsed?: boolean
  position?: number
}

export interface MarkdownThemeOptions {
  /**
   * Do not render page title.
   * @defaultValue false
   */
  hidePageTitle: boolean

  /**
   * Do not render breadcrumbs in template.
   * @defaultValue false
   */
  hideBreadcrumbs: boolean

  /**
   * Specifies the base path that all links to be served from. If omitted all urls will be relative.
   */
  publicPath: string

  /**
   * Use HTML named anchors as fragment identifiers for engines that do not automatically assign header ids. Should be set for Bitbucket Server docs.
   * @defaultValue false
   */
  namedAnchors: boolean

  /**
   * Output all reflections into seperate output files.
   * @defaultValue false
   */
  allReflectionsHaveOwnDocument: boolean

  /**
   * Separator used to format filenames.
   * @defaultValue '.'
   */
  filenameSeparator: string

  /**
   * The file name of the entry document.
   * @defaultValue 'README.md'
   */
  entryDocument: string

  /**
   * Do not render in-page table of contents items.
   * @defaultValue false
   */
  hideInPageTOC: boolean

  /** Customise the index page title. */
  indexTitle: string

  /**
   * Do not add special symbols for class members.
   * @defaultValue false
   */
  hideMembersSymbol: boolean

  /**
   * Preserve anchor casing when generating links.
   * @defaultValue false
   */
  preserveAnchorCasing: boolean
}

const defaultCategory: CategoryConfig = {
  collapsible: true,
  collapsed: true,
}

const READ_PREFIX = '/nirrius/keywork/blob/main/modules'
const EDIT_PREFIX = '/nirrius/keywork/edit/main/modules'

class DocusaurusMarkdownTheme extends MarkdownTheme {
  // Somewhat brittle but this handles anchor links.
  static _markdownExtensionPattern = /\.md/

  _modelToFrontMatter(model: TypeDoc.ContainerReflection) {
    const isModule = model.kind === TypeDoc.ReflectionKind.Module
    const position = isModule ? 999 : undefined
    const kindString = model.kindString || 'Index'
    const title = `${kindString}: ${model.name}`
    const sidebarLabel = isModule ? 'API Usage???' : model.originalName
    const className = `doc-kind-${kindString.toLowerCase()}`

    return { title, sidebarLabel, className, position }
  }

  /**
   * @returns Template output with front matter
   */
  _renderWithFrontMatter<T extends TypeDoc.ContainerReflection>(
    template: (pageEvent: TypeDoc.PageEvent<T>) => string,
    pageEvent: TypeDoc.PageEvent<T>
  ) {
    const templateOutput = template(pageEvent)

    if (!templateOutput.trim()) return templateOutput

    const { title, sidebarLabel, className, position } = this._modelToFrontMatter(pageEvent.model)

    const output = [
      '---',
      `title: "${title}"`,
      `sidebar_label: "${sidebarLabel}"`,
      `sidebar_class_name: "${className}"`,
    ]

    if (typeof position !== 'undefined') {
      output.push(`position: ${position}`)
    }

    if (pageEvent.model.sources?.[0]) {
      const [source] = pageEvent.model.sources

      // Omit Deno deps
      if (!source.fileName.startsWith('deps')) {
        const sourceMapPath = source.fullFileName + '.map'
        const sourceMap = JSON.parse(readFileSync(sourceMapPath, 'utf8'))
        const [baseSourceFileName] = sourceMap.sources
        const sourcePath = path.join(
          path.dirname(source.fullFileName).substring(ProjectFiles.OutDirectory.length),
          baseSourceFileName
        )

        const sourceURL = 'https://github.com' + path.posix.join(READ_PREFIX, sourcePath)
        const customEditURL = 'https://github.com' + path.posix.join(EDIT_PREFIX, sourcePath)

        if (!source.url) {
          source.url = sourceURL
        }

        // console.log(source)
        // console.log(sourceMapPath)
        // console.log(customEditURL)
        output.push(`source_url: ${sourceURL}`)
        output.push(`custom_edit_url: ${customEditURL}`)
      }
    }

    output.push('---', '\n', '\n', templateOutput)

    return output.join('\n')
  }

  getIndexTemplate() {
    const indexTemplate = super.getIndexTemplate()

    return (pageEvent: TypeDoc.PageEvent<TypeDoc.ContainerReflection>) => {
      return this._renderWithFrontMatter(indexTemplate, pageEvent)
    }
  }

  getReflectionTemplate() {
    const reflectionTemplate = super.getReflectionTemplate()

    return (pageEvent: TypeDoc.PageEvent<TypeDoc.ContainerReflection>) => {
      if (pageEvent.model.kind === TypeDoc.ReflectionKind.Module) {
        pageEvent.model.kind = TypeDoc.ReflectionKind.Module
        pageEvent.model.kindString = 'Module'
      }

      return this._renderWithFrontMatter(reflectionTemplate, pageEvent)
    }
  }

  normalizeURLPathSegments(urlPath: string): string {
    return urlPath.replaceAll('_', '-')
  }

  normalizeURLPath(urlPath: string): string {
    return (
      urlPath
        //
        .replace(DocusaurusMarkdownTheme._markdownExtensionPattern, '')
        .replaceAll('_', '-')
    )
  }

  _fixURLs(_project: TypeDoc.ProjectReflection, urlMappings: TypeDoc.UrlMapping[]) {
    for (const urlMapping of urlMappings) {
      urlMapping.url = this.normalizeURLPathSegments(urlMapping.url)

      if (urlMapping.model) {
        urlMapping.model.url = this.normalizeURLPath(urlMapping.model.url)

        if (urlMapping.model.children) {
          for (const child of urlMapping.model.children) {
            child.url = this.normalizeURLPath(child.url)
          }
        }
      }
    }

    return urlMappings
  }

  getUrls(project: TypeDoc.ProjectReflection) {
    const urlMappings = this._fixURLs(project, super.getUrls(project))

    return urlMappings
  }
}

export class DocusaurusTypeDoc extends TypeDoc.Application {
  constructor() {
    super()
    this.options.addReader(new TypeDoc.TSConfigReader())
  }

  categories = [
    { dirName: 'classes', config: { label: 'Classes' } },
    { dirName: 'interfaces', config: { label: 'Interfaces' } },
    { dirName: 'enums', config: { label: 'Enums' } },
  ]

  async generateDocs(project: TypeDoc.ProjectReflection, out: string) {
    await super.generateDocs(project, out)
    await fs.rm(path.join(out, 'modules'), { force: true, recursive: true })

    // Add a category configuration to the API root.
    for (const [index, category] of Object.entries(this.categories)) {
      const categoryDir = path.join(out, category.dirName)
      const exists = await checkFileExists(categoryDir)

      if (!exists) continue

      await fs.mkdir(categoryDir, { recursive: true })
      await fs.writeFile(
        path.join(categoryDir, ProjectFiles.Category),
        JSON.stringify(
          {
            ...defaultCategory,
            position: 99 + parseInt(index, 10),
            ...category.config,
          },
          null,
          2
        ),
        'utf8'
      )
    }
  }

  /**
   * Initialize TypeDoc with the given options object.
   * Patches the Markdown theme to better align with Docusaurus's expected output.
   *
   */
  bootstrap(options: Partial<TypeDoc.TypeDocOptions & MarkdownThemeOptions>) {
    super.bootstrap({
      ...options,
      tsconfig: projectPath('dist', 'tsconfig.json'),
      plugin: ['typedoc-plugin-markdown', ...(options.plugin || [])],
    })

    const renderer = this.renderer as any

    if (!renderer.themes.has('markdown')) {
      throw new Error('Markdown theme not present')
    }

    renderer.themes.set('markdown', DocusaurusMarkdownTheme)

    Object.defineProperty(this.renderer, 'cname', {
      get() {
        return ''
      },
    })

    Object.defineProperty(this.renderer, 'githubPages', {
      get() {
        return ''
      },
    })
  }
}
