export interface ScheduledEvent {
	uri: string;
	name: string | null;
	status: "active" | "canceled";
	start_time: string;
	end_time: string;
	event_type: string;
	location:
		| { type: "physical"; location: string; additional_info?: string }
		| { type: "outbound_call"; location: string | null }
		| { type: "inbound_call"; location: string; additional_info?: string }
		| {
				type: "google_conference";
				status: "processing" | "initiated" | "pushed" | "failed" | null;
				join_url: string | null;
		  }
		| {
				type: "zoom";
				status: "processing" | "initiated" | "pushed" | "failed" | null;
				join_url: string | null;
				data: {
					id?: string | number;
					settings?: {
						global_dial_in_numbers?: {
							number?: string;
							country?: string;
							type?: string;
							city?: string;
							country_name?: string;
						}[];
					};
					extra?: { intl_numbers_url?: string };
					password?: string;
				} | null;
		  }
		| {
				type: "gotomeeting";
				status: "initiated" | "processing" | "pushed" | "failed" | null;
				join_url: string | null;
				data: { uniqueMeetingId?: number; conferenceCallInfo?: string } | null;
		  }
		| {
				type: "microsoft_teams_conference";
				status: "processing" | "initiated" | "pushed" | "failed" | null;
				join_url: string | null;
				data: {
					id?: string;
					audioConferencing?: {
						conferenceId?: string;
						dialinUrl?: string;
						tollNumber?: string;
					} | null;
				} | null;
		  }
		| { type: "custom"; location: string | null }
		| { type: "ask_invitee"; location: string }
		| {
				type: "webex_conference";
				status: "processing" | "initiated" | "pushed" | "failed" | null;
				join_url: string | null;
				data: {
					id: string;
					telephony: {
						callInNumbers: {
							label: string;
							callInNumber: string;
							tollType: string;
						}[];
					};
					password: string;
				} | null;
		  };
	invitees_counter: {
		total: number;
		active: number;
		limit: number;
	};
	created_at: string;
	updated_at: string;
	event_memberships: {
		user: string;
		user_email?: string;
		user_name?: string;
		buffered_end_time?: string;
		buffered_start_time?: string;
	}[];
	event_guests: {
		email: string;
		created_at: string;
		updated_at: string;
	}[];
	calendar_event: {
		kind: "exchange" | "google" | "icloud" | "outlook" | "outlook_desktop";
		external_id: string;
	};
	meeting_notes_plain?: string | null;
	meeting_notes_html?: string;
	cancellation?: {
		canceled_by: string;
		reason: string | null;
		canceler_type: "host" | "invitee";
		created_at: string;
	};
	booking_method?: string;
}

export type ScheduledEventsQuery = {
	user?: string;
	organization?: string;
	invitee_email?: string;
	status?: "active" | "canceled";
	sort?: "start_time:asc" | "start_time:desc";
	min_start_time?: string;
	max_start_time?: string;
	page_token?: string;
	count?: number;
	group?: string;
};

export interface Invitee {
	uri: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
	name: string;
	status: "active" | "canceled";
	questions_and_answers: {
		question: string;
		answer: string;
		position: number;
	}[];
	timezone: string | null;
	event: string;
	created_at: string;
	updated_at: string;
	tracking: {
		utm_campaign: string | null;
		utm_source: string | null;
		utm_medium: string | null;
		utm_content: string | null;
		utm_term: string | null;
		salesforce_uuid: string | null;
	};
	text_reminder_number: string | null;
	rescheduled: boolean;
	old_invitee: string | null;
	new_invitee: string | null;
	cancel_url: string;
	reschedule_url: string;
	routing_form_submission: string | null;
	payment: {
		external_id: string;
		provider: "stripe" | "paypal";
		amount: number;
		currency: "AUD" | "CAD" | "EUR" | "GBP" | "USD";
		terms: string | null;
		successful: boolean;
	} | null;
	no_show: {
		uri: string;
		created_at: string;
	} | null;
	reconfirmation: {
		created_at: string;
		confirmed_at: string | null;
	} | null;
	scheduling_method: "instant_book" | "api" | null;
	invitee_scheduled_by: string | null;
	cancellation?: ScheduledEvent["cancellation"];
}

export type InviteesQuery = {
	status?: "active" | "canceled";
	sort?: "created_at:asc" | "created_at:desc";
	email?: string;
	page_token?: string;
	count?: number;
};

export interface InviteeNoShow {
	uri: string;
	invitee: string;
	created_at: string;
}

export interface CreateInviteeNoShowRequest {
	invitee: string;
}

export interface CreateInviteeRequest {
	event_type: string;
	start_time: string;
	invitee: {
		email: string;
		timezone: string;
		name?: string;
		first_name?: string;
		last_name?: string;
		text_reminder_number?: string;
	};
	location?:
		| { kind: "physical"; location: string }
		| { kind: "inbound_call" }
		| { kind: "outbound_call"; location: string }
		| { kind: "zoom_conference" }
		| { kind: "google_conference" }
		| { kind: "gotomeeting_conference" }
		| { kind: "microsoft_teams_conference" }
		| { kind: "webex_conference" }
		| { kind: "ask_invitee"; location: string }
		| { kind: "custom"; location: string };
	questions_and_answers?: Invitee["questions_and_answers"];
	tracking?: Invitee["tracking"];
	event_guests?: string[];
}

export interface CancelScheduledEventRequest {
	reason?: string;
}
