import { CalendlyError } from "./errors.js";
import type { FetchFn, TokenProvider } from "./http.js";

const AUTH_BASE_URL = "https://auth.calendly.com/";
const REFRESH_MARGIN_MS = 60_000;

export interface OAuthTokens {
	token_type: "Bearer";
	access_token: string;
	refresh_token: string;
	scope: string;
	created_at: number;
	expires_in: number;
	owner: string;
	organization: string;
}

export interface PkcePair {
	codeVerifier: string;
	codeChallenge: string;
}

export interface OAuthClientOptions {
	/** Client ID of your Calendly OAuth app. */
	clientId: string;
	/** Client secret of your OAuth app. Omit it for public (PKCE only) apps. */
	clientSecret?: string;
	/**
	 * Base URL of the Calendly auth server (tests, proxies…).
	 * @defaultValue `"https://auth.calendly.com/"`
	 */
	authBaseUrl?: string;
	/**
	 * Custom `fetch` implementation (tests, proxies, logging…).
	 * @defaultValue `globalThis.fetch`
	 */
	fetch?: FetchFn;
}

export interface AuthorizationUrlOptions {
	/** Client ID of your Calendly OAuth app. */
	clientId: string;
	/** Redirect URI registered in your OAuth app. */
	redirectUri: string;
	/** `codeChallenge` from {@link createPkcePair}. */
	codeChallenge: string;
	/** Opaque value returned unchanged to your redirect URI; use it to prevent CSRF. */
	state?: string;
	/**
	 * Base URL of the Calendly auth server.
	 * @defaultValue `"https://auth.calendly.com/"`
	 */
	authBaseUrl?: string;
}

export interface ExchangeCodeOptions extends OAuthClientOptions {
	/** `code` query param received in your redirect URI. */
	code: string;
	/** The same redirect URI used in {@link getAuthorizationUrl}. */
	redirectUri: string;
	/** `codeVerifier` from the {@link createPkcePair} call used to build the authorization URL. */
	codeVerifier: string;
}

export interface RefreshTokensOptions extends OAuthClientOptions {
	/** Refresh token to exchange. Calendly refresh tokens are single use. */
	refreshToken: string;
}

export interface RevokeTokenOptions extends OAuthClientOptions {
	/** Access or refresh token to revoke. */
	token: string;
}

export interface OAuthConfig extends OAuthClientOptions {
	/** Tokens returned by {@link exchangeCode} (or the last ones received in `onTokens`). */
	tokens: OAuthTokens;
	/**
	 * Called with the new tokens every time they are refreshed. Persist them:
	 * the previous refresh token stops working after a refresh.
	 */
	onTokens: (tokens: OAuthTokens) => void | Promise<void>;
}

/**
 * Creates a PKCE verifier and its S256 challenge. Keep `codeVerifier` (e.g. in the user's session)
 * for {@link exchangeCode} and send `codeChallenge` to {@link getAuthorizationUrl}.
 *
 * @example
 * ```ts
 * const { codeVerifier, codeChallenge } = await createPkcePair();
 * ```
 */
export async function createPkcePair(): Promise<PkcePair> {
	const codeVerifier: string = base64Url(
		crypto.getRandomValues(new Uint8Array(32)),
	);
	const digest: ArrayBuffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(codeVerifier),
	);

	return { codeVerifier, codeChallenge: base64Url(new Uint8Array(digest)) };
}

/**
 * Returns the Calendly authorization URL to redirect the user to. After the user authorizes your app,
 * Calendly redirects to `redirectUri` with `code` (and `state`) in the query string.
 *
 * @param options  - Client ID, redirect URI, PKCE challenge and optional `state`.
 * @example
 * ```ts
 * res.redirect(getAuthorizationUrl({ clientId, redirectUri, codeChallenge, state }));
 * ```
 */
export function getAuthorizationUrl(options: AuthorizationUrlOptions): string {
	const url: URL = new URL(
		"oauth/authorize",
		withSlash(options.authBaseUrl ?? AUTH_BASE_URL),
	);
	url.searchParams.set("client_id", options.clientId);
	url.searchParams.set("response_type", "code");
	url.searchParams.set("redirect_uri", options.redirectUri);
	url.searchParams.set("code_challenge_method", "S256");
	url.searchParams.set("code_challenge", options.codeChallenge);
	if (options.state !== undefined) url.searchParams.set("state", options.state);

	return url.toString();
}

