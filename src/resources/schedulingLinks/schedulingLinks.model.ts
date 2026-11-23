export interface SchedulingLink {
	booking_url: string;
	owner?: string;
	owner_type?: "EventType";
}

export interface CreateSchedulingLinkRequest {
	max_event_count: 1;
	owner: string;
	owner_type: "EventType";
}
