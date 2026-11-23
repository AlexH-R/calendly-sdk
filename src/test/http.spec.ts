import { describe, expect, it, mock } from "bun:test";
import { CalendlyClient } from "../client.js";
import { CalendlyError } from "../errors.js";
import { HttpClient } from "../http.js";

const createClient = (
	respond: () => Response | Promise<Response> = () =>
		Response.json({ ok: true }),
) => {
	const fetchMock = mock(
		async (_input: string | URL | Request, _init?: RequestInit) => respond(),
	);
	const http = new HttpClient({
		baseUrl: "https://api.calendly.com/",
		auth: { getToken: async () => "T" },
		fetch: fetchMock as unknown as typeof fetch,
	});
	const lastRequest = () => {
		const [input, init] = fetchMock.mock.calls.at(-1) ?? [];
		return {
			url: new URL(String(input)),
			method: init?.method,
			headers: init?.headers as Record<string, string>,
			body: init?.body,
			signal: init?.signal,
		};
	};
	return { http, fetchMock, lastRequest };
};

describe("HTTP client", () => {
	it("Should send the access token as a Bearer token", async () => {
		const { http, fetchMock, lastRequest } = createClient(() =>
			Response.json({ resource: { uri: "u1" } }),
		);
		const result = await http.request("GET", "users/me");

		expect(result).toEqual({ resource: { uri: "u1" } });
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(lastRequest().headers.Authorization).toBe("Bearer T");
		expect(lastRequest().url.href).toBe("https://api.calendly.com/users/me");
	});

	it("Should strip a leading slash from the path", async () => {
		const { http, lastRequest } = createClient();
		await http.request("GET", "/users/me");

		expect(lastRequest().url.href).toBe("https://api.calendly.com/users/me");
	});

	it("Should send a JSON body with Content-Type on write methods", async () => {
		const { http, lastRequest } = createClient();
		await http.request("POST", "shares", { body: { a: 1 } });
		const req = lastRequest();

		expect(req.method).toBe("POST");
		expect(req.body).toBe(JSON.stringify({ a: 1 }));
		expect(req.headers["Content-Type"]).toBe("application/json");
	});

	it("Should not send a body or Content-Type on GET", async () => {
		const { http, lastRequest } = createClient();
		await http.request("GET", "shares", { body: { a: 1 } });
		const req = lastRequest();

		expect(req.body).toBeUndefined();
		expect(req.headers["Content-Type"]).toBeUndefined();
	});

	it("Should not send Content-Type when there is no body", async () => {
		const { http, lastRequest } = createClient();
		await http.request("DELETE", "shares/x");
		const req = lastRequest();

		expect(req.body).toBeUndefined();
		expect(req.headers["Content-Type"]).toBeUndefined();
	});

	it("Should pass the AbortSignal to fetch", async () => {
		const { http, lastRequest } = createClient();
		const controller = new AbortController();
		await http.request("GET", "users/me", { signal: controller.signal });

		expect(lastRequest().signal).toBe(controller.signal);
	});

	it("Should resolve to undefined on an empty body", async () => {
		const { http } = createClient(() => new Response(null, { status: 204 }));
		expect(await http.request("DELETE", "shares/x")).toBeUndefined();
	});

	it("Should resolve to undefined on a 202 with an empty body", async () => {
		const { http } = createClient(() => new Response("", { status: 202 }));
		expect(
			await http.request("POST", "data_compliance/deletion/events", {
				body: {},
			}),
		).toBeUndefined();
	});
});

describe("Query serialization", () => {
	it("Should serialize scalar params and skip undefined ones", async () => {
		const { http, lastRequest } = createClient();
		await http.request("GET", "scheduled_events", {
			query: { count: 20, user: "u", active: false, page_token: undefined },
		});
		const { searchParams } = lastRequest().url;

		expect(searchParams.get("count")).toBe("20");
		expect(searchParams.get("user")).toBe("u");
		expect(searchParams.get("active")).toBe("false");
		expect(searchParams.has("page_token")).toBe(false);
	});

	it("Should join arrays with commas and drop duplicates and undefined", async () => {
		const { http, lastRequest } = createClient();
		await http.request("GET", "contacts", {
			query: { email: ["a@x.com", undefined, "b@x.com", "a@x.com"] },
		});

		expect(lastRequest().url.searchParams.get("email")).toBe("a@x.com,b@x.com");
	});

	it("Should skip empty arrays", async () => {
		const { http, lastRequest } = createClient();
		await http.request("GET", "contacts", { query: { email: [] } });

		expect(lastRequest().url.search).toBe("");
	});

	it("Should encode query values", async () => {
		const { http, lastRequest } = createClient();
		const user = "https://api.calendly.com/users/AAA";
		await http.request("GET", "event_types", { query: { user } });

		expect(lastRequest().url.searchParams.get("user")).toBe(user);
		expect(lastRequest().url.search).toBe(`?user=${encodeURIComponent(user)}`);
	});
});

describe("HTTP client errors", () => {
	it("Should parse a JSON error body", async () => {
		const body = {
			title: "Resource Not Found",
			message: "The server could not find the requested resource.",
		};
		const { http } = createClient(() => Response.json(body, { status: 404 }));
		const error = await http
			.request<never>("GET", "users/x")
			.catch((e: CalendlyError) => e);

		expect(error).toBeInstanceOf(CalendlyError);
		expect(error.status).toBe(404);
		expect(error.body).toEqual(body);
		expect(error.message).toBe("[GET] users/x failed with 404");
		expect(error.name).toBe("CalendlyError");
	});

	it("Should keep a non-JSON error body as text", async () => {
		const { http } = createClient(
			() => new Response("Bad Gateway", { status: 502 }),
		);
		const error = await http
			.request<never>("GET", "users/me")
			.catch((e: CalendlyError) => e);

		expect(error.status).toBe(502);
		expect(error.body).toBe("Bad Gateway");
	});

	it("Should wrap a network error in a CalendlyError with the cause", async () => {
		const cause = new TypeError("fetch failed");
		const { http } = createClient(() => {
			throw cause;
		});
		const error = await http
			.request<never>("GET", "users/me")
			.catch((e: CalendlyError) => e);

		expect(error).toBeInstanceOf(CalendlyError);
		expect(error.message).toBe("[GET] users/me request failed");
		expect(error.status).toBeUndefined();
		expect(error.cause).toBe(cause);
	});

	it("Should wrap an invalid JSON success body in a CalendlyError", async () => {
		const { http } = createClient(() => new Response("not json"));

		await expect(http.request("GET", "users/me")).rejects.toBeInstanceOf(
			CalendlyError,
		);
	});
});

describe("CalendlyClient config", () => {
	it("Should throw a CalendlyError without an accessToken", () => {
		expect(() => new CalendlyClient({ accessToken: "" })).toThrow(
			CalendlyError,
		);
	});

	it("Should throw a CalendlyError with an invalid baseUrl", () => {
		expect(
			() => new CalendlyClient({ accessToken: "T", baseUrl: "not a url" }),
		).toThrow(CalendlyError);
	});

	it("Should add a trailing slash to the baseUrl", async () => {
		const fetchMock = mock(async (_input: string | URL | Request) =>
			Response.json({ resource: {} }),
		);
		const calendly = new CalendlyClient({
			accessToken: "T",
			baseUrl: "https://proxy.example.com/calendly",
			fetch: fetchMock as unknown as typeof fetch,
		});
		await calendly.users.getMe();

		expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
			"https://proxy.example.com/calendly/users/me",
		);
	});
});
