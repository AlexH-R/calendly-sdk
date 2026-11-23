import type { HttpClient } from "../../http.js";
import type {
	DeleteInviteeDataRequest,
	DeleteScheduledEventDataRequest,
} from "./dataCompliance.model.js";

/**
 * Methods for the data compliance endpoints (Enterprise subscription only).
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * await calendly.dataCompliance.deleteInvitees({ emails: ["test@example.com"] });
 * ```
 */
export class DataComplianceResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Requests the deletion of scheduled events data within a time range for your organization.
	 * Requires an Enterprise subscription. Deletion can take up to 7 days to complete.
	 * The range can't exceed 24 months and must be in the past.
	 * @param body    - `start_time` and `end_time` (UTC timestamps) are required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async deleteEvents(
		body: DeleteScheduledEventDataRequest,
		signal?: AbortSignal,
	): Promise<void> {
		await this.#http.request("POST", "data_compliance/deletion/events", {
			body,
			signal,
		});
	}

	/**
	 * Requests the deletion of invitee data from all previously booked events in your organization.
	 * Requires an Enterprise subscription. Deletion can take up to 7 days to complete.
	 * @param body    - `emails` of the invitees whose data must be removed.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async deleteInvitees(
		body: DeleteInviteeDataRequest,
		signal?: AbortSignal,
	): Promise<void> {
		await this.#http.request("POST", "data_compliance/deletion/invitees", {
			body,
			signal,
		});
	}
}
