import { describe, expect, it, mock } from "bun:test";
import { CalendlyClient } from "../client.js";

interface Case {
	name: string;
	call: (calendly: CalendlyClient) => Promise<unknown>;
	method: "GET" | "POST" | "PATCH" | "DELETE";
	path: string;
	query?: string;
	body?: unknown;
	result?: unknown;
}

const ID = "a/b c";
const ENC = "a%2Fb%20c";
const ID2 = "d?e#f";
const ENC2 = "d%3Fe%23f";
const QUERY = { sentinel: "q" } as never;
const QUERY_STRING = "?sentinel=q";
const BODY = { sentinel: true } as never;
const RESPONSE = { ok: true };

const createClient = (
	respond: () => Response = () => Response.json(RESPONSE),
) => {
	const fetchMock = mock(
		async (_input: string | URL | Request, _init?: RequestInit) => respond(),
	);
	const calendly = new CalendlyClient({
		accessToken: "T",
		fetch: fetchMock as unknown as typeof fetch,
	});
	const lastRequest = () => {
		const [input, init] = fetchMock.mock.calls.at(-1) ?? [];
		return {
			url: new URL(String(input)),
			method: init?.method,
			headers: init?.headers as Record<string, string>,
			body: typeof init?.body === "string" ? JSON.parse(init.body) : init?.body,
		};
	};
	return { calendly, fetchMock, lastRequest };
};

