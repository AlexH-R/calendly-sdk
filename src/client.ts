import { CalendlyError } from "./errors.js";
import { type FetchFn, HttpClient, type TokenProvider } from "./http.js";
import { type OAuthConfig, OAuthSession } from "./oauth.js";
import { ActivityLogResource } from "./resources/activityLog/activityLog.js";
import { AvailabilityResource } from "./resources/availability/availability.js";
import { ContactsResource } from "./resources/contacts/contacts.js";
import { DataComplianceResource } from "./resources/dataCompliance/dataCompliance.js";
import { EventTypesResource } from "./resources/eventTypes/eventTypes.js";
import { GroupsResource } from "./resources/groups/groups.js";
import { LocationsResource } from "./resources/locations/locations.js";
import { MeetingRecapsResource } from "./resources/meetingRecaps/meetingRecaps.js";
import { OrganizationsResource } from "./resources/organizations/organizations.js";
import { OutgoingCommunicationsResource } from "./resources/outgoingCommunications/outgoingCommunications.js";
import { RoutingFormsResource } from "./resources/routingForms/routingForms.js";
import { ScheduledEventsResource } from "./resources/scheduledEvents/scheduledEvents.js";
import { SchedulingLinksResource } from "./resources/schedulingLinks/schedulingLinks.js";
import { SharesResource } from "./resources/shares/shares.js";
import { UsersResource } from "./resources/users/users.js";
import { WebhooksResource } from "./resources/webhooks/webhooks.js";

interface BaseClientConfig {
	/**
	 * Base URL of the Calendly API (tests, proxies…).
	 * @defaultValue `"https://api.calendly.com/"`
	 */
	baseUrl?: string;
	/**
	 * Custom `fetch` implementation (tests, proxies, logging…). Also used for OAuth token refreshes.
	 * @defaultValue `globalThis.fetch`
	 */
	fetch?: FetchFn;
}

export interface AccessTokenClientConfig extends BaseClientConfig {
	/** Personal Access Token or OAuth access token, sent as `Authorization: Bearer`. */
	accessToken: string;
	oauth?: never;
}

export interface OAuthClientConfig extends BaseClientConfig {
	/** OAuth app credentials and tokens. The client refreshes the access token when it expires and calls `onTokens`. */
	oauth: OAuthConfig;
	accessToken?: never;
}

export type CalendlyClientConfig = AccessTokenClientConfig | OAuthClientConfig;

/**
 * Calendly SDK client.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken: process.env.CALENDLY_TOKEN });
 * const { resource: me } = await calendly.users.getMe();
 * ```
 *
 * @example OAuth
 * ```ts
 * const calendly = new CalendlyClient({
 * 	oauth: { clientId, clientSecret, tokens, onTokens: (tokens) => db.saveTokens(userId, tokens) },
 * });
 * ```
 */
export class CalendlyClient {
	#http: HttpClient;
	users: UsersResource;
	webhooks: WebhooksResource;
	shares: SharesResource;
	schedulingLinks: SchedulingLinksResource;
	scheduledEvents: ScheduledEventsResource;
	routingForms: RoutingFormsResource;
	outgoingCommunications: OutgoingCommunicationsResource;
	organizations: OrganizationsResource;
	meetingRecaps: MeetingRecapsResource;
	locations: LocationsResource;
	groups: GroupsResource;
	eventTypes: EventTypesResource;
	dataCompliance: DataComplianceResource;
	contacts: ContactsResource;
	availability: AvailabilityResource;
	activityLog: ActivityLogResource;

	/**
	 * @param calendlyConfig  - Client configuration.
	 * @throws {CalendlyError} If `baseUrl` is not a valid URL, or neither `accessToken` nor a valid `oauth` config is given.
	 */
	constructor(calendlyConfig: CalendlyClientConfig) {
		const { baseUrl = "https://api.calendly.com/", fetch } = calendlyConfig;
		const fetchFn: FetchFn =
			fetch ?? ((input, init) => globalThis.fetch(input, init));

		if (!URL.canParse(baseUrl)) {
			throw new CalendlyError("baseUrl must be a valid URL");
		}

		let auth: TokenProvider;
		if (calendlyConfig.oauth) {
			const { clientId, tokens, onTokens } = calendlyConfig.oauth;
			if (!clientId || !tokens?.access_token || !tokens.refresh_token) {
				throw new CalendlyError(
					"oauth requires clientId and tokens with access_token and refresh_token",
				);
			}
			if (typeof onTokens !== "function") {
				throw new CalendlyError("oauth.onTokens is required");
			}
			auth = new OAuthSession({ fetch: fetchFn, ...calendlyConfig.oauth });
		} else {
			const { accessToken } = calendlyConfig;
			if (!accessToken) {
				throw new CalendlyError("accessToken or oauth is required");
			}
			auth = { getToken: async () => accessToken };
		}

		this.#http = new HttpClient({
			baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
			auth,
			fetch: fetchFn,
		});

		this.users = new UsersResource(this.#http);
		this.webhooks = new WebhooksResource(this.#http);
		this.shares = new SharesResource(this.#http);
		this.schedulingLinks = new SchedulingLinksResource(this.#http);
		this.scheduledEvents = new ScheduledEventsResource(this.#http);
		this.routingForms = new RoutingFormsResource(this.#http);
		this.outgoingCommunications = new OutgoingCommunicationsResource(
			this.#http,
		);
		this.organizations = new OrganizationsResource(this.#http);
		this.meetingRecaps = new MeetingRecapsResource(this.#http);
		this.locations = new LocationsResource(this.#http);
		this.groups = new GroupsResource(this.#http);
		this.eventTypes = new EventTypesResource(this.#http);
		this.dataCompliance = new DataComplianceResource(this.#http);
		this.contacts = new ContactsResource(this.#http);
		this.availability = new AvailabilityResource(this.#http);
		this.activityLog = new ActivityLogResource(this.#http);
	}
}
