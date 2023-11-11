import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { cwd } from 'node:process'
import { fileURLToPath } from 'node:url'
import SuriError from './error.js'

const SURI_DIR_PATH = join(dirname(fileURLToPath(import.meta.url)), '..')
const CWD_PATH = cwd()
const BUILD_DIR_PATH = join(CWD_PATH, 'build')

const html = String.raw

const defaultConfig = {
  js: false,
}

function isErrorFileNotExists(error) {
  return error.code === 'ENOENT'
}

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

async function removeBuild() {
  try {
    return await rm(BUILD_DIR_PATH, { recursive: true, force: true })
  } catch (error) {
    throw new SuriError('Failed to remove build directory', error)
  }
}

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

export default main
export { SuriError }