const cases: Case[] = [
	//** users
	{
		name: "users.get",
		call: (c) => c.users.get(ID),
		method: "GET",
		path: `users/${ENC}`,
	},
	{
		name: "users.getMe",
		call: (c) => c.users.getMe(),
		method: "GET",
		path: "users/me",
	},

	//** webhooks
	{
		name: "webhooks.getAll",
		call: (c) => c.webhooks.getAll(QUERY),
		method: "GET",
		path: "webhook_subscriptions",
		query: QUERY_STRING,
	},
	{
		name: "webhooks.get",
		call: (c) => c.webhooks.get(ID),
		method: "GET",
		path: `webhook_subscriptions/${ENC}`,
	},
	{
		name: "webhooks.create",
		call: (c) => c.webhooks.create(BODY),
		method: "POST",
		path: "webhook_subscriptions",
		body: BODY,
	},
	{
		name: "webhooks.delete",
		call: (c) => c.webhooks.delete(ID),
		method: "DELETE",
		path: `webhook_subscriptions/${ENC}`,
	},

	//** shares
	{
		name: "shares.getAll",
		call: (c) => c.shares.getAll(QUERY),
		method: "GET",
		path: "shares",
		query: QUERY_STRING,
	},
	{
		name: "shares.create",
		call: (c) => c.shares.create(BODY),
		method: "POST",
		path: "shares",
		body: BODY,
	},
	{
		name: "shares.update",
		call: (c) => c.shares.update(ID, BODY),
		method: "PATCH",
		path: `shares/${ENC}`,
		body: BODY,
	},
	{
		name: "shares.delete",
		call: (c) => c.shares.delete(ID),
		method: "DELETE",
		path: `shares/${ENC}`,
	},

	//** schedulingLinks
	{
		name: "schedulingLinks.create",
		call: (c) => c.schedulingLinks.create(BODY),
		method: "POST",
		path: "scheduling_links",
		body: BODY,
	},

	//** scheduledEvents
	{
		name: "scheduledEvents.getAll",
		call: (c) => c.scheduledEvents.getAll(QUERY),
		method: "GET",
		path: "scheduled_events",
		query: QUERY_STRING,
	},
	{
		name: "scheduledEvents.get",
		call: (c) => c.scheduledEvents.get(ID),
		method: "GET",
		path: `scheduled_events/${ENC}`,
	},
	{
		name: "scheduledEvents.getInvitees",
		call: (c) => c.scheduledEvents.getInvitees(ID, QUERY),
		method: "GET",
		path: `scheduled_events/${ENC}/invitees`,
		query: QUERY_STRING,
	},
	{
		name: "scheduledEvents.getInvitee",
		call: (c) => c.scheduledEvents.getInvitee(ID, ID2),
		method: "GET",
		path: `scheduled_events/${ENC}/invitees/${ENC2}`,
	},
	{
		name: "scheduledEvents.createInvitee",
		call: (c) => c.scheduledEvents.createInvitee(BODY),
		method: "POST",
		path: "invitees",
		body: BODY,
	},
	{
		name: "scheduledEvents.getInviteeNoShow",
		call: (c) => c.scheduledEvents.getInviteeNoShow(ID),
		method: "GET",
		path: `invitee_no_shows/${ENC}`,
	},
	{
		name: "scheduledEvents.createInviteeNoShow",
		call: (c) => c.scheduledEvents.createInviteeNoShow(BODY),
		method: "POST",
		path: "invitee_no_shows",
		body: BODY,
	},
	{
		name: "scheduledEvents.cancel",
		call: (c) => c.scheduledEvents.cancel(ID, BODY),
		method: "POST",
		path: `scheduled_events/${ENC}/cancellation`,
		body: BODY,
	},
	{
		name: "scheduledEvents.cancel (no body)",
		call: (c) => c.scheduledEvents.cancel(ID),
		method: "POST",
		path: `scheduled_events/${ENC}/cancellation`,
		body: {},
	},

	//** routingForms
	{
		name: "routingForms.getAll",
		call: (c) => c.routingForms.getAll(QUERY),
		method: "GET",
		path: "routing_forms",
		query: QUERY_STRING,
	},
	{
		name: "routingForms.get",
		call: (c) => c.routingForms.get(ID),
		method: "GET",
		path: `routing_forms/${ENC}`,
	},
	{
		name: "routingForms.getSubmissions",
		call: (c) => c.routingForms.getSubmissions(QUERY),
		method: "GET",
		path: "routing_form_submissions",
		query: QUERY_STRING,
	},
	{
		name: "routingForms.getSubmission",
		call: (c) => c.routingForms.getSubmission(ID),
		method: "GET",
		path: `routing_form_submissions/${ENC}`,
	},

	//** outgoingCommunications
	{
		name: "outgoingCommunications.getAll",
		call: (c) => c.outgoingCommunications.getAll(QUERY),
		method: "GET",
		path: "outgoing_communications",
		query: QUERY_STRING,
	},

	//** organizations
	{
		name: "organizations.get",
		call: (c) => c.organizations.get(ID),
		method: "GET",
		path: `organizations/${ENC}`,
	},
	{
		name: "organizations.getInvitations",
		call: (c) => c.organizations.getInvitations(ID, QUERY),
		method: "GET",
		path: `organizations/${ENC}/invitations`,
		query: QUERY_STRING,
	},
	{
		name: "organizations.getInvitation",
		call: (c) => c.organizations.getInvitation(ID, ID2),
		method: "GET",
		path: `organizations/${ENC}/invitations/${ENC2}`,
	},
	{
		name: "organizations.createInvitation",
		call: (c) => c.organizations.createInvitation(ID, BODY),
		method: "POST",
		path: `organizations/${ENC}/invitations`,
		body: BODY,
	},
	{
		name: "organizations.revokeInvitation",
		call: (c) => c.organizations.revokeInvitation(ID, ID2),
		method: "DELETE",
		path: `organizations/${ENC}/invitations/${ENC2}`,
	},
	{
		name: "organizations.getMemberships",
		call: (c) => c.organizations.getMemberships(QUERY),
		method: "GET",
		path: "organization_memberships",
		query: QUERY_STRING,
	},
	{
		name: "organizations.getMembership",
		call: (c) => c.organizations.getMembership(ID),
		method: "GET",
		path: `organization_memberships/${ENC}`,
	},
	{
		name: "organizations.deleteMembership",
		call: (c) => c.organizations.deleteMembership(ID),
		method: "DELETE",
		path: `organization_memberships/${ENC}`,
	},
	{
		name: "organizations.getTeams",
		call: (c) => c.organizations.getTeams(QUERY),
		method: "GET",
		path: "teams",
		query: QUERY_STRING,
	},
	{
		name: "organizations.getTeam",
		call: (c) => c.organizations.getTeam(ID),
		method: "GET",
		path: `teams/${ENC}`,
	},

	//** meetingRecaps
	{
		name: "meetingRecaps.getAll",
		call: (c) => c.meetingRecaps.getAll(QUERY),
		method: "GET",
		path: "meeting_recaps",
		query: QUERY_STRING,
	},
	{
		name: "meetingRecaps.get",
		call: (c) => c.meetingRecaps.get(ID),
		method: "GET",
		path: `meeting_recaps/${ENC}`,
	},
	{
		name: "meetingRecaps.getTranscript",
		call: (c) => c.meetingRecaps.getTranscript(ID),
		method: "GET",
		path: `meeting_recaps/${ENC}/transcript`,
	},
	{
		name: "meetingRecaps.update",
		call: (c) => c.meetingRecaps.update(ID, BODY),
		method: "PATCH",
		path: `meeting_recaps/${ENC}`,
		body: BODY,
	},
	{
		name: "meetingRecaps.delete",
		call: (c) => c.meetingRecaps.delete(ID),
		method: "DELETE",
		path: `meeting_recaps/${ENC}`,
	},

	//** locations
	{
		name: "locations.getAll",
		call: (c) => c.locations.getAll(QUERY),
		method: "GET",
		path: "locations",
		query: QUERY_STRING,
	},

	//** groups
	{
		name: "groups.getAll",
		call: (c) => c.groups.getAll(QUERY),
		method: "GET",
		path: "groups",
		query: QUERY_STRING,
	},
	{
		name: "groups.get",
		call: (c) => c.groups.get(ID),
		method: "GET",
		path: `groups/${ENC}`,
	},
	{
		name: "groups.getRelationships",
		call: (c) => c.groups.getRelationships(QUERY),
		method: "GET",
		path: "group_relationships",
		query: QUERY_STRING,
	},
	{
		name: "groups.getRelationship",
		call: (c) => c.groups.getRelationship(ID),
		method: "GET",
		path: `group_relationships/${ENC}`,
	},

	//** eventTypes
	{
		name: "eventTypes.getAll",
		call: (c) => c.eventTypes.getAll(QUERY),
		method: "GET",
		path: "event_types",
		query: QUERY_STRING,
	},
	{
		name: "eventTypes.get",
		call: (c) => c.eventTypes.get(ID),
		method: "GET",
		path: `event_types/${ENC}`,
	},
	{
		name: "eventTypes.getHosts",
		call: (c) => c.eventTypes.getHosts(QUERY),
		method: "GET",
		path: "event_type_memberships",
		query: QUERY_STRING,
	},
	{
		name: "eventTypes.getAvailableTimes",
		call: (c) => c.eventTypes.getAvailableTimes(QUERY),
		method: "GET",
		path: "event_type_available_times",
		query: QUERY_STRING,
	},
	{
		name: "eventTypes.createOneOff",
		call: (c) => c.eventTypes.createOneOff(BODY),
		method: "POST",
		path: "one_off_event_types",
		body: BODY,
	},
	{
		name: "eventTypes.create",
		call: (c) => c.eventTypes.create(BODY),
		method: "POST",
		path: "event_types",
		body: BODY,
	},
	{
		name: "eventTypes.update",
		call: (c) => c.eventTypes.update(ID, BODY),
		method: "PATCH",
		path: `event_types/${ENC}`,
		body: BODY,
	},

	//** dataCompliance
	{
		name: "dataCompliance.deleteEvents",
		call: (c) => c.dataCompliance.deleteEvents(BODY),
		method: "POST",
		path: "data_compliance/deletion/events",
		body: BODY,
		result: undefined,
	},
	{
		name: "dataCompliance.deleteInvitees",
		call: (c) => c.dataCompliance.deleteInvitees(BODY),
		method: "POST",
		path: "data_compliance/deletion/invitees",
		body: BODY,
		result: undefined,
	},

	//** contacts
	{
		name: "contacts.getAll",
		call: (c) => c.contacts.getAll(QUERY),
		method: "GET",
		path: "contacts",
		query: QUERY_STRING,
	},
	{
		name: "contacts.get",
		call: (c) => c.contacts.get(ID, QUERY),
		method: "GET",
		path: `contacts/${ENC}`,
		query: QUERY_STRING,
	},
	{
		name: "contacts.create",
		call: (c) => c.contacts.create(BODY),
		method: "POST",
		path: "contacts",
		body: BODY,
	},
	{
		name: "contacts.update",
		call: (c) => c.contacts.update(ID, BODY),
		method: "PATCH",
		path: `contacts/${ENC}`,
		body: BODY,
	},
	{
		name: "contacts.delete",
		call: (c) => c.contacts.delete(ID),
		method: "DELETE",
		path: `contacts/${ENC}`,
	},
	{
		name: "contacts.getLists",
		call: (c) => c.contacts.getLists(QUERY),
		method: "GET",
		path: "contact_lists",
		query: QUERY_STRING,
	},
	{
		name: "contacts.getList",
		call: (c) => c.contacts.getList(ID),
		method: "GET",
		path: `contact_lists/${ENC}`,
	},
	{
		name: "contacts.createList",
		call: (c) => c.contacts.createList(BODY),
		method: "POST",
		path: "contact_lists",
		body: BODY,
	},
	{
		name: "contacts.updateList",
		call: (c) => c.contacts.updateList(ID, BODY),
		method: "PATCH",
		path: `contact_lists/${ENC}`,
		body: BODY,
	},
	{
		name: "contacts.addToList",
		call: (c) => c.contacts.addToList(ID, BODY),
		method: "POST",
		path: `contact_lists/${ENC}/memberships`,
		body: BODY,
	},
	{
		name: "contacts.removeFromList",
		call: (c) => c.contacts.removeFromList(ID, BODY),
		method: "POST",
		path: `contact_lists/${ENC}/memberships/removal`,
		body: BODY,
	},
	{
		name: "contacts.getCustomFieldDefinitions",
		call: (c) => c.contacts.getCustomFieldDefinitions(),
		method: "GET",
		path: "contacts/custom_field_definitions",
	},
	{
		name: "contacts.getCustomFieldDefinition",
		call: (c) => c.contacts.getCustomFieldDefinition(ID),
		method: "GET",
		path: `contacts/custom_field_definitions/${ENC}`,
	},
	{
		name: "contacts.createCustomFieldDefinition",
		call: (c) => c.contacts.createCustomFieldDefinition(BODY),
		method: "POST",
		path: "contacts/custom_field_definitions",
		body: BODY,
	},
	{
		name: "contacts.getNotes",
		call: (c) => c.contacts.getNotes(QUERY),
		method: "GET",
		path: "notes",
		query: QUERY_STRING,
	},
	{
		name: "contacts.getNote",
		call: (c) => c.contacts.getNote(ID),
		method: "GET",
		path: `notes/${ENC}`,
	},
	{
		name: "contacts.createNote",
		call: (c) => c.contacts.createNote(BODY),
		method: "POST",
		path: "notes",
		body: BODY,
	},

	//** availability
	{
		name: "availability.getSchedules",
		call: (c) => c.availability.getSchedules(QUERY),
		method: "GET",
		path: "user_availability_schedules",
		query: QUERY_STRING,
	},
	{
		name: "availability.getSchedule",
		call: (c) => c.availability.getSchedule(ID),
		method: "GET",
		path: `user_availability_schedules/${ENC}`,
	},
	{
		name: "availability.createSchedule",
		call: (c) => c.availability.createSchedule(BODY),
		method: "POST",
		path: "user_availability_schedules",
		body: BODY,
	},
	{
		name: "availability.updateSchedule",
		call: (c) => c.availability.updateSchedule(ID, BODY),
		method: "PATCH",
		path: `user_availability_schedules/${ENC}`,
		body: BODY,
	},
	{
		name: "availability.getEventTypeSchedules",
		call: (c) => c.availability.getEventTypeSchedules(QUERY),
		method: "GET",
		path: "event_type_availability_schedules",
		query: QUERY_STRING,
	},
	{
		name: "availability.updateEventTypeSchedule",
		call: (c) => c.availability.updateEventTypeSchedule(QUERY, BODY),
		method: "PATCH",
		path: "event_type_availability_schedules",
		query: QUERY_STRING,
		body: BODY,
	},
	{
		name: "availability.getBusyTimes",
		call: (c) => c.availability.getBusyTimes(QUERY),
		method: "GET",
		path: "user_busy_times",
		query: QUERY_STRING,
	},
	{
		name: "availability.getMeetingLimits",
		call: (c) => c.availability.getMeetingLimits(QUERY),
		method: "GET",
		path: "user_meeting_limits",
		query: QUERY_STRING,
	},
	{
		name: "availability.updateMeetingLimits",
		call: (c) => c.availability.updateMeetingLimits(QUERY, BODY),
		method: "PATCH",
		path: "user_meeting_limits",
		query: QUERY_STRING,
		body: BODY,
	},

	//** activityLog
	{
		name: "activityLog.getAll",
		call: (c) => c.activityLog.getAll(QUERY),
		method: "GET",
		path: "activity_log_entries",
		query: QUERY_STRING,
	},
];

