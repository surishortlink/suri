<h1 align="center" width="100%">
  <img src="logo.png" width="200" alt="Suri" />
</h1>

<h3 align="center" width="100%">
  <i>Your own short links as an easily deployed static site</i>
</h3>

No server-side hosting, serverless cloud functions, or database necessary. Suri
static sites can be deployed to Vercel, Netlify, and more (usually for free) in
a few minutes.

Suri doesn't care about "technically superior" `3xx` server redirects. Suri just
wants you to finally use that domain you spend \$59/year on and take back your
short links from the Bitlys and TinyURLs of the web.

## Try It Out

https://surishort.link/gh ⇒ https://github.com/surishortlink/suri

https://surishort.link is an example site that showcases Suri in action. You can
check out
[the repository for the site](https://github.com/surishortlink/surishort.link)
and
[the file that manages the links](https://github.com/surishortlink/surishort.link/blob/main/src/links.json)
to see how it works.

## Quick Start

Suri has template repositories that make it super easy to get started. Choose
the platform you're deploying to and follow the step by step instructions:

- [Deploy to DigitalOcean](https://github.com/surishortlink/suri-deploy-digitalocean)
- [Deploy to GitHub Pages](https://github.com/surishortlink/suri-deploy-github)
- [Deploy to Netlify](https://github.com/surishortlink/suri-deploy-netlify)
- [Deploy to Render](https://github.com/surishortlink/suri-deploy-render)
- [Deploy to Vercel](https://github.com/surishortlink/suri-deploy-vercel)

Not deploying to one of those platforms? No worries. Here are a few generic
options that cover most other scenarios, whether that's a different cloud
provider or hosting it yourself:

- [Deploy with Docker](https://github.com/surishortlink/suri-deploy-docker)
- [Deploy with Node.js](https://github.com/surishortlink/suri-deploy-nodejs)

## How It Works

### Manage Links

At the heart of Suri is the `links.json` file, located in the `src` directory,
where you manage your links. All of the template repositories include this file
seeded with a few examples:

```json
{
  "/": "https://www.youtube.com/watch?v=CsHiG-43Fzg",
  "1": "https://fee.org/articles/the-use-of-knowledge-in-society/",
  "gh": "https://github.com/surishortlink/suri"
}
```

It couldn't be simpler: the key is the "short link" path that gets redirected,
and the value is the target URL. Keys can be as short or as long as you want,
using whatever mixture of characters you want. `/` is a special entry for
redirecting the root path.

### Build Static Site

Suri ships with a `suri` executable file that generates the static site from the
`links.json` file. The static site is output to a directory named `build`.

All of the template repositories are configured with a `build` script that
invokes this executable, making the command you run simple:

```bash
npm run build
```

When you make a change to the `links.json` file, simply re-run this command to
re-generate the static site, which can then be re-deployed. Many of the
platforms that Suri has template repositories for are configured to do this
automatically.

### Config

Configuration is handled through the `suri.config.json` file in the root
directory. There is only one option at this point:

| Option | Description                                                        | Type    | Default |
| ------ | ------------------------------------------------------------------ | ------- | ------- |
| `js`   | Whether to redirect with JavaScript instead of a `<meta>` refresh. | Boolean | `false` |

### Public Directory

Finally, any files in the `public` directory will be copied over to the `build`
directory without modification when the static site is built. This can be useful
for files like `favicon.ico` or `robots.txt` (that said, Suri provides sensible
defaults for both).

## Upgrading v0 to v1

If you previously forked/cloned this repository when it was on version 0.1
through 0.5.1, you'll notice a few differences now with version 1.

Version 1 solves three main issues with version 0:

1. **Difficult to update.** Since you forked/cloned this repository in v0, you
   had to manually merge in upstream changes if you wanted the latest version.
   This often led to merge conflicts and wasn't an easy, intuitive process most
   of the time. v1 fixes this by turning Suri into a proper npm package that you
   can update just like any other dependency.
2. **Lots of unnecessary files.** v0 included deployment and config files for
   every platform you could deploy to (Vercel, Netlify, etc.). Even if you
   deployed to Vercel, you still had `render.yaml` for Render and `app.json` for
   Heroku (among others) in your repository. v1 fixes this by having separate
   template repositories for each platform, which only include the necessary
   files for that platform.
3. **[Eleventy](https://www.11ty.dev/) was overkill.** v0 was built on it for
   static site generation. While a great option for most static sites, it was
   overkill for the tiny HTML page that Suri generates. Eleventy came with 34 of
   its own dependencies, which ultimately resulted in 241 total dependencies
   being installed. v1 fixes this by removing Eleventy in favor of a
   purpose-built static site generator that doesn't require a single dependency.

So, how do you upgrade? If you only ever edited your `links.json` file,
upgrading is simple:

1. Create a new repository based on the template repository for your platform
   (see links above).
2. Copy over your `links.json` file.
3. If you changed any of the files in your `public` directory, copy those over.
4. If you set the environment variable `SURI_JS` to `1`, change `js` to `true`
   in `suri.config.json`.

If you edited any of the Eleventy files – such as the `links.njk` template – you
probably just want to stick to v0 and continue using Eleventy.

There are a few other noteworthy changes in v1 beyond that:

- The static site is now output to a directory named `build` instead of `_site`.
- Configuration is now done through the `suri.config.json` file instead of
  environment variables.
- Node.js >= v18 is now required, up from v14, which has reached end-of-life.
- Removed `npm run clean` to delete the build directory. `npm run build` does
  this automatically before each new build. Otherwise, you can manually add it
  back if you found it useful.
- Removed `npm run dev` to build, watch, and serve the static site during
  development. It's overkill for the tiny HTML page that Suri generates.
- Removed `npm run lint` to lint with Prettier. You can manually add it back if
  you found it useful.
- Removed `npm run release` to release a new version of Suri. You can manually
  add it back if you want to tag release versions of your repository.
- Removed Heroku as a deploy platform because they no longer offer a free tier.
  You can still deploy there quite easily if you're willing to pay.
- This repository moved from my personal `jstayton` user on GitHub to a new
  `surishortlink` organization for all Suri-related repositories.

## Development

### Prerequisites

The only prerequisite is a compatible version of Node.js (see `engines.node` in
[`package.json`](package.json)).

### Dependencies

Install dependencies with npm:

```bash
npm install
```

### Tests

The built-in Node.js [test runner](https://nodejs.org/docs/latest/api/test.html)
and [assertions module](https://nodejs.org/docs/latest/api/assert.html) is used
for testing.

To run the tests:

```bash
npm test
```

During development, it's recommended to run the tests automatically on file
change:

```bash
npm test -- --watch
```

### Docs

[JSDoc](https://jsdoc.app/) is used to document the code.

To generate the docs as HTML to the (git-ignored) `docs` directory:

```bash
npm run docs
```

### Code Style & Linting

[Prettier](https://prettier.io/) is setup to enforce a consistent code style.
It's highly recommended to
[add an integration to your editor](https://prettier.io/docs/en/editors.html)
that automatically formats on save.

[ESLint](https://eslint.org/) is setup with the
["recommended" rules](https://eslint.org/docs/latest/rules/) to enforce a level
of code quality. It's also highly recommended to
[add an integration to your editor](https://eslint.org/docs/latest/use/integrations#editors)
that automatically formats on save.

To run via the command line:

```bash
npm run lint
```

## Releasing

When the `development` branch is ready for release,
[Release It!](https://github.com/release-it/release-it) is used to orchestrate
the release process:

```bash
npm run release
```

Once the release process is complete, merge the `development` branch into the
`main` branch, which should always reflect the latest release.

![piratepx](https://app.piratepx.com/ship?p=e91ddd1b-31ad-4c36-b03e-be4a1e9a7678&i=suri)
