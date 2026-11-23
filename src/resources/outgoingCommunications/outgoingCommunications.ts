import type { HttpClient } from "../../http.js";
import type { PaginatedCollection } from "../../types.js";
import type {
	OutgoingCommunication,
	OutgoingCommunicationsQuery,
} from "./outgoingCommunications.model.js";

/**
 * Methods for the outgoing communications endpoints (Enterprise only).
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const { collection, total_count } = await calendly.outgoingCommunications.getAll({ organization });
 * ```
 */
export class OutgoingCommunicationsResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns a list of outgoing SMS and email communications of the specified Organization.
	 * Requires an Enterprise subscription and owner/admin role.
	 * The list is paginated (20 per page by default; use `count` and `page_token`) and includes `total_count`.
	 * @param query   - `organization` (full URI) is required. `min_created_at` and `max_created_at` use UTC (e.g. `"2020-01-02T03:04:05.678Z"`).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if the account is not Enterprise or you are not an owner/admin.
	 */
	async getAll(
		query: OutgoingCommunicationsQuery,
		signal?: AbortSignal,
	): Promise<
		PaginatedCollection<OutgoingCommunication> & { total_count: number }
	> {
		return this.#http.request("GET", "outgoing_communications", {
			query,
			signal,
		});
	}
}
