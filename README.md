# ${LIBRARY_NAME}

**${DESCRIPTION}**

[![npm version](https://img.shields.io/npm/v/@alexh-r/${LIBRARY_NAME}?logo=npm&color=cb3837)](https://www.npmjs.com/package/@alexh-r/${LIBRARY_NAME})
[![CI](https://github.com/AlexH-R/${LIBRARY_NAME}/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexH-R/${LIBRARY_NAME}/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](#typescript)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)](#installation)
[![Bun](https://img.shields.io/badge/bun-supported-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

`@alexh-r/${LIBRARY_NAME}` ${SHORT_PITCH}

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
bun add @alexh-r/${LIBRARY_NAME}

# npm
npm install @alexh-r/${LIBRARY_NAME}

# pnpm
pnpm add @alexh-r/${LIBRARY_NAME}
```

The package is **ESM only** and needs Node 20+, Bun or Deno.

## Quick start

```ts
import { hello } from "@alexh-r/${LIBRARY_NAME}";

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
