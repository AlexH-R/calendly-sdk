import type { HttpClient } from "../../http.js";
import type {
	ActivityLogEntries,
	ActivityLogEntriesQuery,
} from "./activityLog.model.js";

/**
 * Methods for the activity log endpoints. Requires an Enterprise subscription.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const entries = await calendly.activityLog.getAll({ organization: organizationUri });
 * ```
 */
export class ActivityLogResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns a list of activity log entries of an organization. Requires an Enterprise subscription.
	 * `search_term` supports `|` (or), `+` (and), `"..."` (exact), `-` (exclude), `()` (precedence) and `*` (prefix).
	 * `actor`, `sort`, `namespace` and `action` accept several values (sent comma-separated); `sort` defaults to `occurred_at:desc`.
	 * Occurred-at filters use UTC. The list is paginated (20 per page by default; use `count` and `page_token`);
	 * if `exceeds_max_total_count` is true there are more results than `total_count`.
	 * @param query   - `organization` URI is required; optional filters, `sort` and pagination.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAll(
		query: ActivityLogEntriesQuery,
		signal?: AbortSignal,
	): Promise<ActivityLogEntries> {
		return this.#http.request("GET", "activity_log_entries", { query, signal });
	}
}
