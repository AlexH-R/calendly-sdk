import type { HttpClient } from "../../http.js";
import type { PaginatedCollection, Resource } from "../../types.js";
import type {
	CreateShareRequest,
	Share,
	SharesQuery,
	UpdateShareRequest,
} from "./shares.model.js";

/**
 * Methods for the shares endpoints (customized one-off versions of an event type).
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const { resource: share } = await calendly.shares.create({ event_type });
 * ```
 */
export class SharesResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns the user's Shares, newest first (the "Single-use links" tab in My Calendly).
	 * Disabled Shares, Shares created from meeting polls and links booked through instant booking are not included.
	 * @param query   - `user` is required and must be the URI of the authenticated user (another user returns 403).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAll(
		query: SharesQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<Share>> {
		return this.#http.request("GET", "shares", { query, signal });
	}

	/**
	 * Creates a Share: a customized one-off version of an event type for a specific invitee ("Customize Once and Share").
	 * Only available for one-on-one event types. Any field not provided is copied from the event type.
	 * @param body    - `start_date` and `end_date` are required when `period_type` is `"fixed"`; `max_booking_time` when it is `"moving"` or `"available_moving"`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async create(
		body: CreateShareRequest,
		signal?: AbortSignal,
	): Promise<Resource<Share>> {
		return this.#http.request("POST", "shares", { body, signal });
	}

	/**
	 * Updates a Share. Only active, unbooked single-use Shares can be updated; the parent event type is never modified.
	 * Omitted fields are unchanged; `null` restores the event type value (for `contact`, removes the contact).
	 * `location_configurations` and `availability_rule` replace the existing value.
	 * @param uuid    - Share UUID (not the full URI).
	 * @param body    - Fields to change.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 409 if the Share is booked, disabled, expired or not single-use.
	 */
	async update(
		uuid: string,
		body: UpdateShareRequest,
		signal?: AbortSignal,
	): Promise<Resource<Share>> {
		return this.#http.request("PATCH", `shares/${encodeURIComponent(uuid)}`, {
			body,
			signal,
		});
	}

	/**
	 * Deletes a Share (single-use scheduling link). Only available for Shares that have not been booked.
	 * @param uuid    - Share UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async delete(uuid: string, signal?: AbortSignal): Promise<void> {
		return this.#http.request("DELETE", `shares/${encodeURIComponent(uuid)}`, {
			signal,
		});
	}
}