describe("Endpoints", () => {
	it.each(cases)("$name", async (testCase) => {
		const { call, method, path, query = "", body } = testCase;
		const { calendly, fetchMock, lastRequest } = createClient();
		const result = await call(calendly);
		const req = lastRequest();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(req.method).toBe(method);
		expect(req.url.origin).toBe("https://api.calendly.com");
		expect(req.url.pathname).toBe(`/${path}`);
		expect(req.url.search).toBe(query);
		expect(req.body).toEqual(body);
		if (body === undefined) {
			expect(req.headers["Content-Type"]).toBeUndefined();
		} else {
			expect(req.headers["Content-Type"]).toBe("application/json");
		}
		expect(req.headers.Authorization).toBe("Bearer T");
		expect(result).toEqual("result" in testCase ? testCase.result : RESPONSE);
	});

	it("Should cover every resource method", () => {
		const { calendly } = createClient();
		const methods = Object.entries(calendly).flatMap(([resource, instance]) =>
			Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
				.filter((name) => name !== "constructor")
				.map((name) => `${resource}.${name}`),
		);
		const tested = new Set(cases.map(({ name }) => name.split(" ")[0]));

		expect(methods.length).toBe(80);
		expect(methods.filter((name) => !tested.has(name))).toEqual([]);
	});
});

describe("Empty responses", () => {
	it("Should resolve to undefined on 204 No Content", async () => {
		const { calendly } = createClient(
			() => new Response(null, { status: 204 }),
		);
		expect(await calendly.webhooks.delete(ID)).toBeUndefined();
	});

	it("Should resolve to undefined on 202 Accepted", async () => {
		const { calendly } = createClient(
			() => new Response(null, { status: 202 }),
		);
		expect(
			await calendly.dataCompliance.deleteInvitees({ emails: ["a@x.com"] }),
		).toBeUndefined();
	});
});