/**
 * Exchanges the authorization `code` for an access token and a refresh token.
 *
 * @param options  - Client credentials, `code`, `redirectUri` and `codeVerifier`.
 * @throws { CalendlyError } If Calendly rejects the code (the OAuth error is in `body`).
 */
export async function exchangeCode(
	options: ExchangeCodeOptions,
): Promise<OAuthTokens> {
	return tokenRequest<OAuthTokens>(options, "oauth/token", {
		grant_type: "authorization_code",
		code: options.code,
		redirect_uri: options.redirectUri,
		code_verifier: options.codeVerifier,
	});
}

/**
 * Exchanges a refresh token for new tokens. The previous refresh token stops working, so persist the new ones.
 * `CalendlyClient` in `oauth` mode does this for you.
 *
 * @param options  - Client credentials and `refreshToken`.
 * @throws { CalendlyError } If Calendly rejects the refresh token (the OAuth error is in `body`).
 */
export async function refreshTokens(
	options: RefreshTokensOptions,
): Promise<OAuthTokens> {
	return tokenRequest<OAuthTokens>(options, "oauth/token", {
		grant_type: "refresh_token",
		refresh_token: options.refreshToken,
	});
}

/**
 * Revokes an access or refresh token.
 *
 * @param options  - Client credentials and the `token` to revoke.
 * @throws { CalendlyError }
 */
export async function revokeToken(options: RevokeTokenOptions): Promise<void> {
	await tokenRequest<void>(options, "oauth/revoke", { token: options.token });
}

/** Keeps the OAuth tokens of a `CalendlyClient` and refreshes them when they expire. */
export class OAuthSession implements TokenProvider {
	#config: OAuthConfig;
	#tokens: OAuthTokens;
	#refreshPromise?: Promise<string>;

	constructor(config: OAuthConfig) {
		this.#config = config;
		this.#tokens = config.tokens;
	}

	async getToken(): Promise<string> {
		if (this.#refreshPromise) return this.#refreshPromise;

		const expiresAt: number =
			(this.#tokens.created_at + this.#tokens.expires_in) * 1000;
		if (Date.now() >= expiresAt - REFRESH_MARGIN_MS) {
			return this.refresh(this.#tokens.access_token);
		}

		return this.#tokens.access_token;
	}

	async refresh(staleToken: string): Promise<string> {
		if (this.#refreshPromise) return this.#refreshPromise;
		if (staleToken !== this.#tokens.access_token) {
			return this.#tokens.access_token;
		}

		this.#refreshPromise = this.#refresh().finally(() => {
			this.#refreshPromise = undefined;
		});

		return this.#refreshPromise;
	}

	async #refresh(): Promise<string> {
		const tokens: OAuthTokens = await refreshTokens({
			...this.#config,
			refreshToken: this.#tokens.refresh_token,
		});
		this.#tokens = tokens;
		await this.#config.onTokens(tokens);

		return tokens.access_token;
	}
}

async function tokenRequest<T>(
	options: OAuthClientOptions,
	path: string,
	params: Record<string, string>,
): Promise<T> {
	const fetchFn: FetchFn =
		options.fetch ?? ((input, init) => globalThis.fetch(input, init));
	const url: URL = new URL(
		path,
		withSlash(options.authBaseUrl ?? AUTH_BASE_URL),
	);

	try {
		const response: Response = await fetchFn(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				...(options.clientSecret !== undefined && {
					Authorization: `Basic ${btoa(`${options.clientId}:${options.clientSecret}`)}`,
				}),
			},
			body: new URLSearchParams({ ...params, client_id: options.clientId }),
		});
		const text: string = await response.text();

		if (!response.ok) {
			throw new CalendlyError(`[POST] ${path} failed with ${response.status}`, {
				status: response.status,
				body: parseText(text),
			});
		}

		return (text ? JSON.parse(text) : undefined) as T;
	} catch (error) {
		if (error instanceof CalendlyError) throw error;
		throw new CalendlyError(`[POST] ${path} request failed`, {
			cause: error,
		});
	}
}

function parseText(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

function base64Url(bytes: Uint8Array): string {
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function withSlash(url: string): string {
	return url.endsWith("/") ? url : `${url}/`;
}
