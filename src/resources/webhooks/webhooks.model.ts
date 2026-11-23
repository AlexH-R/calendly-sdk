export interface WebhookSubscription {
	uri: string;
	callback_url: string;
	created_at: string;
	updated_at: string;
	retry_started_at: string | null;
	state: "active" | "disabled";
	events: (
		| "invitee.created"
		| "invitee.canceled"
		| "invitee_no_show.created"
		| "invitee_no_show.deleted"
		| "event_type.created"
		| "event_type.deleted"
		| "event_type.updated"
		| "meeting_recap.created"
		| "meeting_recap.updated"
		| "meeting_recap.deleted"
		| "routing_form_submission.created"
		| "contact.created"
		| "contact.updated"
		| "contact.deleted"
	)[];
	scope: "user" | "organization" | "group";
	organization: string;
	user: string | null;
	group: string | null;
	creator: string | null;
}

export type WebhookSubscriptionsQuery = {
	organization: string;
	user?: string;
	group?: string;
	page_token?: string;
	count?: number;
	sort?: "created_at:asc" | "created_at:desc";
	scope: WebhookSubscription["scope"];
};

export interface CreateWebhookSubscriptionRequest {
	url: string;
	events: WebhookSubscription["events"];
	organization: string;
	scope: WebhookSubscription["scope"];
	user?: string;
	group?: string;
	signing_key?: string;
}
