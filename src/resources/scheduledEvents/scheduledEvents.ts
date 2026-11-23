import type { HttpClient } from "../../http.js";
import type { PaginatedCollection, Resource } from "../../types.js";
import type {
	CancelScheduledEventRequest,
	CreateInviteeNoShowRequest,
	CreateInviteeRequest,
	Invitee,
	InviteeNoShow,
	InviteesQuery,
	ScheduledEvent,
	ScheduledEventsQuery,
} from "./scheduledEvents.model.js";

/**
 * Methods for the scheduled events endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const events = await calendly.scheduledEvents.getAll({ user, status: "active" });
 * ```
 */
export class ScheduledEventsResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns a list of Events.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - Pass `user`, `organization` or `group`:
	 * - `user` alone returns your own events, in any organization you are or were part of.
	 * - `organization` returns the organization's events (requires admin/owner).
	 * - `group` returns the group's events (requires organization admin/owner or group admin).
	 * - Admins/owners can combine `organization` with `user` or with `group`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAll(
		query: ScheduledEventsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<ScheduledEvent>> {
		return this.#http.request("GET", "scheduled_events", { query, signal });
	}

	/**
	 * Returns information about a specified Event.
	 * @param uuid    - Event UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async get(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<ScheduledEvent>> {
		return this.#http.request(
			"GET",
			`scheduled_events/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Returns a list of Invitees for an Event.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param uuid    - Event UUID (not the full URI).
	 * @param query   - Optional filters (`status`, `email`, `sort`) and pagination.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getInvitees(
		uuid: string,
		query?: InviteesQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<Invitee>> {
		return this.#http.request(
			"GET",
			`scheduled_events/${encodeURIComponent(uuid)}/invitees`,
			{ query, signal },
		);
	}

	/**
	 * Returns information about a specified Invitee (person invited to an Event).
	 * @param eventUuid    - Event UUID (not the full URI).
	 * @param inviteeUuid  - Invitee UUID (not the full URI).
	 * @param signal       - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getInvitee(
		eventUuid: string,
		inviteeUuid: string,
		signal?: AbortSignal,
	): Promise<Resource<Invitee>> {
		return this.#http.request(
			"GET",
			`scheduled_events/${encodeURIComponent(eventUuid)}/invitees/${encodeURIComponent(inviteeUuid)}`,
			{ signal },
		);
	}

	/**
	 * Creates a new Event and Invitee (Scheduling API), with the same notifications,
	 * calendar invites, reminders and workflows as a booking made through the Calendly UI.
	 * - Paid event types are not supported.
	 * - `location.kind` must match one of the locations configured in the event type.
	 * - Do not send `location` for round robin event types.
	 * - `event_guests` allows up to 10 emails.
	 * @param body    - Event type URI, start time, invitee data and optional location, answers, tracking and guests.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async createInvitee(
		body: CreateInviteeRequest,
		signal?: AbortSignal,
	): Promise<Resource<Invitee>> {
		return this.#http.request("POST", "invitees", { body, signal });
	}

	/**
	 * Returns information about a specified Invitee No Show.
	 * @param uuid    - Invitee No Show UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getInviteeNoShow(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<InviteeNoShow>> {
		return this.#http.request(
			"GET",
			`invitee_no_shows/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Marks an Invitee as a No Show.
	 * @param body    - `invitee` is the full URI of the Invitee.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async createInviteeNoShow(
		body: CreateInviteeNoShowRequest,
		signal?: AbortSignal,
	): Promise<Resource<InviteeNoShow>> {
		return this.#http.request("POST", "invitee_no_shows", { body, signal });
	}

	/**
	 * Cancels the specified Event.
	 * @param uuid    - Event UUID (not the full URI).
	 * @param body    - Optional cancellation `reason`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if the event is in the past, already canceled, or you are not allowed to cancel it.
	 */
	async cancel(
		uuid: string,
		body?: CancelScheduledEventRequest,
		signal?: AbortSignal,
	): Promise<Resource<NonNullable<ScheduledEvent["cancellation"]>>> {
		return this.#http.request(
			"POST",
			`scheduled_events/${encodeURIComponent(uuid)}/cancellation`,
			{ body: body ?? {}, signal },
		);
	}
}
