import type { HttpClient } from "../../http.js";
import type { Collection, PaginatedCollection, Resource } from "../../types.js";
import type {
	Contact,
	ContactCustomFieldDefinition,
	ContactList,
	ContactListCreated,
	ContactListMembershipAddResult,
	ContactListMembershipRemoveResult,
	ContactListMembershipsRequest,
	ContactListsQuery,
	ContactQuery,
	ContactsQuery,
	CreateContactCustomFieldDefinitionRequest,
	CreateContactListRequest,
	CreateContactRequest,
	CreateNoteRequest,
	Note,
	NotesQuery,
	UpdateContactListRequest,
	UpdateContactRequest,
} from "./contacts.model.js";

/**
 * Methods for the contacts, contact lists, contact custom field definitions and notes endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const contacts = await calendly.contacts.getAll({ email: ["jane@example.com"] });
 * ```
 */
export class ContactsResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns a list of Contacts.
	 * List filters accept several values (sent comma-separated): `email`, `phone_number`, `timezone`, `country`, `state` and `city` match exactly;
	 * `name`, `job_title` and `company` match partially.
	 * Meeting date filters compare only the UTC date (`min_*` inclusive, `max_*` exclusive) and skip contacts with no recorded date;
	 * `max_*` is capped at 30 days from today.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - Optional filters, `sort`, `contact_list` (list or view URI), `exclude` and pagination.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAll(
		query?: ContactsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<Contact>> {
		return this.#http.request("GET", "contacts", { query, signal });
	}

	/**
	 * Returns the details of a specified Contact.
	 * @param uuid    - Contact UUID (not the full URI).
	 * @param query   - Optional `exclude: "custom_fields"` to omit custom fields from the response.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async get(
		uuid: string,
		query?: ContactQuery,
		signal?: AbortSignal,
	): Promise<Resource<Contact>> {
		return this.#http.request("GET", `contacts/${encodeURIComponent(uuid)}`, {
			query,
			signal,
		});
	}

	/**
	 * Creates a new Contact. Exactly one email must have `is_primary: true` (max 10 emails and 10 phone numbers).
	 * `custom_fields` items take the definition `uuid` and a `value` matching its `field_type`;
	 * an unknown `uuid` or a wrong `value` type rejects the whole request. An existing contact returns 409.
	 * @param body    - `name` and `emails` are required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async create(
		body: CreateContactRequest,
		signal?: AbortSignal,
	): Promise<Resource<Contact>> {
		return this.#http.request("POST", "contacts", { body, signal });
	}

	/**
	 * Updates an existing Contact. The body must include at least one field; unknown properties are rejected.
	 * `emails` and `phone_numbers` (max 10 each) overwrite the existing lists, so send the complete list to keep.
	 * Exactly one email must have `is_primary: true`.
	 * `custom_fields` items take the definition `uuid` and a `value` matching its `field_type`;
	 * an unknown `uuid` or a wrong `value` type rejects the whole request.
	 * @param uuid    - Contact UUID (not the full URI).
	 * @param body    - Fields to update.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async update(
		uuid: string,
		body: UpdateContactRequest,
		signal?: AbortSignal,
	): Promise<Resource<Contact>> {
		return this.#http.request("PATCH", `contacts/${encodeURIComponent(uuid)}`, {
			body,
			signal,
		});
	}

	/**
	 * Deletes an existing Contact.
	 * @param uuid    - Contact UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async delete(uuid: string, signal?: AbortSignal): Promise<void> {
		return this.#http.request(
			"DELETE",
			`contacts/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Returns the user's Lists (`static_list`) and Views (`dynamic_view`), not their contacts.
	 * To get the contacts in one, use `getAll({ contact_list })`.
	 * All results come in one response (max 25), in the same order as the web app; `contact_count` is `null` for Views.
	 * @param query   - Optional `type` filter.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getLists(
		query?: ContactListsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<ContactList>> {
		return this.#http.request("GET", "contact_lists", { query, signal });
	}

	/**
	 * Returns one List or View, not its contacts; use `getAll({ contact_list })` for those.
	 * Views created by a CSV import return 404.
	 * @param uuid    - Contact list UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getList(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<ContactList>> {
		return this.#http.request(
			"GET",
			`contact_lists/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Creates a List (`static_list`) and optionally adds contacts to it (max 500). Views can't be created.
	 * Adding the contacts isn't atomic: the List is created first; check `membership_result` and retry
	 * `failed_contacts` with `addToList`. A taken name (case, accent and whitespace insensitive) returns 409,
	 * as does reaching the 25 Lists and Views limit. On a 500 or timeout the List may exist: check with `getLists` before retrying.
	 * @param body    - `name` (1–255 characters after trimming) and optional `contacts` (URIs).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async createList(
		body: CreateContactListRequest,
		signal?: AbortSignal,
	): Promise<Resource<ContactListCreated>> {
		return this.#http.request("POST", "contact_lists", { body, signal });
	}

	/**
	 * Renames a List or View; only the name can change (a View's filters can't be edited).
	 * The name is trimmed and must be 1–255 characters. A List name that is taken returns 409;
	 * View names can repeat. The default All Contacts View can't be renamed (409).
	 * @param uuid    - Contact list UUID (not the full URI).
	 * @param body    - The new `name`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async updateList(
		uuid: string,
		body: UpdateContactListRequest,
		signal?: AbortSignal,
	): Promise<Resource<ContactList>> {
		return this.#http.request(
			"PATCH",
			`contact_lists/${encodeURIComponent(uuid)}`,
			{ body, signal },
		);
	}

	/**
	 * Adds contacts to a List (`static_list`). Max 500 contacts per request.
	 * Idempotent: contacts already on the List are unchanged, and `failed_contacts` can be retried.
	 * Invalid or inaccessible contacts are counted in `invalid`, and the rest are still processed. A View returns 409.
	 * @param uuid    - Contact list UUID (not the full URI).
	 * @param body    - `contacts`: 1–500 contact URIs.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async addToList(
		uuid: string,
		body: ContactListMembershipsRequest,
		signal?: AbortSignal,
	): Promise<Resource<ContactListMembershipAddResult>> {
		return this.#http.request(
			"POST",
			`contact_lists/${encodeURIComponent(uuid)}/memberships`,
			{ body, signal },
		);
	}

	/**
	 * Removes contacts from a List (`static_list`); the contacts are not deleted.
	 * Max 500 contacts per request. Idempotent: contacts not on the List are unchanged, and `failed_contacts` can be retried.
	 * Invalid or inaccessible contacts are counted in `invalid`, and the rest are still processed. A View returns 409.
	 * @param uuid    - Contact list UUID (not the full URI).
	 * @param body    - `contacts`: 1–500 contact URIs.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async removeFromList(
		uuid: string,
		body: ContactListMembershipsRequest,
		signal?: AbortSignal,
	): Promise<Resource<ContactListMembershipRemoveResult>> {
		return this.#http.request(
			"POST",
			`contact_lists/${encodeURIComponent(uuid)}/memberships/removal`,
			{ body, signal },
		);
	}

	/**
	 * Returns all contact custom field definitions available to the user or organization.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getCustomFieldDefinitions(
		signal?: AbortSignal,
	): Promise<Collection<ContactCustomFieldDefinition>> {
		return this.#http.request("GET", "contacts/custom_field_definitions", {
			signal,
		});
	}

	/**
	 * Returns a single contact custom field definition.
	 * @param uuid    - Custom field definition UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getCustomFieldDefinition(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<ContactCustomFieldDefinition>> {
		return this.#http.request(
			"GET",
			`contacts/custom_field_definitions/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Creates a contact custom field definition. Requires permission to create custom fields.
	 * `label` is trimmed and must be 1–255 characters; a label that already exists (case-insensitive) returns 409.
	 * `currency` is required only for `currency` fields and `options` (1–10, label only) only for `single_select`;
	 * other field types reject them. `invitee_question` fields can't be created.
	 * @param body    - `label` and `field_type`, plus `currency` or `options` when the type needs them.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async createCustomFieldDefinition(
		body: CreateContactCustomFieldDefinitionRequest,
		signal?: AbortSignal,
	): Promise<Resource<ContactCustomFieldDefinition>> {
		return this.#http.request("POST", "contacts/custom_field_definitions", {
			body,
			signal,
		});
	}

	/**
	 * Returns the notes written by the current user. Notes are private: notes other users wrote about the same contacts are not returned.
	 * Without `contact`, all the user's notes are returned (including notes with no contact or no reminder). Multiple filters are combined with AND.
	 * `min_*` filters are inclusive and `max_*` exclusive; times are RFC 3339 with seconds and at most millisecond precision.
	 * For overdue reminders, send `max_remind_at` as now and `completed: false`.
	 * Sorted by `updated_at` (most recent first); a note updated while paging moves to the first page.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - Optional `contact` (1–10 contact URIs), reminder, `completed` and timestamp filters, and pagination.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getNotes(
		query?: NotesQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<Note>> {
		return this.#http.request("GET", "notes", { query, signal });
	}

	/**
	 * Returns one note that the current user owns.
	 * Returns 404 if the note doesn't exist or another user owns it.
	 * @param uuid    - Note UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getNote(uuid: string, signal?: AbortSignal): Promise<Resource<Note>> {
		return this.#http.request("GET", `notes/${encodeURIComponent(uuid)}`, {
			signal,
		});
	}

	/**
	 * Creates a note about one contact, owned by the current user.
	 * Send `title`, `body` or both: after trimming, at least one must have content (`title` max 255, `body` max 10,000 characters).
	 * `remind_at` is RFC 3339 with seconds; if reminders aren't available on the account, returns 403 and no note is created.
	 * Not idempotent: a failed or timed-out request may still create the note, so check with `getNotes({ contact })` before retrying.
	 * @param body    - `contact` (URI) is required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async createNote(
		body: CreateNoteRequest,
		signal?: AbortSignal,
	): Promise<Resource<Note>> {
		return this.#http.request("POST", "notes", { body, signal });
	}
}
