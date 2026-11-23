import type { HttpClient } from "../../http.js";
import type { PaginatedCollection, Resource } from "../../types.js";
import type {
	RoutingForm,
	RoutingFormSubmission,
	RoutingFormSubmissionsQuery,
	RoutingFormsQuery,
} from "./routingForms.model.js";

/**
 * Methods for the routing forms endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const forms = await calendly.routingForms.getAll({ organization });
 * ```
 */
export class RoutingFormsResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns a list of Routing Forms for the specified Organization.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - `organization` (full URI) is required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAll(
		query: RoutingFormsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<RoutingForm>> {
		return this.#http.request("GET", "routing_forms", { query, signal });
	}

	/**
	 * Returns the specified Routing Form.
	 * @param uuid    - Routing form UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async get(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<RoutingForm>> {
		return this.#http.request(
			"GET",
			`routing_forms/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Returns a list of Submissions for the specified Routing Form.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - `form` (full URI of the routing form) is required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getSubmissions(
		query: RoutingFormSubmissionsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<RoutingFormSubmission>> {
		return this.#http.request("GET", "routing_form_submissions", {
			query,
			signal,
		});
	}

	/**
	 * Returns the specified Routing Form Submission.
	 * @param uuid    - Routing form submission UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getSubmission(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<RoutingFormSubmission>> {
		return this.#http.request(
			"GET",
			`routing_form_submissions/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}
}
