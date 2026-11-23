import type { HttpClient } from "../../http.js";
import type { Collection, PaginatedCollection, Resource } from "../../types.js";
import type {
	AvailabilitySchedule,
	AvailabilitySchedulesQuery,
	CreateAvailabilityScheduleRequest,
	EventTypeAvailabilitySchedule,
	EventTypeAvailabilitySchedulesQuery,
	UpdateAvailabilityScheduleRequest,
	UpdateEventTypeAvailabilityScheduleRequest,
	UpdateUserMeetingLimitsRequest,
	UserBusyTime,
	UserBusyTimesQuery,
	UserMeetingLimits,
	UserMeetingLimitsQuery,
} from "./availability.model.js";

/**
 * Methods for the availability endpoints: user availability schedules, event type availability schedules,
 * user busy times and user meeting limits.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const schedules = await calendly.availability.getSchedules({ user: userUri });
 * ```
 */
export class AvailabilityResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns the availability schedules of the given user.
	 * @param query   - `user` URI.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getSchedules(
		query: AvailabilitySchedulesQuery,
		signal?: AbortSignal,
	): Promise<Collection<AvailabilitySchedule>> {
		return this.#http.request("GET", "user_availability_schedules", {
			query,
			signal,
		});
	}

	/**
	 * Returns an availability schedule for the given UUID.
	 * @param uuid    - Availability schedule UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getSchedule(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<AvailabilitySchedule>> {
		return this.#http.request(
			"GET",
			`user_availability_schedules/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Creates an availability schedule for the authenticated user.
	 * Use exactly one `wday` rule per weekday; empty `intervals` mean no availability.
	 * `date` rules before today (in the schedule's timezone) return 400.
	 * The schedule is not applied to any event type until configured separately.
	 * @param body    - `name`, `timezone` and `rules`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async createSchedule(
		body: CreateAvailabilityScheduleRequest,
		signal?: AbortSignal,
	): Promise<Resource<AvailabilitySchedule>> {
		return this.#http.request("POST", "user_availability_schedules", {
			body,
			signal,
		});
	}

	/**
	 * Updates an availability schedule. Omitted fields stay unchanged; `default` can only be set to `true`.
	 * @param uuid    - Availability schedule UUID (not the full URI).
	 * @param body    - Fields to update.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async updateSchedule(
		uuid: string,
		body: UpdateAvailabilityScheduleRequest,
		signal?: AbortSignal,
	): Promise<Resource<AvailabilitySchedule>> {
		return this.#http.request(
			"PATCH",
			`user_availability_schedules/${encodeURIComponent(uuid)}`,
			{ body, signal },
		);
	}

	/**
	 * Returns the availability schedules of the given event type.
	 * @param query   - `event_type` URI.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getEventTypeSchedules(
		query: EventTypeAvailabilitySchedulesQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<EventTypeAvailabilitySchedule>> {
		return this.#http.request("GET", "event_type_availability_schedules", {
			query,
			signal,
		});
	}

	/**
	 * Updates the availability schedule of the given event type,
	 * either by linking a user availability schedule or by sending custom `rules`.
	 * @param query   - `event_type` URI.
	 * @param body    - `availability_rule` and optional `availability_setting`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async updateEventTypeSchedule(
		query: EventTypeAvailabilitySchedulesQuery,
		body: UpdateEventTypeAvailabilityScheduleRequest,
		signal?: AbortSignal,
	): Promise<Resource<EventTypeAvailabilitySchedule>> {
		return this.#http.request("PATCH", "event_type_availability_schedules", {
			query,
			body,
			signal,
		});
	}

	/**
	 * Returns the busy times of the given user (Calendly events, reserved slots and external calendar events).
	 * @param query   - `user` URI, `start_time` and `end_time`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getBusyTimes(
		query: UserBusyTimesQuery,
		signal?: AbortSignal,
	): Promise<Collection<UserBusyTime>> {
		return this.#http.request("GET", "user_busy_times", { query, signal });
	}

	/**
	 * Returns the daily, weekly and monthly meeting limits of the given user (`null` means no limit).
	 * @param query   - `user` URI.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getMeetingLimits(
		query: UserMeetingLimitsQuery,
		signal?: AbortSignal,
	): Promise<Collection<UserMeetingLimits>> {
		return this.#http.request("GET", "user_meeting_limits", { query, signal });
	}

	/**
	 * Updates the meeting limits of the given user. Send at least one limit (otherwise 400);
	 * omitted fields stay unchanged and `null` removes a limit. Values go from 1 to 9999 and each period is independent.
	 * `user` must be the authenticated user (otherwise 403).
	 * @param query   - `user` URI.
	 * @param body    - Limits to update.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async updateMeetingLimits(
		query: UserMeetingLimitsQuery,
		body: UpdateUserMeetingLimitsRequest,
		signal?: AbortSignal,
	): Promise<Resource<UserMeetingLimits>> {
		return this.#http.request("PATCH", "user_meeting_limits", {
			query,
			body,
			signal,
		});
	}
}
