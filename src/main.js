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
 * The path to the current working directory of the Node.js process.
 *
 * @private
 * @constant {string}
 */
const CWD_PATH = cwd()

/**
 * The path to the build directory in the current working directory.
 *
 * @private
 * @constant {string}
 */
const BUILD_DIR_PATH = join(CWD_PATH, 'build')

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
 * @throws {SuriError} If `suri.config.json` fails to be read or parsed.
 * @returns {Object} The parsed and merged config.
 */
async function loadConfig() {
  const configFilePath = join(CWD_PATH, 'suri.config.json')

  console.log(`Config file: ${configFilePath}`)

  let config

  try {
    config = await readFile(configFilePath)
  } catch (error) {
    if (!isErrorFileNotExists(error)) {
      throw new SuriError('Failed to load config file', error)
    }

    console.log('No config file found, using default config')

    return { ...defaultConfig }
  }

  try {
    config = JSON.parse(config)
  } catch (error) {
    throw new SuriError('Failed to parse config as JSON', error)
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
 * @throws {SuriError} If `links.json` fails to be loaded or parsed.
 * @returns {Object} The parsed links.
 */
async function loadLinks() {
  const linkFilePath = join(CWD_PATH, 'src', 'links.json')

  console.log(`Links file: ${linkFilePath}`)

  let links

  try {
    links = await readFile(linkFilePath)
  } catch (error) {
    throw new SuriError('Failed to load links file', error)
  }

  try {
    links = JSON.parse(links)
  } catch (error) {
    throw new SuriError('Failed to parse links as JSON', error)
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
 * @param {string} params.linkPath The shortlink path to redirect from.
 * @param {string} params.redirectURL The target URL to redirect to.
 * @param {Object} params.config The parsed and merged config.
 * @throws {SuriError} If the directory/file fails to be created.
 * @returns {true} If the link was created.
 */
async function createLink({ linkPath, redirectURL, config }) {
  const linkDirPath = join(BUILD_DIR_PATH, linkPath)

  console.log(`Creating link: ${linkPath}`)

  try {
    await mkdir(linkDirPath, { recursive: true })
  } catch (error) {
    throw new SuriError(`Failed to create link directory: ${linkPath}`, error)
  }

  try {
    await writeFile(
      join(linkDirPath, 'index.html'),
      buildLinkPage({ redirectURL, config }),
    )
  } catch (error) {
    throw new SuriError(`Failed to create link file: ${linkPath}`, error)
  }

  return true
}

/**
 * Copy the public directories/files to the build directory.
 *
 * The directory in this repository of "default" files is copied first, followed
 * by the directory in the current working directory, if it exists.
 *
 * @private
 * @throws {SuriError} If a directory/file fails to be copied.
 * @returns {true} If the directories/files were copied.
 */
async function copyPublic() {
  const publicDirPaths = [
    join(SURI_DIR_PATH, 'public'),
    join(CWD_PATH, 'public'),
  ]

  for (const publicDirPath of publicDirPaths) {
    console.log(`Copying public directory: ${publicDirPath}`)

    try {
      await cp(publicDirPath, BUILD_DIR_PATH, {
        preserveTimestamps: true,
        recursive: true,
      })
    } catch (error) {
      if (!isErrorFileNotExists(error)) {
        throw new SuriError('Failed to copy public directory', error)
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
 * @throws {SuriError} If the directory fails to be removed.
 * @returns {undefined} If the directory was removed.
 */
async function removeBuild() {
  try {
    return await rm(BUILD_DIR_PATH, { recursive: true, force: true })
  } catch (error) {
    throw new SuriError('Failed to remove build directory', error)
  }
}

/**
 * Build the static site from a `links.json` file.
 *
 * @memberof module:suri
 * @throws {SuriError} If the build fails.
 * @returns {true} If the build succeeds.
 */
async function main() {
  try {
    await removeBuild()

    const config = await loadConfig()
    const links = await loadLinks()

    for (const [linkPath, redirectURL] of Object.entries(links)) {
      await createLink({ linkPath, redirectURL, config })
    }

    await copyPublic()

    console.log('Done!')

    return true
  } catch (error) {
    await removeBuild()

    throw error
  }
}

/** @module suri */
export default main
export { SuriError }
