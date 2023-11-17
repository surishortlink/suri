<p align="center" width="100%">
  <img src="logo.png" width="200" />
</p>

Suri generates your own shortlinks as an easily deployed static site. No
server-side hosting, serverless cloud functions, or database necessary. Suri can
be deployed to Vercel, Netlify, and more (usually for free) in a few minutes.

Suri doesn't give a 💩 about "technically superior" `3xx` server redirects. Suri
just wants you to finally use that domain you waste \$39/year on because you've
never actually done anything with it.

Try it out with one of my own shortlinks: https://jstayton.com/tw 👉🏻
https://twitter.com/kidjustino

## Getting Started

Suri has template repositories that make it super easy to get started. Choose
the platform you're deploying to and follow the instructions:

- [Deploy to DigitalOcean](https://github.com/staticsuri/suri-deploy-digitalocean)
- [Deploy to GitHub Pages](https://github.com/staticsuri/suri-deploy-github)
- [Deploy to Netlify](https://github.com/staticsuri/suri-deploy-netlify)
- [Deploy to Render](https://github.com/staticsuri/suri-deploy-render)
- [Deploy to Vercel](https://github.com/staticsuri/suri-deploy-vercel)

Not deploying to one of those platforms? No worries. Here are a few generic
options that cover most other scenarios, whether that's a different cloud
provider or simply hosting it yourself:

- [Deploy with Docker](https://github.com/staticsuri/suri-deploy-docker)
- [Deploy with Node.js](https://github.com/staticsuri/suri-deploy-nodejs)

## How It Works

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
- Removed Heroku as a one click deploy platform because they no longer offer a
  free tier.

## Development

### Prerequisites

The only prerequisite is a compatible version of Node.js (see `engines.node` in
[`package.json`](package.json)).

### Dependencies

Install dependencies with npm:

```bash
npm install
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

After development is done in the `development` branch and is ready for release,
it should be merged into the `main` branch, where the latest release code lives.
[Release It!](https://github.com/release-it/release-it) is then used to
orchestrate the release process:

```bash
npm run release
```

Once the release process is complete, merge the `main` branch back into the
`development` branch. They should have the same history at this point.

![piratepx](https://app.piratepx.com/ship?p=e91ddd1b-31ad-4c36-b03e-be4a1e9a7678&i=suri)
