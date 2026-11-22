# Calendly SDK

**A typed, zero-dependency TypeScript client for the [Calendly](https://calendly.com/) API**

> [!NOTE]
> This is an **unofficial** SDK. It is not affiliated with, endorsed or sponsored by Calendly. Calendly is a trademark of its respective owner.

[![npm version](https://img.shields.io/npm/v/@alexh-r/calendly-sdk?logo=npm&color=cb3837)](https://www.npmjs.com/package/@alexh-r/calendly-sdk)
[![CI](https://github.com/AlexH-R/calendly-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexH-R/calendly-sdk/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](#typescript)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)](#installation)
[![Bun](https://img.shields.io/badge/bun-supported-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

`@alexh-r/calendly-sdk` ${SHORT_PITCH}

* **Fully typed**: ${FEATURE}
* **No dependencies**: uses only web standard APIs, so it runs on Node, Bun, Deno and edge runtimes.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [API reference](#api-reference)
- [TypeScript](#typescript)
- [Development](#development)
- [License](#license)

## Installation

```bash
# bun
bun add @alexh-r/calendly-sdk

# npm
npm install @alexh-r/calendly-sdk

# pnpm
pnpm add @alexh-r/calendly-sdk
```

The package is **ESM only** and needs Node 20+, Bun or Deno.

## Quick start

```ts
import { hello } from "@alexh-r/calendly-sdk";

console.log(hello());
```

## API reference

| Method | Returns | Description |
| ------ | ------- | ----------- |
| `hello()` | `string` | ${DESCRIPTION} |

## TypeScript

All public types are exported from the package root.

## Development

The project uses [Bun](https://bun.sh) for development and [Biome](https://biomejs.dev) (tabs) for linting and formatting. The published build is plain JavaScript plus `.d.ts` files, compiled with `tsc`.

```bash
bun install          # install dependencies
bun test             # run the tests
bun run lint         # lint and format src/ with Biome
bun run typecheck    # type check with tsc
bun run build        # compile to dist/
```

`prepublishOnly` lints, type checks, tests and builds the package before every publish.

## License

[MIT](LICENSE)
