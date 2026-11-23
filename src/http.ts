import { CalendlyError } from "./errors.js";

type QueryValue = string | number | boolean | undefined;

export interface RequestOptions {
	query?: Record<string, QueryValue | QueryValue[]>;
	body?: unknown;
	signal?: AbortSignal;
}

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type FetchFn = (
	input: string | URL | Request,
	init?: RequestInit,
) => Promise<Response>;

export interface TokenProvider {
	getToken(): Promise<string>;
	refresh?(staleToken: string): Promise<string>;
}

export interface HttpConfig {
	baseUrl: string;
	auth: TokenProvider;
	fetch: FetchFn;
}

export class HttpClient {
	#config: HttpConfig;

	constructor(config: HttpConfig) {
		this.#config = config;
	}

	async request<T>(
		method: RequestMethod,
		path: string,
		opts: RequestOptions = {},
	): Promise<T> {
		try {
			const baseUrl: string = this.#config.baseUrl;
			const url: URL = new URL(path.replace(/^\//, ""), baseUrl);

			for (const [key, value] of Object.entries(opts.query ?? {})) {
				if (Array.isArray(value)) {
					const values: Set<string> = new Set();
					for (const v of value) {
						if (v !== undefined) values.add(String(v));
					}
					if (values.size > 0) url.searchParams.set(key, [...values].join(","));
				} else if (value !== undefined) {
					url.searchParams.set(key, String(value));
				}
			}

			let token: string = await this.#config.auth.getToken();
			let response: Response = await this.#send(method, url, token, opts);

			if (response.status === 401 && this.#config.auth.refresh) {
				token = await this.#config.auth.refresh(token);
				response = await this.#send(method, url, token, opts);
			}

			if (!response.ok) {
				throw new CalendlyError(
					`[${method}] ${path} failed with ${response.status}`,
					{
						status: response.status,
						body: await this.#parseBody(response),
					},
				);
			}

			const text: string = await response.text();
			return (text ? JSON.parse(text) : undefined) as T;
		} catch (error) {
			if (!(error instanceof CalendlyError)) {
				throw new CalendlyError(`[${method}] ${path} request failed`, {
					cause: error,
				});
			}

			throw error;
		}
	}

	async #send(
		method: RequestMethod,
		url: URL,
		token: string,
		opts: RequestOptions,
	): Promise<Response> {
		const hasBody: boolean = method !== "GET" && opts.body !== undefined;

		return this.#config.fetch(url, {
			method,
			headers: {
				Authorization: `Bearer ${token}`,
				...(hasBody && { "Content-Type": "application/json" }),
			},
			body: hasBody ? JSON.stringify(opts.body) : undefined,
			signal: opts.signal ?? undefined,
		});
	}

	async #parseBody(response: Response): Promise<unknown> {
		const text: string = await response.text();
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	}
}
