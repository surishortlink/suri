import assert from 'node:assert/strict'
import { access, chmod, mkdir, rm, writeFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import main from './main.js'
import { joinTemplates, readTemplatesFile } from '../test/utilities.js'

describe('main', () => {
  describe('removes build directory', () => {
    it('removes existing build directory at start', async () => {
      const testFilePath = joinTemplates('pass', 'build', 'test.txt')

      await mkdir(joinTemplates('pass', 'build'), { recursive: true })
      await writeFile(testFilePath, 'test')

      await main({ path: joinTemplates('pass') })

      await assert.rejects(
        async () => {
          await access(testFilePath)
        },
        {
          name: 'Error',
          code: 'ENOENT',
        },
      )
    })

    it('removes build directory when an error occurs', async () => {
      await assert.rejects(async () => {
        await main({ path: joinTemplates('fail_config_json') })
      })

      await assert.rejects(
        async () => {
          await access(joinTemplates('fail_config_json', 'build'))
        },
        {
          name: 'Error',
          code: 'ENOENT',
        },
      )
    })

    it('throws `SuriError` when build directory fails to be removed', async () => {
      const buildDirPath = joinTemplates('fail_build_remove', 'build')

      await mkdir(buildDirPath, { recursive: true })
      await writeFile(
        joinTemplates('fail_build_remove', 'build', 'fail.txt'),
        'fail',
      )
      await chmod(buildDirPath, 0o000)

      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_build_remove') })
        },
        {
          name: 'SuriError',
          message: 'Failed to remove build directory',
        },
      )

      await chmod(buildDirPath, 0o777)
    })
  })

  describe('loads config', () => {
    it('throws `SuriError` when `suri.config.json` fails to be read', async () => {
      const configFilePath = joinTemplates(
        'fail_config_json_read',
        'suri.config.json',
      )

      await writeFile(configFilePath, 'fail', { mode: 0o000 })

      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_config_json_read') })
        },
        {
          name: 'SuriError',
          message: 'Failed to load config file',
        },
      )

      await rm(configFilePath)
    })

    it('throws `SuriError` when `suri.config.json` fails to be parsed as JSON', async () => {
      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_config_json') })
        },
        {
          name: 'SuriError',
          message: 'Failed to parse config as JSON',
        },
      )
    })
  })

  describe('creates links', () => {
    it('creates the `/` link in the root directory', async () => {
      await main({ path: joinTemplates('pass') })

      assert.equal(
        await readTemplatesFile('pass', 'build', 'index.html'),
        '\n    <!doctype html>\n    <meta http-equiv="refresh" content="0; url=https://www.youtube.com/watch?v=CsHiG-43Fzg" />\n  ',
      )
    })

    it('creates a link consisting of letters in a directory of the same name', async () => {
      await main({ path: joinTemplates('pass') })

      assert.equal(
        await readTemplatesFile('pass', 'build', 'gh', 'index.html'),
        '\n    <!doctype html>\n    <meta http-equiv="refresh" content="0; url=https://github.com/surishortlink/suri" />\n  ',
      )
    })

    it('creates a link consisting of numbers in a directory of the same name', async () => {
      await main({ path: joinTemplates('pass') })

      assert.equal(
        await readTemplatesFile('pass', 'build', '1', 'index.html'),
        '\n    <!doctype html>\n    <meta http-equiv="refresh" content="0; url=https://fee.org/articles/the-use-of-knowledge-in-society/" />\n  ',
      )
    })

    it('creates links with JavaScript redirect if `js` config enabled', async () => {
      await main({ path: joinTemplates('pass_js') })

      assert.equal(
        await readTemplatesFile('pass_js', 'build', 'index.html'),
        "\n    <!doctype html>\n    \n          <script>\n            window.location.replace('https://www.youtube.com/watch?v=CsHiG-43Fzg')\n          </script>\n        \n  ",
      )
    })

    it('throws `SuriError` when `links.json` fails to be read', async () => {
      const linksFilePath = joinTemplates(
        'fail_links_json_read',
        'src',
        'suri.config.json',
      )

      await writeFile(linksFilePath, 'fail', { mode: 0o000 })

      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_links_json_read') })
        },
        {
          name: 'SuriError',
          message: 'Failed to load links file',
        },
      )

      await rm(linksFilePath)
    })

    it('throws `SuriError` when `links.json` fails to be parsed as JSON', async () => {
      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_links_json') })
        },
        {
          name: 'SuriError',
          message: 'Failed to parse links as JSON',
        },
      )
    })

    it.skip('throws `SuriError` when a link directory fails to be created', async () => {
      // TODO: Figure out how to test this.
    })

    it.skip('throws `SuriError` when a link file fails to be created', async () => {
      // TODO: Figure out how to test this.
    })
  })

  describe('copies public files', () => {
    it('copies public files from this repository as "defaults"', async () => {
      await main({ path: joinTemplates('pass') })

      assert.equal(
        await access(joinTemplates('pass', 'build', 'favicon.ico')),
        undefined,
      )
    })

    it('copies public files from this repository even if no source directory exists', async () => {
      await main({ path: joinTemplates('pass_no_public') })

      assert.equal(
        await readTemplatesFile('pass_no_public', 'build', 'robots.txt'),
        'User-agent: *\nDisallow: /\n',
      )
    })

    it('copies public files from the source directory, overwriting "defaults"', async () => {
      await main({ path: joinTemplates('pass') })

      assert.equal(
        await readTemplatesFile('pass', 'build', 'robots.txt'),
        'User-agent: Google\nDisallow: /\n',
      )
    })

    it('copies public files recursively from the source directory', async () => {
      await main({ path: joinTemplates('pass') })

      assert.equal(
        await access(joinTemplates('pass', 'build', 'test', 'test.txt')),
        undefined,
      )
    })

    it('throws `SuriError` when a public directory/file fails to be copied', async () => {
      const publicFilePath = joinTemplates(
        'fail_public_read',
        'public',
        'test.txt',
      )

      await writeFile(publicFilePath, 'fail', { mode: 0o000 })

      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_public_read') })
        },
        {
          name: 'SuriError',
          message: 'Failed to copy public directory',
        },
      )

      await rm(publicFilePath)
    })
  })

  it('returns `true` when the build succeeds', async () => {
    assert.equal(await main({ path: joinTemplates('pass') }), true)
  })
})
