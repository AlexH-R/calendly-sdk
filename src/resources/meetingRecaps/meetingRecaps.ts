import type { HttpClient } from "../../http.js";
import type { PaginatedCollection, Resource } from "../../types.js";
import type {
	MeetingRecap,
	MeetingRecapListItem,
	MeetingRecapsQuery,
	MeetingRecapTranscript,
	UpdateMeetingRecapRequest,
} from "./meetingRecaps.model.js";

/**
 * Methods for the meeting recaps endpoints (Notetaker). Requires Notetaker on your plan.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const recaps = await calendly.meetingRecaps.getAll({ status: "available" });
 * ```
 */
export class MeetingRecapsResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns a list of meeting recaps accessible to the authenticated user, both for Calendly-scheduled
	 * and external events (`event` is `null` for external ones). Only `available` recaps are returned unless `status` is set.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - Optional filters (`event`, `start_time`, `end_time`, `status`, `attendee`) and pagination.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if Notetaker is not enabled on your plan.
	 */
	async getAll(
		query?: MeetingRecapsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<MeetingRecapListItem>> {
		return this.#http.request("GET", "meeting_recaps", { query, signal });
	}

	/**
	 * Returns the specified meeting recap, including its Markdown summary, action items and discussion.
	 * @param uuid    - Meeting recap UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if Notetaker is not enabled on your plan.
	 */
	async get(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<MeetingRecap>> {
		return this.#http.request(
			"GET",
			`meeting_recaps/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Returns the transcript of the specified meeting recap as plain text
	 * (one `Speaker: words` segment per line).
	 * @param uuid    - Meeting recap UUID (not the transcript URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if Notetaker is not enabled on your plan.
	 */
	async getTranscript(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<MeetingRecapTranscript>> {
		return this.#http.request(
			"GET",
			`meeting_recaps/${encodeURIComponent(uuid)}/transcript`,
			{ signal },
		);
	}

	/**
	 * Updates the specified meeting recap. Omitted fields are left unchanged; unknown properties are rejected.
	 * @param uuid    - Meeting recap UUID (not the full URI).
	 * @param body    - Any combination of `summary_md`, `action_items_md` and `discussion_md`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if Notetaker is not enabled on your plan.
	 */
	async update(
		uuid: string,
		body: UpdateMeetingRecapRequest,
		signal?: AbortSignal,
	): Promise<Resource<MeetingRecap>> {
		return this.#http.request(
			"PATCH",
			`meeting_recaps/${encodeURIComponent(uuid)}`,
			{ body, signal },
		);
	}

	/**
	 * Deletes the specified meeting recap.
	 * @param uuid    - Meeting recap UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if Notetaker is not enabled on your plan.
	 */
	async delete(uuid: string, signal?: AbortSignal): Promise<void> {
		return this.#http.request(
			"DELETE",
			`meeting_recaps/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}
}
