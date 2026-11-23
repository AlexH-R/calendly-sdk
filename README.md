# Calendly SDK

**A typed, zero-dependency TypeScript client for the [Calendly](https://calendly.com/) API v2**

> [!NOTE]
> This is an **unofficial** SDK. It is not affiliated with, endorsed or sponsored by Calendly. Calendly is a trademark of its respective owner.

[![npm version](https://img.shields.io/npm/v/@alexh-r/calendly-sdk?logo=npm&color=cb3837)](https://www.npmjs.com/package/@alexh-r/calendly-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](#typescript)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)](#installation)
[![Bun](https://img.shields.io/badge/bun-supported-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

`@alexh-r/calendly-sdk` wraps the Calendly REST API v2 in small, typed resource classes. It works with a Personal Access Token or with OAuth (PKCE, code exchange and automatic token refresh included), builds URLs and query strings, and throws a single error type for anything that goes wrong.

* **Fully typed**: every request body, query and response has a TypeScript type, exported from the package root.
* **No dependencies**: uses the standard `fetch` and Web Crypto, so it runs on Node, Bun, Deno and edge runtimes.
* **OAuth built in**: PKCE helpers, code exchange, and an access token that refreshes itself (and hands you the new tokens to persist).
* **Cancellable**: every method takes an optional `AbortSignal`.
* **Consistent API**: `getAll()` lists a collection, `get(uuid)` returns one item, in every resource.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [OAuth](#oauth)
- [Usage](#usage): [URIs and UUIDs](#uris-and-uuids), [pagination](#pagination), [cancelling requests](#cancelling-requests), [errors](#error-handling), [custom fetch](#custom-fetch)
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

The package is **ESM only** and needs a runtime with a global `fetch`, Web Crypto and `URL.canParse` (Node 20+, Bun, Deno).

## Quick start

To access your own account, create a **Personal Access Token** in Calendly (*Integrations & apps → API and webhooks*).

```ts
import { CalendlyClient } from "@alexh-r/calendly-sdk";

const calendly = new CalendlyClient({
	accessToken: process.env.CALENDLY_TOKEN!,
});

const { resource: me } = await calendly.users.getMe();

const { collection: events } = await calendly.scheduledEvents.getAll({
	user: me.uri,
	status: "active",
	min_start_time: new Date().toISOString(),
});

const { collection: eventTypes } = await calendly.eventTypes.getAll({
	user: me.uri,
	active: true,
});
```

> [!WARNING]
> Never hard-code your tokens. Load them from environment variables (or a secrets manager) and keep your `.env` out of version control.

## Configuration

`new CalendlyClient(config)` takes **either** `accessToken` **or** `oauth`:

| Option        | Type          | Required | Description |
| ------------- | ------------- | :------: | ----------- |
| `accessToken` | `string`      | ✅ (or `oauth`) | Personal Access Token or OAuth access token, sent as `Authorization: Bearer`. |
| `oauth`       | `OAuthConfig` | ✅ (or `accessToken`) | OAuth app credentials and tokens. The client refreshes the access token by itself. See [OAuth](#oauth). |
| `baseUrl`     | `string`      |    | Base URL of the API. Defaults to `https://api.calendly.com/`; a trailing `/` is added if missing. |
| `fetch`       | `FetchFn`     |    | Custom `fetch` implementation (tests, proxies, logging…). Also used for token refreshes. Defaults to `globalThis.fetch`. |

`OAuthConfig`:

| Option         | Type          | Required | Description |
| -------------- | ------------- | :------: | ----------- |
| `clientId`     | `string`      | ✅ | Client ID of your Calendly OAuth app. |
| `clientSecret` | `string`      |    | Client secret. Omit it for public (PKCE only) apps. |
| `tokens`       | `OAuthTokens` | ✅ | The tokens returned by `exchangeCode` (or the last ones received in `onTokens`). |
| `onTokens`     | `(tokens: OAuthTokens) => void \| Promise<void>` | ✅ | Called with the new tokens after every refresh. Persist them. |
| `authBaseUrl`  | `string`      |    | Base URL of the auth server. Defaults to `https://auth.calendly.com/`. |

The constructor throws a `CalendlyError` if `baseUrl` is not a valid URL, or if neither a non-empty `accessToken` nor a complete `oauth` config is given.

## OAuth

To act on behalf of other Calendly users, register an OAuth app in the [Calendly developer portal](https://developer.calendly.com/). Calendly requires PKCE (S256) for every app, so the flow has three steps.

**1. Redirect the user to Calendly.**

```ts
import { createPkcePair, getAuthorizationUrl } from "@alexh-r/calendly-sdk";

const { codeVerifier, codeChallenge } = await createPkcePair();
const state = crypto.randomUUID();
// Save codeVerifier and state in the user's session.

res.redirect(getAuthorizationUrl({ clientId, redirectUri, codeChallenge, state }));
```

**2. Exchange the `code` in your redirect URI for tokens.**

```ts
import { exchangeCode } from "@alexh-r/calendly-sdk";

// Check that req.query.state matches the one in the session first.
const tokens = await exchangeCode({
	clientId,
	clientSecret,
	code: req.query.code,
	redirectUri,
	codeVerifier, // from the session
});

await db.saveTokens(userId, tokens);
```

**3. Create a client with the saved tokens.**

```ts
import { CalendlyClient } from "@alexh-r/calendly-sdk";

const calendly = new CalendlyClient({
	oauth: {
		clientId,
		clientSecret,
		tokens: await db.getTokens(userId),
		onTokens: (tokens) => db.saveTokens(userId, tokens),
	},
});

const { resource: me } = await calendly.users.getMe();
```

From then on the client takes care of the access token: it refreshes it a minute before it expires, and once more if a request gets a `401`. Concurrent requests share a single refresh.

> [!IMPORTANT]
> Calendly refresh tokens are **single use**: after a refresh, the previous one stops working. Always persist the tokens you receive in `onTokens`, or the user will have to authorize your app again.

The OAuth helpers can also be used on their own:

| Function | Description |
| -------- | ----------- |
| `createPkcePair()` | Creates a random `codeVerifier` and its S256 `codeChallenge`. |
| `getAuthorizationUrl(options)` | Builds the `https://auth.calendly.com/oauth/authorize` URL (`clientId`, `redirectUri`, `codeChallenge`, optional `state`). |
| `exchangeCode(options)` | Exchanges the authorization `code` for tokens (`POST oauth/token`). |
| `refreshTokens(options)` | Exchanges a `refreshToken` for new tokens (`POST oauth/token`). |
| `revokeToken(options)` | Revokes an access or refresh token (`POST oauth/revoke`). |

Token requests are sent as `application/x-www-form-urlencoded`, with `client_id` in the body and, when you pass a `clientSecret`, HTTP Basic auth.

## Usage

Every resource lives on the client instance (`calendly.users`, `calendly.scheduledEvents`, …) and every method returns a `Promise` with the typed API response:

* `Resource<T>`: a single item in `resource`.
* `Collection<T>`: a list in `collection`.
* `PaginatedCollection<T>`: a list in `collection` plus `pagination`.
* `undefined` for endpoints that return no content (`delete`, `revokeInvitation`, data compliance requests…).

### URIs and UUIDs

Calendly identifies everything by URI (`https://api.calendly.com/users/AAAA…`). Query filters such as `user`, `organization` or `event_type` take the **full URI**, while path parameters (`get(uuid)`, `cancel(uuid)`, …) take the **UUID**, the last segment of the URI:

```ts
const uuid = event.uri.split("/").pop()!;
await calendly.scheduledEvents.cancel(uuid, { reason: "Rescheduled" });
```

UUIDs are URL-encoded for you.

### Pagination

Paginated endpoints take `count` (rows per page, 20 by default) and `page_token`, and return the next token in `pagination.next_page_token` (`null` on the last page):

```ts
import type { ScheduledEvent } from "@alexh-r/calendly-sdk";

const all: ScheduledEvent[] = [];
let page_token: string | undefined;

do {
	const res = await calendly.scheduledEvents.getAll({
		user: me.uri,
		count: 100,
		page_token,
	});
	all.push(...res.collection);
	page_token = res.pagination.next_page_token ?? undefined;
} while (page_token);
```

Array filters (for example `email` in `contacts.getAll`) are sent comma-separated.

### Cancelling requests

The last argument of every method is an optional `AbortSignal`:

```ts
const { resource: me } = await calendly.users.getMe(AbortSignal.timeout(5_000));
```

### Error handling

Everything the SDK throws is a `CalendlyError`: invalid config, network failures, OAuth failures and non-2xx responses.

```ts
import { CalendlyError } from "@alexh-r/calendly-sdk";

try {
	await calendly.eventTypes.get("does-not-exist");
} catch (error) {
	if (error instanceof CalendlyError) {
		error.message; // "[GET] event_types/does-not-exist failed with 404"
		error.status;  // 404 (HTTP status, when there is a response)
		error.body;    // parsed JSON body ({ title, message, details }), or raw text
		error.cause;   // original error (network errors, aborts…)
	}
}
```

OAuth errors carry Calendly's `{ error, error_description }` in `body`.

### Custom fetch

Pass your own `fetch` to add logging, retries, a proxy, or to mock the API in tests:

```ts
const calendly = new CalendlyClient({
	accessToken,
	fetch: async (input, init) => {
		console.log(init?.method ?? "GET", String(input));
		return fetch(input, init);
	},
});
```

## API reference

Paths are relative to `https://api.calendly.com/`. `{uuid}` parameters take the UUID of the resource (see [URIs and UUIDs](#uris-and-uuids)).

### Users (`calendly.users`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getMe()` | `GET users/me` | Get the user that owns the access token. |
| `get(uuid)` | `GET users/{uuid}` | Get a user. |

### Organizations (`calendly.organizations`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `get(uuid)` | `GET organizations/{uuid}` | Get an organization. |
| `getInvitations(organizationUuid, query?)` | `GET organizations/{organizationUuid}/invitations` | List the invitations of an organization. |
| `getInvitation(organizationUuid, invitationUuid)` | `GET organizations/{organizationUuid}/invitations/{invitationUuid}` | Get an invitation. |
| `createInvitation(organizationUuid, body)` | `POST organizations/{organizationUuid}/invitations` | Invite a user to the organization. |
| `revokeInvitation(organizationUuid, invitationUuid)` | `DELETE organizations/{organizationUuid}/invitations/{invitationUuid}` | Revoke an invitation. |
| `getMemberships(query)` | `GET organization_memberships` | List memberships by `user` (handy to get your organization URI) or `organization`. |
| `getMembership(uuid)` | `GET organization_memberships/{uuid}` | Get a membership. |
| `deleteMembership(uuid)` | `DELETE organization_memberships/{uuid}` | Remove a user from the organization (admins only; not the owner). |
| `getTeams(query?)` | `GET teams` | List teams, optionally filtered by user. |
| `getTeam(uuid)` | `GET teams/{uuid}` | Get a team. |

### Groups (`calendly.groups`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET groups` | List the groups of an organization. |
| `get(uuid)` | `GET groups/{uuid}` | Get a group. |
| `getRelationships(query?)` | `GET group_relationships` | List group memberships, admin roles and invitations. |
| `getRelationship(uuid)` | `GET group_relationships/{uuid}` | Get a group relationship. |

### Event types (`calendly.eventTypes`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET event_types` | List the event types of a `user` or `organization`. |
| `get(uuid)` | `GET event_types/{uuid}` | Get an event type. |
| `getHosts(query)` | `GET event_type_memberships` | List the hosts of an event type. |
| `getAvailableTimes(query)` | `GET event_type_available_times` | List available start times in a range of up to 31 days. |
| `create(body)` | `POST event_types` | Create a one-on-one event type. |
| `update(uuid, body)` | `PATCH event_types/{uuid}` | Update a one-on-one event type. |
| `createOneOff(body)` | `POST one_off_event_types` | Create a one-off meeting (`AdhocEventType`). |

### Availability (`calendly.availability`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getSchedules(query)` | `GET user_availability_schedules` | List the availability schedules of a user. |
| `getSchedule(uuid)` | `GET user_availability_schedules/{uuid}` | Get an availability schedule. |
| `createSchedule(body)` | `POST user_availability_schedules` | Create an availability schedule (one `wday` rule per weekday). |
| `updateSchedule(uuid, body)` | `PATCH user_availability_schedules/{uuid}` | Update an availability schedule. |
| `getEventTypeSchedules(query)` | `GET event_type_availability_schedules` | List the availability schedules of an event type. |
| `updateEventTypeSchedule(query, body)` | `PATCH event_type_availability_schedules` | Link a user schedule to an event type or set custom rules. |
| `getBusyTimes(query)` | `GET user_busy_times` | List the busy times of a user (Calendly, reserved and external events). |
| `getMeetingLimits(query)` | `GET user_meeting_limits` | Get the daily, weekly and monthly meeting limits of a user. |
| `updateMeetingLimits(query, body)` | `PATCH user_meeting_limits` | Update the meeting limits (`null` removes a limit). |

### Scheduled events (`calendly.scheduledEvents`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET scheduled_events` | List events of a `user`, `organization` or `group`. |
| `get(uuid)` | `GET scheduled_events/{uuid}` | Get an event. |
| `cancel(uuid, body?)` | `POST scheduled_events/{uuid}/cancellation` | Cancel an event, with an optional `reason`. |
| `getInvitees(uuid, query?)` | `GET scheduled_events/{uuid}/invitees` | List the invitees of an event. |
| `getInvitee(eventUuid, inviteeUuid)` | `GET scheduled_events/{eventUuid}/invitees/{inviteeUuid}` | Get an invitee. |
| `createInvitee(body)` | `POST invitees` | Book an event for an invitee (Scheduling API; paid event types not supported). |
| `getInviteeNoShow(uuid)` | `GET invitee_no_shows/{uuid}` | Get an invitee no-show. |
| `createInviteeNoShow(body)` | `POST invitee_no_shows` | Mark an invitee as a no-show. |

### Scheduling links (`calendly.schedulingLinks`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `create(body)` | `POST scheduling_links` | Create a single-use scheduling link for an event type. |

### Shares (`calendly.shares`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET shares` | List the user's shares (single-use links), newest first. |
| `create(body)` | `POST shares` | Create a customized one-off version of a one-on-one event type. |
| `update(uuid, body)` | `PATCH shares/{uuid}` | Update an active, unbooked share (`null` restores the event type value). |
| `delete(uuid)` | `DELETE shares/{uuid}` | Delete an unbooked share. |

### Routing forms (`calendly.routingForms`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET routing_forms` | List the routing forms of an organization. |
| `get(uuid)` | `GET routing_forms/{uuid}` | Get a routing form. |
| `getSubmissions(query)` | `GET routing_form_submissions` | List the submissions of a routing form. |
| `getSubmission(uuid)` | `GET routing_form_submissions/{uuid}` | Get a submission. |

### Contacts (`calendly.contacts`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query?)` | `GET contacts` | List contacts, with filters, sorting and `contact_list` (list or view URI). |
| `get(uuid, query?)` | `GET contacts/{uuid}` | Get a contact (`exclude: "custom_fields"` to omit custom fields). |
| `create(body)` | `POST contacts` | Create a contact (one primary email; `409` if it exists). |
| `update(uuid, body)` | `PATCH contacts/{uuid}` | Update a contact. `emails` and `phone_numbers` replace the existing lists. |
| `delete(uuid)` | `DELETE contacts/{uuid}` | Delete a contact. |
| `getLists(query?)` | `GET contact_lists` | List the user's lists and views (max 25), not their contacts. |
| `getList(uuid)` | `GET contact_lists/{uuid}` | Get a list or view. |
| `createList(body)` | `POST contact_lists` | Create a list, optionally with up to 500 contacts. |
| `updateList(uuid, body)` | `PATCH contact_lists/{uuid}` | Rename a list or view. |
| `addToList(uuid, body)` | `POST contact_lists/{uuid}/memberships` | Add up to 500 contacts to a list (idempotent). |
| `removeFromList(uuid, body)` | `POST contact_lists/{uuid}/memberships/removal` | Remove up to 500 contacts from a list (idempotent; contacts are kept). |
| `getCustomFieldDefinitions()` | `GET contacts/custom_field_definitions` | List the contact custom field definitions. |
| `getCustomFieldDefinition(uuid)` | `GET contacts/custom_field_definitions/{uuid}` | Get a custom field definition. |
| `createCustomFieldDefinition(body)` | `POST contacts/custom_field_definitions` | Create a custom field definition. |
| `getNotes(query?)` | `GET notes` | List the notes written by the current user. |
| `getNote(uuid)` | `GET notes/{uuid}` | Get a note owned by the current user. |
| `createNote(body)` | `POST notes` | Create a note about a contact, with an optional reminder. |

### Meeting recaps (`calendly.meetingRecaps`)

Requires Notetaker on your plan.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query?)` | `GET meeting_recaps` | List the meeting recaps the user can access. |
| `get(uuid)` | `GET meeting_recaps/{uuid}` | Get a recap with its Markdown summary, action items and discussion. |
| `getTranscript(uuid)` | `GET meeting_recaps/{uuid}/transcript` | Get the transcript as plain text. |
| `update(uuid, body)` | `PATCH meeting_recaps/{uuid}` | Update a recap. |
| `delete(uuid)` | `DELETE meeting_recaps/{uuid}` | Delete a recap. |

### Locations (`calendly.locations`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET locations` | List the meeting locations configured for a user. |

### Webhooks (`calendly.webhooks`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET webhook_subscriptions` | List webhook subscriptions of an organization, user or group. |
| `get(uuid)` | `GET webhook_subscriptions/{uuid}` | Get a webhook subscription. |
| `create(body)` | `POST webhook_subscriptions` | Subscribe a URL to events with `organization`, `user` or `group` scope. |
| `delete(uuid)` | `DELETE webhook_subscriptions/{uuid}` | Delete a webhook subscription. |

### Outgoing communications (`calendly.outgoingCommunications`)

Enterprise only.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET outgoing_communications` | List the SMS and emails sent by an organization (owners and admins). |

### Activity log (`calendly.activityLog`)

Enterprise only.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `getAll(query)` | `GET activity_log_entries` | List the activity log of an organization, with search, filters and sorting. |

### Data compliance (`calendly.dataCompliance`)

Enterprise only. Deletions can take up to 7 days to complete.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `deleteEvents(body)` | `POST data_compliance/deletion/events` | Delete the scheduled events data in a past time range (max 24 months). |
| `deleteInvitees(body)` | `POST data_compliance/deletion/invitees` | Delete the data of invitees by email. |

## TypeScript

All models, request bodies and query types are exported as types from the package root:

```ts
import type { EventType, Invitee, ScheduledEvent, User } from "@alexh-r/calendly-sdk";

function greet(user: User) {
	return `Hi ${user.name}`;
}
```

Shared helper types are exported too:

* `Resource<T>`, `Collection<T>` and `PaginatedCollection<T>`: the response shapes described in [Usage](#usage).
* `OAuthTokens`, `OAuthConfig`, `PkcePair` and the option types of the OAuth helpers.
* `CalendlyClientConfig` (and its two variants, `AccessTokenClientConfig` and `OAuthClientConfig`) and `FetchFn`.

```ts
import type { PaginatedCollection, EventType } from "@alexh-r/calendly-sdk";

async function activeEventTypes(user: string): Promise<PaginatedCollection<EventType>> {
	return calendly.eventTypes.getAll({ user, active: true });
}
```

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

[MIT](LICENSE). This project is not affiliated with Calendly; see the note at the top.
