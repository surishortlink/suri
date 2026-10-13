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

    it('throws `SuriError` when build directory fails to be removed', async (t) => {
      const buildDirPath = joinTemplates('fail_build_remove', 'build')

      await mkdir(buildDirPath, { recursive: true })
      await writeFile(
        joinTemplates('fail_build_remove', 'build', 'fail.txt'),
        'fail',
      )
      await chmod(buildDirPath, 0o000)
      t.after(() => chmod(buildDirPath, 0o777))

      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_build_remove') })
        },
        {
          name: 'SuriError',
          message: 'Failed to remove build directory',
        },
      )
    })
  })

  describe('loads config', () => {
    it('throws `SuriError` when `suri.config.json` fails to be read', async (t) => {
      const configFilePath = joinTemplates(
        'fail_config_json_read',
        'suri.config.json',
      )

      await writeFile(configFilePath, 'fail', { mode: 0o000 })
      t.after(() => rm(configFilePath))

      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_config_json_read') })
        },
        {
          name: 'SuriError',
          message: 'Failed to load config file',
        },
      )
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
        '\n    <!doctype html>\n    \n            <script>\n              window.location.replace("https://www.youtube.com/watch?v=CsHiG-43Fzg")\n            </script>\n          \n  ',
      )
    })

    it('escapes the target URL in the `<meta>` refresh', async () => {
      await main({ path: joinTemplates('pass') })

      assert.equal(
        await readTemplatesFile('pass', 'build', 'escaped', 'index.html'),
        '\n    <!doctype html>\n    <meta http-equiv="refresh" content="0; url=https://example.com/?q=it\'s&amp;a=&quot;b&quot;</script>" />\n  ',
      )
    })

    it('escapes the target URL in the JavaScript redirect', async () => {
      await main({ path: joinTemplates('pass_js') })

      assert.equal(
        await readTemplatesFile('pass_js', 'build', 'escaped', 'index.html'),
        '\n    <!doctype html>\n    \n            <script>\n              window.location.replace("https://example.com/?q=it\'s&a=\\"b\\"\\u003c/script>")\n            </script>\n          \n  ',
      )
    })

    it('throws `SuriError` when `links.json` fails to be read', async (t) => {
      const linksFilePath = joinTemplates(
        'fail_links_json_read',
        'src',
        'links.json',
      )

      await writeFile(linksFilePath, 'fail', { mode: 0o000 })
      t.after(() => rm(linksFilePath))

      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_links_json_read') })
        },
        {
          name: 'SuriError',
          message: 'Failed to load links file',
        },
      )
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

    it('throws `SuriError` when `links.json` is not an object', async () => {
      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_links_not_object') })
        },
        {
          name: 'SuriError',
          message: 'Invalid links: must be a JSON object',
        },
      )
    })

    it('throws `SuriError` when a target URL is not a string', async () => {
      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_links_url_type') })
        },
        {
          name: 'SuriError',
          message: 'Invalid link "gh": target URL must be a non-empty string',
        },
      )
    })

    it('throws `SuriError` when a target URL is empty', async () => {
      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_links_url_empty') })
        },
        {
          name: 'SuriError',
          message: 'Invalid link "gh": target URL must be a non-empty string',
        },
      )
    })

    it('throws `SuriError` when a link path contains ".."', async () => {
      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_links_path_dot_dot') })
        },
        {
          name: 'SuriError',
          message: 'Invalid link "../gh": path can\'t contain ".."',
        },
      )
    })

    it('throws `SuriError` when a link directory fails to be created', async () => {
      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_link_dir_create') })
        },
        {
          name: 'SuriError',
          message: 'Failed to create link directory: x/index.html/y',
        },
      )
    })

    it('throws `SuriError` when a link file fails to be created', async () => {
      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_link_file_create') })
        },
        {
          name: 'SuriError',
          message: 'Failed to create link file: x',
        },
      )
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

    it('throws `SuriError` when a public directory/file fails to be copied', async (t) => {
      const publicFilePath = joinTemplates(
        'fail_public_read',
        'public',
        'test.txt',
      )

      await writeFile(publicFilePath, 'fail', { mode: 0o000 })
      t.after(() => rm(publicFilePath))

      await assert.rejects(
        async () => {
          await main({ path: joinTemplates('fail_public_read') })
        },
        {
          name: 'SuriError',
          message: 'Failed to copy public directory',
        },
      )
    })
  })

  it('returns `true` when the build succeeds', async () => {
    assert.equal(await main({ path: joinTemplates('pass') }), true)
  })
})
