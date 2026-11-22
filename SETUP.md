# Setup checklist

Steps to follow every time you create a new library from this template. GitHub's "Use this template" only copies files: repository settings, rulesets and labels must be configured by hand.

## 1. Create the repository

- [x] On GitHub, open this template and click **Use this template → Create a new repository**.
- [x] Clone it and run `bun install`.

## 2. Replace the placeholders

Find them all with:

```bash
grep -rn '\${' --exclude-dir=node_modules --exclude-dir=.git . | grep -v '\${{'
```

- [x] `${LIBRARY_NAME}`: package and repository name (`package.json`, `README.md`).
- [x] `${DESCRIPTION}`, `${SHORT_PITCH}`, `${FEATURE}`: description and README texts.
- [x] Fill `keywords` in `package.json`.
- [x] Reset `version` in `package.json` to `0.1.0` if needed.
- [x] Replace `src/index.ts` and `src/test/index.spec.ts` with real code.
- [x] Delete this `SETUP.md` (or keep it in a `docs/` folder) once everything is done.

## 3. Check that everything passes

```bash
bun run lint && bun run typecheck && bun test && bun run build && bunx publint
```

## 4. GitHub repository settings

- [x] **Settings → General → Pull Requests**: allow only squash merging and enable "Automatically delete head branches".
- [x] **Labels**: create `breaking` and `ignore-for-release` (`enhancement`, `bug` and `documentation` exist by default). They are used by `.github/release.yml` and `.github/dependabot.yml`.
- [x] **Rules → Rulesets → New branch ruleset** on `main`: require a pull request (0 approvals), require the status check `check`, block deletions and force pushes.
- [x] **Rules → Rulesets → New tag ruleset** on `v*`: block updates, deletions and force pushes.

The `check` status only appears in the ruleset search after the CI workflow has run once, so push a first commit before creating the branch ruleset.

## 5. First publish to npm (manual)

npm trusted publishing can only be configured for a package that already exists.

- [ ] `npm login`
- [ ] `bun run build && npm publish` (runs `prepublishOnly`; `publishConfig.access` is already `public`).
- [ ] `git tag v0.1.0 && git push origin v0.1.0`, then `gh release create v0.1.0 --generate-notes`.

## 6. Trusted publishing

- [ ] On npmjs.com, open the package → **Settings → Trusted publishing**: GitHub Actions, repository `AlexH-R/${LIBRARY_NAME}`, workflow `release.yml`, no environment, staged publishing only.
- [ ] Publish a new version within 2 days, or the trusted publisher configuration expires.

## 7. Releasing a new version

1. Create a branch `release/x.y.z` and run `npm version patch --no-git-tag-version` (or `minor` / `major`).
2. Open a PR labelled `ignore-for-release` and squash merge it.
3. On `main`: `git pull && git tag vX.Y.Z && git push origin vX.Y.Z`.
4. `release.yml` stages the version on npm and creates the GitHub release with generated notes.
5. Approve the staged version on npmjs.com (2FA).

## Maintenance

- When updating Biome, also update the `$schema` version in `biome.json` (`bunx biome migrate --write`).
- Keep `bun-version` in both workflows in sync with the Bun version you use locally.
