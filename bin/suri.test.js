import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { execPath } from 'node:process'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { joinTemplates } from '../test/utilities.js'

const SURI_BIN_PATH = join(dirname(fileURLToPath(import.meta.url)), 'suri.js')

const execFileAsync = promisify(execFile)

async function runSuri({ cwd }) {
  return await execFileAsync(execPath, [SURI_BIN_PATH], { cwd })
}

describe('suri', () => {
  it('builds the static site from the current working directory', async () => {
    const { stdout } = await runSuri({ cwd: joinTemplates('pass_cli') })

    assert.match(stdout, /Done!\n$/)
    assert.equal(
      await access(joinTemplates('pass_cli', 'build', 'index.html')),
      undefined,
    )
  })

  it('prints the error and its cause, and exits with code 1', async () => {
    await assert.rejects(
      async () => {
        await runSuri({ cwd: joinTemplates('fail_cli') })
      },
      {
        code: 1,
        // The cause is matched loosely because `JSON.parse` error messages
        // vary between Node.js versions.
        stderr: /^Error: Failed to parse links as JSON\n {2}↳ .+\n$/,
      },
    )
  })
})
