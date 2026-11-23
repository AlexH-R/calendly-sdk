import type { HttpClient } from "../../http.js";
import type { Collection, PaginatedCollection, Resource } from "../../types.js";
import type {
	CreateEventTypeRequest,
	CreateOneOffEventTypeRequest,
	EventType,
	EventTypeAvailableTime,
	EventTypeAvailableTimesQuery,
	EventTypeMembership,
	EventTypeMembershipsQuery,
	EventTypesQuery,
	UpdateEventTypeRequest,
} from "./eventTypes.model.js";

/**
 * Methods for the event types, event type hosts, available times and one-off event types endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const eventTypes = await calendly.eventTypes.getAll({ user, active: true });
 * ```
 */
export class EventTypesResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns all Event Types associated with a specified User or Organization.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - Pass `organization` or `user` (full URI); `active`, `admin_managed`, `user_availability_schedule` and `sort` are optional filters.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAll(
		query: EventTypesQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<EventType>> {
		return this.#http.request("GET", "event_types", { query, signal });
	}

	/**
	 * Returns information about a specified Event Type.
	 * @param uuid    - Event type UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async get(uuid: string, signal?: AbortSignal): Promise<Resource<EventType>> {
		return this.#http.request(
			"GET",
			`event_types/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Returns the hosts (memberships) of the specified Event Type.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - `event_type` (full URI) is required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getHosts(
		query: EventTypeMembershipsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<EventTypeMembership>> {
		return this.#http.request("GET", "event_type_memberships", {
			query,
			signal,
		});
	}

	/**
	 * Returns the available times for an Event Type within a date range.
	 * The range between `start_time` and `end_time` can't exceed 31 days, and `start_time` can't be in the past.
	 * For group event types, `invitees_remaining` can be greater than 1.
	 * @param query   - `event_type` (full URI), `start_time` and `end_time` are required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAvailableTimes(
		query: EventTypeAvailableTimesQuery,
		signal?: AbortSignal,
	): Promise<Collection<EventTypeAvailableTime>> {
		return this.#http.request("GET", "event_type_available_times", {
			query,
			signal,
		});
	}

	/**
	 * Creates a one-off Event Type (`type: "AdhocEventType"`).
	 * `start_date` and `end_date` use `YYYY-MM-DD`; `end_date` must be in the future and less than 365 days after `start_date`.
	 * `timezone` defaults to the host's timezone.
	 * @param body    - One-off event type data.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async createOneOff(
		body: CreateOneOffEventTypeRequest,
		signal?: AbortSignal,
	): Promise<Resource<EventType>> {
		return this.#http.request("POST", "one_off_event_types", {
			body,
			signal,
		});
	}

	/**
	 * Creates a new Event Type. Only solo (one-on-one) event types are supported.
	 * If `duration_options` is given, `duration` must be one of them (max 4 options, each 1–720 minutes).
	 * `start_time_increment` is 5–720 (default 30), buffers default to 0 and `active` defaults to false.
	 * @param body    - Event type data; `owner` (user URI) and `name` are required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async create(
		body: CreateEventTypeRequest,
		signal?: AbortSignal,
	): Promise<Resource<EventType>> {
		return this.#http.request("POST", "event_types", { body, signal });
	}

	/**
	 * Updates an existing Event Type. Only solo (one-on-one) event types are supported.
	 * Omitted fields keep their current value. If `duration_options` is given, `duration` must be one of them
	 * (max 4 options, each 1–720 minutes). `start_time_increment` must be 5–720.
	 * @param uuid    - Event type UUID (not the full URI).
	 * @param body    - Fields to update.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async update(
		uuid: string,
		body: UpdateEventTypeRequest,
		signal?: AbortSignal,
	): Promise<Resource<EventType>> {
		return this.#http.request(
			"PATCH",
			`event_types/${encodeURIComponent(uuid)}`,
			{ body, signal },
		);
	}
}
