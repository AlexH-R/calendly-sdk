import type { ScheduledEvent } from "../scheduledEvents/scheduledEvents.model.js";

export interface MeetingRecapListItem {
	uri: string;
	app_url: string;
	status: string;
	transcript: string;
	event?: string | null;
	name?: string | null;
	location?: ScheduledEvent["location"];
	start_time?: string | null;
	end_time?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	attendees?:
		| {
				host: boolean;
				user_email: string;
				user_name: string;
		  }[]
		| null;
}

export interface MeetingRecap {
	uri: string;
	app_url: string;
	status: string;
	event?: string | null;
	name?: string | null;
	location?: ScheduledEvent["location"];
	start_time?: string | null;
	end_time?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	attendees?: MeetingRecapListItem["attendees"];
	summary_md?: string | null;
	action_items_md?: string | null;
	discussion_md?: string | null;
	transcript?: string | null;
	share_link?: string | null;
}

export type MeetingRecapsQuery = {
	event?: string;
	start_time?: string;
	end_time?: string;
	status?: "available" | "processing" | "unavailable";
	attendee?: string;
	count?: number;
	page_token?: string;
};

export interface MeetingRecapTranscript {
	uri: string;
	text: string;
}

export interface UpdateMeetingRecapRequest {
	summary_md?: string | null;
	action_items_md?: string | null;
	discussion_md?: string | null;
}
