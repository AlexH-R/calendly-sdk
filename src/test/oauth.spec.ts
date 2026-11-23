import { describe, expect, it, mock } from "bun:test";
import { CalendlyClient } from "../client.js";
import { CalendlyError } from "../errors.js";
import {
	createPkcePair,
	exchangeCode,
	getAuthorizationUrl,
	type OAuthTokens,
	refreshTokens,
	revokeToken,
} from "../oauth.js";

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

const makeTokens = (
	n: number,
	overrides: Partial<OAuthTokens> = {},
): OAuthTokens => ({
	token_type: "Bearer",
	access_token: `access-${n}`,
	refresh_token: `refresh-${n}`,
	scope: "default",
	created_at: nowSeconds(),
	expires_in: 7200,
	owner: "https://api.calendly.com/users/U",
	organization: "https://api.calendly.com/organizations/O",
	...overrides,
});

const base64Url = (bytes: Uint8Array): string =>
	btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

const authHeader = (init?: RequestInit): string | undefined =>
	(init?.headers as Record<string, string> | undefined)?.Authorization;

type Handler = (url: URL, init?: RequestInit) => Response | Promise<Response>;

const createFetch = (handler: Handler) => {
	const fetchMock = mock(
		async (input: string | URL | Request, init?: RequestInit) =>
			handler(new URL(String(input)), init),
	);
	const calls = (pathname: string) =>
		fetchMock.mock.calls.filter(
			([input]) => new URL(String(input)).pathname === pathname,
		);
	const formOf = (init?: RequestInit) =>
		Object.fromEntries(new URLSearchParams(String(init?.body)));
	const headersOf = (init?: RequestInit) =>
		init?.headers as Record<string, string>;
	return {
		fetch: fetchMock as unknown as typeof fetch,
		fetchMock,
		calls,
		formOf,
		headersOf,
	};
};

describe("PKCE", () => {
	it("Should create a verifier and its S256 challenge", async () => {
		const { codeVerifier, codeChallenge } = await createPkcePair();
		const digest = await crypto.subtle.digest(
			"SHA-256",
			new TextEncoder().encode(codeVerifier),
		);

		expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(codeChallenge).toBe(base64Url(new Uint8Array(digest)));
	});

	it("Should create a different pair every time", async () => {
		const a = await createPkcePair();
		const b = await createPkcePair();

		expect(a.codeVerifier).not.toBe(b.codeVerifier);
	});
});

describe("Authorization URL", () => {
	it("Should build the authorize URL with PKCE and state", () => {
		const url = new URL(
			getAuthorizationUrl({
				clientId: "cid",
				redirectUri: "https://app.com/callback?x=1",
				codeChallenge: "challenge",
				state: "st",
			}),
		);

		expect(url.origin + url.pathname).toBe(
			"https://auth.calendly.com/oauth/authorize",
		);
		expect(Object.fromEntries(url.searchParams)).toEqual({
			client_id: "cid",
			response_type: "code",
			redirect_uri: "https://app.com/callback?x=1",
			code_challenge_method: "S256",
			code_challenge: "challenge",
			state: "st",
		});
	});

	it("Should omit state when not given and accept a custom auth URL", () => {
		const url = new URL(
			getAuthorizationUrl({
				clientId: "cid",
				redirectUri: "https://app.com/callback",
				codeChallenge: "challenge",
				authBaseUrl: "https://proxy.com/auth",
			}),
		);

		expect(url.href.startsWith("https://proxy.com/auth/oauth/authorize?")).toBe(
			true,
		);
		expect(url.searchParams.has("state")).toBe(false);
	});
});

