import type { PaginatedCollection } from "../../types.js";

export interface ActivityLogEntry {
	occurred_at: string;
	details: Record<string, unknown>;
	fully_qualified_name: string;
	uri: string;
	namespace: string;
	action: string;
	organization: string;
	actor?: {
		type: string;
		uri?: string;
		organization?: { uri?: string; role?: string };
		group?: { uri?: string; name?: string; role?: string };
		display_name?: string;
		alternative_identifier?: string;
	};
}

export type ActivityLogEntriesQuery = {
	organization: string;
	search_term?: string;
	actor?: string[];
	sort?: (
		| "action:asc"
		| "action:desc"
		| "actor.display_name:asc"
		| "actor.display_name:desc"
		| "actor.uri:asc"
		| "actor.uri:desc"
		| "namespace:asc"
		| "namespace:desc"
		| "occurred_at:asc"
		| "occurred_at:desc"
	)[];
	min_occurred_at?: string;
	max_occurred_at?: string;
	page_token?: string;
	count?: number;
	namespace?: string[];
	action?: string[];
};

export interface ActivityLogEntries
	extends PaginatedCollection<ActivityLogEntry> {
	total_count: number;
	exceeds_max_total_count: boolean;
	last_event_time?: string | null;
}
