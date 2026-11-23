import type { SchedulingLink } from "../schedulingLinks/schedulingLinks.model.js";

export interface Share {
	uri: string;
	contact: string | null;
	created_at: string;
	status: "active" | "booked" | "expired";
	scheduling_links: SchedulingLink[];
	share_override: {
		name?: string;
		duration?: number;
		duration_options?: number[];
		period_type?: "available_moving" | "moving" | "fixed" | "unlimited";
		start_date?: string | null;
		end_date?: string | null;
		max_booking_time?: number | null;
		min_booking_time?: number | null;
		hide_location?: boolean | null;
		location_configurations?: {
			location?: string | null;
			additional_info?: string | null;
			phone_number?: string | null;
			position?: number;
			kind?:
				| "physical"
				| "ask_invitee"
				| "custom"
				| "outbound_call"
				| "inbound_call"
				| "google_conference"
				| "gotomeeting_conference"
				| "microsoft_teams_conference"
				| "zoom_conference";
		}[];
		availability_rule?: {
			rules: {
				type: "wday" | "date";
				intervals: {
					from: string;
					to: string;
				}[];
				wday?:
					| "sunday"
					| "monday"
					| "tuesday"
					| "wednesday"
					| "thursday"
					| "friday"
					| "saturday";
				date?: string;
			}[];
			timezone: string;
		};
	};
}

export type SharesQuery = {
	user: string;
	min_created_at?: string;
	max_created_at?: string;
	event_type?: string;
	sort?: "created_at:desc" | "created_at:asc";
	count?: number;
	page_token?: string;
};

export interface UpdateShareRequest {
	contact?: string | null;
	name?: string | null;
	duration?: number | null;
	duration_options?: number[] | null;
	period_type?: "available_moving" | "moving" | "fixed" | "unlimited" | null;
	start_date?: string | null;
	end_date?: string | null;
	max_booking_time?: number | null;
	min_booking_time?: number | null;
	hide_location?: boolean | null;
	location_configurations?:
		| {
				kind:
					| "physical"
					| "ask_invitee"
					| "custom"
					| "outbound_call"
					| "inbound_call"
					| "google_conference"
					| "gotomeeting_conference"
					| "microsoft_teams_conference"
					| "zoom_conference";
				location?: string | null;
				additional_info?: string | null;
				phone_number?: string | null;
				position?: number;
		  }[]
		| null;
	availability_rule?: {
		rules: {
			type: "wday" | "date";
			wday?:
				| "sunday"
				| "monday"
				| "tuesday"
				| "wednesday"
				| "thursday"
				| "friday"
				| "saturday";
			date?: string;
			intervals?: {
				from?: string;
				to?: string;
			}[];
		}[];
		timezone: string;
	} | null;
}
export interface CreateShareRequest {
	event_type: string;
	name?: string;
	duration?: number;
	duration_options?: number[];
	period_type?: "available_moving" | "moving" | "fixed" | "unlimited";
	start_date?: string;
	end_date?: string;
	max_booking_time?: number;
	hide_location?: boolean;
	location_configurations?: {
		location?: string;
		additional_info?: string;
		phone_number?: string;
		position?: number;
		kind?:
			| "physical"
			| "ask_invitee"
			| "custom"
			| "outbound_call"
			| "inbound_call"
			| "google_conference"
			| "gotomeeting_conference"
			| "microsoft_teams_conference"
			| "webex_conference"
			| "zoom_conference";
	}[];
	availability_rule?: {
		rules: {
			type?: "wday" | "date";
			wday?:
				| "sunday"
				| "monday"
				| "tuesday"
				| "wednesday"
				| "thursday"
				| "friday"
				| "saturday";
			date?: string;
			intervals?: {
				from?: string;
				to?: string;
			}[];
		}[];
		timezone: string;
	};
}