describe("Token endpoints", () => {
	it("Should exchange the code with Basic auth when there is a secret", async () => {
		const tokens = makeTokens(1);
		const { fetch, fetchMock, formOf, headersOf } = createFetch(() =>
			Response.json(tokens),
		);
		const result = await exchangeCode({
			clientId: "cid",
			clientSecret: "secret",
			code: "CODE",
			redirectUri: "https://app.com/callback",
			codeVerifier: "VERIFIER",
			fetch,
		});
		const [input, init] = fetchMock.mock.calls[0] ?? [];

		expect(result).toEqual(tokens);
		expect(String(input)).toBe("https://auth.calendly.com/oauth/token");
		expect(init?.method).toBe("POST");
		expect(headersOf(init)).toEqual({
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${btoa("cid:secret")}`,
		});
		expect(formOf(init)).toEqual({
			grant_type: "authorization_code",
			code: "CODE",
			redirect_uri: "https://app.com/callback",
			code_verifier: "VERIFIER",
			client_id: "cid",
		});
	});

	it("Should not send Basic auth without a secret", async () => {
		const { fetch, fetchMock, formOf, headersOf } = createFetch(() =>
			Response.json(makeTokens(2)),
		);
		await refreshTokens({ clientId: "cid", refreshToken: "R", fetch });
		const init = fetchMock.mock.calls[0]?.[1];

		expect(headersOf(init).Authorization).toBeUndefined();
		expect(formOf(init)).toEqual({
			grant_type: "refresh_token",
			refresh_token: "R",
			client_id: "cid",
		});
	});

	it("Should revoke a token", async () => {
		const { fetch, fetchMock, formOf } = createFetch(
			() => new Response(null, { status: 200 }),
		);
		const result = await revokeToken({ clientId: "cid", token: "T", fetch });
		const [input, init] = fetchMock.mock.calls[0] ?? [];

		expect(result).toBeUndefined();
		expect(String(input)).toBe("https://auth.calendly.com/oauth/revoke");
		expect(formOf(init)).toEqual({ token: "T", client_id: "cid" });
	});

	it("Should throw a CalendlyError with the OAuth error body", async () => {
		const body = {
			error: "invalid_grant",
			error_description: "The provided authorization grant is invalid",
		};
		const { fetch } = createFetch(() => Response.json(body, { status: 400 }));
		const error = (await refreshTokens({
			clientId: "cid",
			refreshToken: "R",
			fetch,
		}).catch((e) => e)) as CalendlyError;

		expect(error).toBeInstanceOf(CalendlyError);
		expect(error.status).toBe(400);
		expect(error.body).toEqual(body);
		expect(error.message).toBe("[POST] oauth/token failed with 400");
	});

	it("Should wrap a network error in a CalendlyError", async () => {
		const cause = new TypeError("fetch failed");
		const { fetch } = createFetch(() => {
			throw cause;
		});
		const error = (await refreshTokens({
			clientId: "cid",
			refreshToken: "R",
			fetch,
		}).catch((e) => e)) as CalendlyError;

		expect(error).toBeInstanceOf(CalendlyError);
		expect(error.cause).toBe(cause);
	});
});

describe("CalendlyClient OAuth mode", () => {
	const createClient = (
		tokens: OAuthTokens,
		api: Handler = () => Response.json({ resource: {} }),
	) => {
		let n = 1;
		const helpers = createFetch((url, init) => {
			if (url.pathname === "/oauth/token") {
				n += 1;
				return Response.json(makeTokens(n));
			}
			return api(url, init);
		});
		const onTokens = mock(async (_tokens: OAuthTokens) => undefined);
		const calendly = new CalendlyClient({
			oauth: { clientId: "cid", clientSecret: "secret", tokens, onTokens },
			fetch: helpers.fetch,
		});
		const apiCalls = () =>
			helpers.fetchMock.mock.calls.filter(
				([input]) => new URL(String(input)).host === "api.calendly.com",
			);
		const authOf = (call: unknown[] | undefined) =>
			helpers.headersOf(call?.[1] as RequestInit).Authorization;
		return { calendly, onTokens, apiCalls, authOf, ...helpers };
	};

	it("Should use the access token while it is valid", async () => {
		const { calendly, calls, apiCalls, authOf, onTokens } = createClient(
			makeTokens(1),
		);
		await calendly.users.getMe();

		expect(calls("/oauth/token")).toHaveLength(0);
		expect(authOf(apiCalls()[0])).toBe("Bearer access-1");
		expect(onTokens).not.toHaveBeenCalled();
	});

	it("Should refresh an expired token before the request and call onTokens", async () => {
		const { calendly, calls, apiCalls, authOf, onTokens, formOf } =
			createClient(makeTokens(1, { created_at: nowSeconds() - 7200 }));
		await calendly.users.getMe();
		await calendly.users.getMe();

		expect(calls("/oauth/token")).toHaveLength(1);
		expect(formOf(calls("/oauth/token")[0]?.[1])).toMatchObject({
			grant_type: "refresh_token",
			refresh_token: "refresh-1",
		});
		expect(authOf(apiCalls()[0])).toBe("Bearer access-2");
		expect(authOf(apiCalls()[1])).toBe("Bearer access-2");
		expect(onTokens).toHaveBeenCalledTimes(1);
		expect(onTokens.mock.calls[0]?.[0]).toMatchObject({
			access_token: "access-2",
			refresh_token: "refresh-2",
		});
	});

	it("Should refresh a token that expires within the next minute", async () => {
		const { calendly, calls } = createClient(
			makeTokens(1, { created_at: nowSeconds() - 7200 + 30 }),
		);
		await calendly.users.getMe();

		expect(calls("/oauth/token")).toHaveLength(1);
	});

	it("Should refresh only once for concurrent requests", async () => {
		const { calendly, calls, apiCalls, authOf, onTokens } = createClient(
			makeTokens(1, { created_at: nowSeconds() - 7200 }),
		);
		await Promise.all([
			calendly.users.getMe(),
			calendly.users.getMe(),
			calendly.users.getMe(),
		]);

		expect(calls("/oauth/token")).toHaveLength(1);
		expect(onTokens).toHaveBeenCalledTimes(1);
		for (const call of apiCalls()) {
			expect(authOf(call)).toBe("Bearer access-2");
		}
	});

	it("Should refresh and retry once on 401", async () => {
		const { calendly, calls, apiCalls, authOf } = createClient(
			makeTokens(1),
			(_url, init) =>
				authHeader(init) === "Bearer access-1"
					? Response.json({ title: "Unauthenticated" }, { status: 401 })
					: Response.json({ resource: { uri: "me" } }),
		);
		const result = await calendly.users.getMe();

		expect(result).toEqual({ resource: { uri: "me" } } as never);
		expect(calls("/oauth/token")).toHaveLength(1);
		expect(apiCalls().map(authOf)).toEqual([
			"Bearer access-1",
			"Bearer access-2",
		]);
	});

	it("Should refresh only once when concurrent requests get 401", async () => {
		const { calendly, calls } = createClient(makeTokens(1), (_url, init) =>
			authHeader(init) === "Bearer access-1"
				? Response.json({}, { status: 401 })
				: Response.json({ resource: {} }),
		);
		await Promise.all([calendly.users.getMe(), calendly.users.getMe()]);

		expect(calls("/oauth/token")).toHaveLength(1);
	});

	it("Should throw a CalendlyError if the retry is also 401", async () => {
		const { calendly, calls, apiCalls } = createClient(makeTokens(1), () =>
			Response.json({}, { status: 401 }),
		);
		const error = await calendly.users.getMe().catch((e: CalendlyError) => e);

		expect(error).toBeInstanceOf(CalendlyError);
		expect((error as CalendlyError).status).toBe(401);
		expect(calls("/oauth/token")).toHaveLength(1);
		expect(apiCalls()).toHaveLength(2);
	});

	it("Should not retry on 401 with a plain access token", async () => {
		const { fetch, fetchMock } = createFetch(() =>
			Response.json({}, { status: 401 }),
		);
		const calendly = new CalendlyClient({ accessToken: "T", fetch });

		await expect(calendly.users.getMe()).rejects.toBeInstanceOf(CalendlyError);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("Should throw a CalendlyError with an incomplete oauth config", () => {
		const onTokens = () => undefined;
		expect(
			() =>
				new CalendlyClient({
					oauth: {
						clientId: "",
						tokens: makeTokens(1),
						onTokens,
					},
				}),
		).toThrow(CalendlyError);
		expect(
			() =>
				new CalendlyClient({
					oauth: {
						clientId: "cid",
						tokens: makeTokens(1),
					} as never,
				}),
		).toThrow(CalendlyError);
	});
});
