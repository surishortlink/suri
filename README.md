# Suri

Suri is your own link shortener that's easily deployed as a static site. No
server-side hosting, serverless cloud functions, or database necessary. Suri can
be deployed to Vercel, Netlify, and more for free in 60 seconds.

Suri doesn't give a 💩 about "technically superior" `3xx` server redirects. Suri
just wants you to finally use that domain you waste \$39/year on because you've
never actually done anything with it.

Try it out with one of my own shortlinks: https://jstayton.com/tw 👉🏻
https://twitter.com/kidjustino

## Getting Started

### Install in One Click (for Free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fjstayton%2Fsuri&project-name=suri&repository-name=suri)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2Fjstayton%2Fsuri)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https%3A%2F%2Fgithub.com%2Fjstayton%2Fsuri)

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https%3A%2F%2Fgithub.com%2Fjstayton%2Fsuri%2Ftree%2Fmaster)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fjstayton%2Fsuri)

Once complete, try accessing the root path of your URL – it should redirect back
to [my GitHub profile](https://github.com/jstayton) if everything's working.

### Manage Links

Links are managed through [`src/links.json`](src/links.json), which is seeded
with a few examples to start:

```json
{
  "/": "https://github.com/jstayton",
  "1": "https://fee.org/articles/the-use-of-knowledge-in-society/",
  "tw": "https://twitter.com/kidjustino"
}
```

It couldn't be simpler: the key is the "shortlink" path that gets redirected,
and the value is the target URL. Keys can be as short or as long as you want,
using whatever mixture of characters you want. `/` is a special entry for
redirecting the root path.

Go ahead and make an edit, then commit and push to your repository. The hosting
provider you chose above should automatically build and deploy your change.
That's it!

_Pro tip_: Bookmark the page to
[edit `src/links.json` directly in GitHub](https://github.com/jstayton/suri/edit/master/src/links.json)
(or wherever), and use the default commit message that's populated. Now show me
a link shortener that's easier than that!

### Config

Environment variables are used to set config options. There is only one at this
point:

| Variable  | Description                                                        | Values   | Default |
| --------- | ------------------------------------------------------------------ | -------- | ------- |
| `SURI_JS` | Whether to redirect with JavaScript instead of a `<meta>` refresh. | `1`, `0` | `0`     |

### Install Manually

To install Suri somewhere else, or just on your own machine:

1. Fork this repository to create your own copy and clone to your machine.

1. Make sure you have a compatible version of [Node.js](https://nodejs.org/)
   (see `engines.node` in [`package.json`](package.json)).
   [nvm](https://github.com/nvm-sh/nvm) is the recommended installation method
   on your own machine:

   ```bash
   $ nvm install
   ```

1. Install dependencies with npm:

   ```bash
   $ npm install
   ```

1. Build the static site:

   ```bash
   $ npm run build
   ```

1. Deploy the generated `_site` directory to its final destination.

## Development

The following includes a few instructions for developing on Suri. For
11ty-specific details – the static site generator that powers Suri – see their
[docs](https://www.11ty.dev/docs/).

### Install

Follow the "Install Manually" section above to setup on your own machine.

### Start

Start the development server:

```bash
$ npm run dev
```

### Code Style

[Prettier](https://prettier.com/) is setup to enforce a consistent code style.
It's highly recommended to
[add an integration to your editor](https://prettier.io/docs/en/editors.html)
that automatically formats on save.

To run via the command line:

```bash
$ npm run lint
```

## Releasing

After development is done in the `development` branch and is ready for release,
it should be merged into the `master` branch, where the latest release code
lives. [Release It!](https://github.com/release-it/release-it) is then used to
interactively orchestrate the release process:

```bash
$ npm run release
```

![piratepx](https://app.piratepx.com/ship?p=e91ddd1b-31ad-4c36-b03e-be4a1e9a7678&i=suri)
