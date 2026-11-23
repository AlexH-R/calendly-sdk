export interface Contact {
	uri: string;
	app_url: string;
	emails: { email: string; is_primary: boolean }[];
	created_at: string;
	updated_at: string;
	name?: string | null;
	phone_numbers?: { phone_number: string }[];
	timezone?: string | null;
	job_title?: string | null;
	company?: string | null;
	country?: string | null;
	state?: string | null;
	city?: string | null;
	linkedin?: string | null;
	custom_fields?: {
		uri: string;
		value: string | number | boolean | string[] | null;
		label?: string;
	}[];
	first_email_date?: string | null;
	last_email_date?: string | null;
	next_meeting_date?: string | null;
	last_meeting_date?: string | null;
	last_interaction_date?: string | null;
}

export type ContactsQuery = {
	sort?: `${"created_at" | "updated_at"}:${"asc" | "desc"}`[];
	email?: string[];
	phone_number?: string[];
	timezone?: string[];
	min_last_meeting_date?: string;
	max_last_meeting_date?: string;
	min_next_meeting_date?: string;
	max_next_meeting_date?: string;
	name?: string[];
	job_title?: string[];
	company?: string[];
	country?: string[];
	state?: string[];
	city?: string[];
	contact_list?: string;
	count?: number;
	page_token?: string;
	exclude?: "custom_fields";
};

export type ContactQuery = {
	exclude?: ContactsQuery["exclude"];
};

export interface CreateContactRequest {
	name: string;
	emails: Contact["emails"];
	phone_numbers?: NonNullable<Contact["phone_numbers"]>;
	timezone?: string;
	job_title?: string;
	company?: string;
	country?: string;
	state?: string;
	city?: string;
	linkedin?: string;
	custom_fields?: UpdateContactRequest["custom_fields"];
}

export interface UpdateContactRequest {
	name?: string;
	emails?: Contact["emails"];
	phone_numbers?: NonNullable<Contact["phone_numbers"]>;
	timezone?: string;
	job_title?: string;
	company?: string;
	country?: string;
	state?: string;
	city?: string;
	linkedin?: string;
	custom_fields?: {
		uuid: string;
		value: NonNullable<Contact["custom_fields"]>[number]["value"];
	}[];
}

export interface ContactList {
	uri: string;
	name: string;
	type: "static_list" | "dynamic_view";
	contact_count: number | null;
}

export type ContactListsQuery = {
	type?: ContactList["type"];
};

export interface CreateContactListRequest {
	name: string;
	contacts?: string[];
}

export interface ContactListCreated {
	uri: string;
	name: string;
	type: "static_list";
	contact_count: number;
	membership_result: ContactListMembershipAddResult;
}

export interface UpdateContactListRequest {
	name: string;
}

export interface ContactListMembershipsRequest {
	contacts: string[];
}

export interface ContactListMembershipAddResult {
	added: number;
	already_present: number;
	invalid: number;
	failed: number;
	already_present_contacts: string[];
	invalid_contacts: string[];
	failed_contacts: string[];
}

export interface ContactListMembershipRemoveResult {
	removed: number;
	not_present: number;
	invalid: number;
	failed: number;
	not_present_contacts: string[];
	invalid_contacts: string[];
	failed_contacts: string[];
}

export interface ContactCustomFieldDefinition {
	uri: string;
	label: string;
	field_type:
		| "text"
		| "number"
		| "currency"
		| "tags"
		| "date"
		| "single_select"
		| "invitee_question";
	created_at: string;
	updated_at: string;
	options?: {
		uuid: string;
		label: string;
		color: string | null;
		is_active: boolean;
	}[];
	currency?: string;
	source?: {
		type: "event_type_invitee_question";
		event_type_uri?: string;
		question?: string;
	};
}

export interface CreateContactCustomFieldDefinitionRequest {
	label: string;
	field_type: Exclude<
		ContactCustomFieldDefinition["field_type"],
		"invitee_question"
	>;
	currency?:
		| "USD"
		| "EUR"
		| "GBP"
		| "JPY"
		| "CHF"
		| "CAD"
		| "AUD"
		| "CNY"
		| "SGD"
		| "INR"
		| "KRW";
	options?: { label: string }[];
}

export interface Note {
	uri: string;
	title: string | null;
	body: string | null;
	contact: string | null;
	remind_at: string | null;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
}

export type NotesQuery = {
	contact?: string[];
	min_remind_at?: string;
	max_remind_at?: string;
	completed?: boolean;
	min_created_at?: string;
	max_created_at?: string;
	min_updated_at?: string;
	max_updated_at?: string;
	count?: number;
	page_token?: string;
};

export interface CreateNoteRequest {
	contact: string;
	title?: string | null;
	body?: string | null;
	remind_at?: string | null;
}
