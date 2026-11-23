import type { HttpClient } from "../../http.js";
import type { Resource } from "../../types.js";
import type {
	CreateSchedulingLinkRequest,
	SchedulingLink,
} from "./schedulingLinks.model.js";

/**
 * Methods for the scheduling links endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const { resource: link } = await calendly.schedulingLinks.create({
 * 	max_event_count: 1,
 * 	owner: eventTypeUri,
 * 	owner_type: "EventType",
 * });
 * ```
 */
export class SchedulingLinksResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Creates a single-use scheduling link for an event type.
	 * @param body    - `owner` is the URI of the event type; `max_event_count` is always `1`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async create(
		body: CreateSchedulingLinkRequest,
		signal?: AbortSignal,
	): Promise<Resource<SchedulingLink>> {
		return this.#http.request("POST", "scheduling_links", { body, signal });
	}
}
