import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { cwd } from 'node:process'
import { fileURLToPath } from 'node:url'
import SuriError from './error.js'

/**
 * The path to the root directory of this repository.
 *
 * @private
 * @constant {string}
 */
const SURI_DIR_PATH = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Tagged template function for composing HTML.
 *
 * @private
 * @function
 * @param {string} htmlString The template literal with optional substitutions.
 * @returns {string} The raw HTML string of the given template literal.
 */
const html = String.raw

/**
 * The default config values that `suri.config.json` supersedes.
 *
 * @private
 * @namespace
 * @property {boolean} js Whether to redirect with JavaScript instead of a `<meta>` refresh.
 */
const defaultConfig = {
  js: false,
}

/**
 * Check whether an error is the result of a file not existing.
 *
 * @private
 * @param {Error} error The error that was thrown.
 * @returns {boolean}
 */
function isErrorFileNotExists(error) {
  return error.code === 'ENOENT'
}

/**
 * Load the config from `suri.config.json`, if it exists, merged with defaults.
 *
 * @private
 * @param {Object} params
 * @param {string} params.path The path to the `suri.config.json` file to load.
 * @throws {SuriError} If `suri.config.json` fails to be read or parsed.
 * @returns {Object} The parsed and merged config.
 */
async function loadConfig({ path }) {
  console.log(`Config file: ${path}`)

  let config

  try {
    config = await readFile(path)
  } catch (cause) {
    if (!isErrorFileNotExists(cause)) {
      throw new SuriError('Failed to load config file', { cause })
    }

    console.log('No config file found, using default config')

    return { ...defaultConfig }
  }

  try {
    config = JSON.parse(config)
  } catch (cause) {
    throw new SuriError('Failed to parse config as JSON', { cause })
  }

  return {
    ...defaultConfig,
    ...config,
  }
}

/**
 * Load the links from `links.json`.
 *
 * @private
 * @param {Object} params
 * @param {string} params.path The path to the `links.json` file to load.
 * @throws {SuriError} If `links.json` fails to be loaded or parsed.
 * @returns {Object} The parsed links.
 */
async function loadLinks({ path }) {
  console.log(`Links file: ${path}`)

  let links

  try {
    links = await readFile(path)
  } catch (cause) {
    throw new SuriError('Failed to load links file', { cause })
  }

  try {
    links = JSON.parse(links)
  } catch (cause) {
    throw new SuriError('Failed to parse links as JSON', { cause })
  }

  return links
}

/**
 * Build the HTML page for a link.
 *
 * @private
 * @param {Object} params
 * @param {string} params.redirectURL The target URL to redirect to.
 * @param {Object} params.config The parsed and merged config.
 * @returns {string} The HTML page.
 */
function buildLinkPage({ redirectURL, config }) {
  return html`
    <!doctype html>
    ${config.js
      ? html`
          <script>
            window.location.replace('${redirectURL}')
          </script>
        `
      : html`<meta http-equiv="refresh" content="0; url=${redirectURL}" />`}
  `
}

/**
 * Create a link by building the HTML page and saving it to the build directory.
 *
 * @private
 * @param {Object} params
 * @param {string} params.linkPath The short link path to redirect from.
 * @param {string} params.redirectURL The target URL to redirect to.
 * @param {Object} params.config The parsed and merged config.
 * @param {string} params.buildDirPath The path to the build directory.
 * @throws {SuriError} If the directory/file fails to be created.
 * @returns {true} If the link was created.
 */
async function createLink({ linkPath, redirectURL, config, buildDirPath }) {
  const linkDirPath = join(buildDirPath, linkPath)

  console.log(`Creating link: ${linkPath}`)

  try {
    await mkdir(linkDirPath, { recursive: true })
  } catch (cause) {
    throw new SuriError(`Failed to create link directory: ${linkPath}`, {
      cause,
    })
  }

  try {
    await writeFile(
      join(linkDirPath, 'index.html'),
      buildLinkPage({ redirectURL, config }),
    )
  } catch (cause) {
    throw new SuriError(`Failed to create link file: ${linkPath}`, { cause })
  }

  return true
}

/**
 * Copy the public directories/files to the build directory.
 *
 * The directory in this repository of "default" files is copied first, followed
 * by the directory in the source directory, if it exists.
 *
 * @private
 * @param {Object} params
 * @param {string} params.path The path to the public directory to copy.
 * @param {string} params.buildDirPath The path to the build directory.
 * @throws {SuriError} If a directory/file fails to be copied.
 * @returns {true} If the directories/files were copied.
 */
async function copyPublic({ path, buildDirPath }) {
  const publicDirPaths = [join(SURI_DIR_PATH, 'public'), path]

  for (const publicDirPath of publicDirPaths) {
    console.log(`Copying public directory: ${publicDirPath}`)

    try {
      await cp(publicDirPath, buildDirPath, {
        preserveTimestamps: true,
        recursive: true,
      })
    } catch (cause) {
      if (!isErrorFileNotExists(cause)) {
        throw new SuriError('Failed to copy public directory', { cause })
      }

      console.log('No public directory found, skipping')
    }
  }

  return true
}

/**
 * Remove the build directory and all of its child directories/files.
 *
 * @private
 * @param {Object} params
 * @param {string} params.path The path to the build directory to remove.
 * @throws {SuriError} If the directory fails to be removed.
 * @returns {undefined} If the directory was removed.
 */
async function removeBuild({ path }) {
  try {
    return await rm(path, { recursive: true, force: true })
  } catch (cause) {
    throw new SuriError('Failed to remove build directory', { cause })
  }
}

/**
 * Build the static site from a `links.json` file.
 *
 * @memberof module:suri
 * @param {Object} [params]
 * @param {string} [params.path] The path to the directory to build from. Defaults to the current working directory of the Node.js process.
 * @throws {SuriError} If the build fails.
 * @returns {true} If the build succeeds.
 */
async function main({ path = cwd() } = {}) {
  try {
    await removeBuild({ path: join(path, 'build') })

    const config = await loadConfig({ path: join(path, 'suri.config.json') })
    const links = await loadLinks({ path: join(path, 'src', 'links.json') })

    for (const [linkPath, redirectURL] of Object.entries(links)) {
      await createLink({
        linkPath,
        redirectURL,
        config,
        buildDirPath: join(path, 'build'),
      })
    }

    await copyPublic({
      path: join(path, 'public'),
      buildDirPath: join(path, 'build'),
    })

    console.log('Done!')

    return true
  } catch (error) {
    await removeBuild({ path: join(path, 'build') })

    throw error
  }
}

/** @module suri */
export default main
export { SuriError }
