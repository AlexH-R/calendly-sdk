import type { HttpClient } from "../../http.js";
import type { Collection } from "../../types.js";
import type {
	MeetingLocation,
	MeetingLocationsQuery,
} from "./locations.model.js";

/**
 * Methods for the meeting locations endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const { collection } = await calendly.locations.getAll({ user });
 * ```
 */
export class LocationsResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns the meeting locations configured for the specified user (not paginated).
	 * `connected` is only present for web conferencing locations.
	 * @param query   - `user` (full URI) is required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if the user is not in your organization.
	 */
	async getAll(
		query: MeetingLocationsQuery,
		signal?: AbortSignal,
	): Promise<Collection<MeetingLocation>> {
		return this.#http.request("GET", "locations", { query, signal });
	}
}
