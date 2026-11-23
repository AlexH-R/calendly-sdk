import type { HttpClient } from "../../http.js";
import type { Resource } from "../../types.js";
import type { User } from "./users.model.js";

/**
 * Methods for the users endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const { resource: me } = await calendly.users.getMe();
 * ```
 */
export class UsersResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns information about a specified User.
	 * @param uuid    - User UUID (not the full URI), or `"me"` for the caller.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async get(uuid: string, signal?: AbortSignal): Promise<Resource<User>> {
		return this.#http.request("GET", `users/${encodeURIComponent(uuid)}`, {
			signal,
		});
	}

	/**
	 * Returns basic information about your user account (the owner of the access token).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getMe(signal?: AbortSignal): Promise<Resource<User>> {
		return this.#http.request("GET", "users/me", { signal });
	}
}
