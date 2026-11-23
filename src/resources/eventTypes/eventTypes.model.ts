import type { MeetingLocation } from "../locations/locations.model.js";
import type { User } from "../users/users.model.js";

export interface EventType {
	active: boolean;
	admin_managed: boolean;
	booking_method: "instant" | "poll";
	color: string;
	created_at: string;
	custom_questions: {
		name: string;
		type: "string" | "text" | "phone_number" | "single_select" | "multi_select";
		position: number;
		enabled: boolean;
		required: boolean;
		answer_choices: string[];
		include_other: boolean;
	}[];
	deleted_at: string | null;
	description_html: string | null;
	description_plain: string | null;
	duration: number;
	duration_options: number[] | null;
	start_time_increment: number | null;
	before_buffer: number;
	after_buffer: number;
	internal_note: string | null;
	is_paid: boolean;
	kind: "solo" | "group";
	locale: "en" | "fr" | "es" | "de" | "nl" | "pt" | "it" | "uk";
	locations:
		| {
				kind?: MeetingLocation["kind"];
				location?: string;
				additional_info?: string;
				phone_number?: string;
		  }[]
		| null;
	name: string | null;
	pooling_type: "round_robin" | "collective" | "multi_pool" | null;
	position: number;
	profile: {
		type: "User" | "Team";
		name: string;
		owner: string;
	};
	scheduling_url: string;
	secret: boolean;
	slug: string | null;
	type: "StandardEventType" | "AdhocEventType";
	updated_at: string;
	uri: string;
}

export type EventTypesQuery = {
	active?: boolean;
	organization?: string;
	user?: string;
	user_availability_schedule?: string;
	sort?: `${"name" | "position" | "created_at" | "updated_at"}:${"asc" | "desc"}`;
	admin_managed?: boolean;
	page_token?: string;
	count?: number;
};

export interface EventTypeMembership {
	uri: string;
	event_type: EventType;
	member?: User;
	updated_at?: string;
	created_at?: string;
}

export type EventTypeMembershipsQuery = {
	event_type: string;
	count?: number;
	page_token?: string;
};

export interface EventTypeAvailableTime {
	status: string;
	invitees_remaining: number;
	start_time: string;
	scheduling_url: string;
}

export type EventTypeAvailableTimesQuery = {
	event_type: string;
	start_time: string;
	end_time: string;
};

export interface CreateOneOffEventTypeRequest {
	name: string;
	host: string;
	duration: number;
	date_setting:
		| { type: "date_range"; start_date: string; end_date: string }
		| { type: "days_in_future"; days: number; only_weekdays: boolean }
		| { type: "spots"; spots: { start_time: string; end_time: string }[] };
	co_hosts?: string[];
	timezone?: string;
	location?:
		| { kind: "custom"; location?: string }
		| { kind: "google_conference" }
		| { kind: "gotomeeting_conference" }
		| { kind: "physical"; location?: string; additional_info?: string }
		| { kind: "inbound_call"; phone_number: string; additional_info?: string }
		| { kind: "ask_invitee"; location?: string }
		| { kind: "microsoft_teams_conference" }
		| { kind: "outbound_call" }
		| { kind: "webex_conference" }
		| { kind: "zoom_conference" };
}

export interface CreateEventTypeRequest {
	owner: string;
	name: string;
	active?: boolean;
	description?: string;
	duration?: number;
	duration_options?: number[];
	start_time_increment?: number;
	before_buffer?: 0 | 5 | 10 | 15 | 30 | 45 | 60 | 90 | 120 | 150 | 180;
	after_buffer?: CreateEventTypeRequest["before_buffer"];
	locations?: NonNullable<EventType["locations"]>;
	color?: string;
	locale?: EventType["locale"];
}

export interface UpdateEventTypeRequest {
	active?: boolean;
	name?: string;
	color?: string;
	description?: string;
	duration?: number;
	duration_options?: number[];
	start_time_increment?: number;
	before_buffer?: CreateEventTypeRequest["before_buffer"];
	after_buffer?: CreateEventTypeRequest["before_buffer"];
	locale?: EventType["locale"];
	locations?: NonNullable<EventType["locations"]>;
}
