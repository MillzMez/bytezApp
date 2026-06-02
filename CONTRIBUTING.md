# Contributing to csc307app

Hey! This doc covers how we work on this project so everyone
stays on the same page. Read through it before you start writing
code.

## What's in here

This is a monorepo, so both the frontend and backend live in the
same repo under `packages/`: csc307app/ ├── packages/ │ ├──
react-frontend/ │ └── express-backend/ ├── .prettierrc ├──
package.json └── CONTRIBUTING.md

## Setting up locally

Clone it down:

```bash
git clone https://github.com/Briangmz/csc307app.git
cd csc307app
```

Install at the root, then in each package:

```bash
npm install
cd packages/react-frontend && npm install
cd ../express-backend && npm install
```

That should be enough to get you running.

## Formatting and linting

We use Prettier for formatting and ESLint for catching bugs. Get
your editor set up to run both on save and you'll basically
never have to think about this stuff.

### Prettier settings

Our `.prettierrc` overrides:

| Option                    | Value  |
| ------------------------- | ------ |
| trailingComma             | none   |
| semi                      | true   |
| singleQuote               | false  |
| bracketSameLine           | true   |
| htmlWhitespaceSensitivity | ignore |
| proseWrap                 | always |
| printWidth                | 64     |

A couple notes on why we picked these:

- `printWidth: 64` is shorter than the default 80 — keeps lines
  readable on split screens
- `bracketSameLine: true` puts the closing `>` of multi-line JSX
  on the same line as the last prop
- `trailingComma: none` keeps diffs cleaner for our style

If you ever need to format everything manually:

```bash
npm run format
```

Heads up: don't run this on a feature branch unless you mean to.
If formatting changes a bunch of files someone else is editing,
you'll create merge conflicts.

### ESLint

ESLint is set up separately for each package because the
frontend and backend need different rules:

- Frontend config: `packages/react-frontend/eslint.config.js`
- Backend config: `packages/express-backend/eslint.config.js`

To lint a package, cd into it and run:

```bash
npx eslint .
```

## Editor setup

You need to do this once on your machine. If you skip it you'll
keep committing unformatted code and annoy everyone.

If you use VS Code:

1. Install the Prettier extension ("Prettier - Code formatter")
2. Install the ESLint extension
3. Turn on Format On Save in settings
4. Set Prettier as your default formatter

Using something else? Check these:

- Prettier editors: https://prettier.io/docs/en/editors.html
- ESLint integrations:
  https://eslint.org/docs/latest/use/integrations

## Git workflow

Don't push directly to main. Branch off, do your work, open a
PR.

```bash
git checkout main
git pull origin main
git checkout -b your-initials/short-description
```

So like `bg/login-form` or `bg/fix-cors-bug`. After you push:

1. Open a PR on GitHub
2. Get at least one teammate to review it
3. Merge once it's approved

Pull main often. The longer your branch lives, the worse the
conflicts get.

## Commit messages

Keep them short and tell us what changed. Present tense.

Good:

- `add login form`
- `fix pagination off-by-one`
- `update readme`

Not good:

- `stuff`
- `asdf`
- `final commit pls work`

## Don't commit

- `node_modules/` (it's in .gitignore already)
- `.env` files or anything with secrets, API keys, passwords
- Build output (`dist/`, `build/`)
- Your personal editor configs

If you accidentally commit `node_modules` or a secret, tell the
team right away. Secrets in git history are a pain to clean up.

## Stuck?

Drop a message in the team chat or open an issue on the repo.
Don't sit on something for an hour when a teammate can probably
unblock you in five minutes.
