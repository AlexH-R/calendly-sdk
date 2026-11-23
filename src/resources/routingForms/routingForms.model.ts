import type { Invitee } from "../scheduledEvents/scheduledEvents.model.js";

export interface RoutingForm {
	uri: string;
	organization: string;
	name: string;
	status: "draft" | "published";
	questions: {
		uuid: string;
		name: string;
		type:
			| "name"
			| "text"
			| "email"
			| "phone"
			| "textarea"
			| "select"
			| "radios";
		required: boolean;
		answer_choices: string[] | null;
	}[];
	created_at: string;
	updated_at: string;
}

export type RoutingFormsQuery = {
	organization: string;
	count?: number;
	page_token?: string;
	sort?: "created_at:asc" | "created_at:desc";
};

export interface RoutingFormSubmission {
	uri: string;
	routing_form: string;
	questions_and_answers: {
		question_uuid: string | null;
		question: string;
		answer?: string | null;
	}[];
	tracking: Invitee["tracking"];
	submitter: string | null;
	submitter_type: "Invitee" | null;
	created_at: string;
	updated_at: string;
	result?:
		| { type: "event_type"; value: string }
		| { type: "external_url"; value: string }
		| { type: "custom_message"; value: { headline: string; body: string } };
}

export type RoutingFormSubmissionsQuery = {
	form: string;
	count?: number;
	page_token?: string;
	sort?: "created_at:asc" | "created_at:desc";
};
