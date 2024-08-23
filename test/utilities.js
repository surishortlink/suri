import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const TEMPLATES_DIR_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'templates',
)

function joinTemplates(...paths) {
  return join(TEMPLATES_DIR_PATH, ...paths)
}

async function readTemplatesFile(...paths) {
  return await readFile(joinTemplates(...paths), { encoding: 'utf8' })
}

export { joinTemplates, readTemplatesFile }
