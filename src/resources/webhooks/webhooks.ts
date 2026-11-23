import type { HttpClient } from "../../http.js";
import type { PaginatedCollection, Resource } from "../../types.js";
import type {
	CreateWebhookSubscriptionRequest,
	WebhookSubscription,
	WebhookSubscriptionsQuery,
} from "./webhooks.model.js";

/**
 * Methods for the webhook subscriptions endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const webhooks = await calendly.webhooks.getAll({ organization, scope: "organization" });
 * ```
 */
export class WebhooksResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns a list of Webhook Subscriptions for a specified Organization, User, or Group.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - `organization` and `scope` are required; `user` or `group` is required when `scope` is `"user"` or `"group"`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAll(
		query: WebhookSubscriptionsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<WebhookSubscription>> {
		return this.#http.request("GET", "webhook_subscriptions", {
			query,
			signal,
		});
	}

	/**
	 * Returns the specified Webhook Subscription.
	 * @param uuid    - Webhook subscription UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async get(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<WebhookSubscription>> {
		return this.#http.request(
			"GET",
			`webhook_subscriptions/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Creates a Webhook Subscription for an Organization, User, or Group.
	 * - `organization` scope triggers the webhook for all subscribed events within the organization.
	 * - `user` scope only triggers it for events that belong to the specified user.
	 * - `group` scope only triggers it for events that belong to the specified group.
	 *
	 * `meeting_recap.*` events only allow the `user` scope and `routing_form_submission.created` only `organization`;
	 * both need a paid plan (otherwise 403 "Please upgrade to a paid Calendly account.").
	 * @param body    - Subscription data. `url` is returned as `callback_url`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 409 if a webhook with this `url` already exists.
	 */
	async create(
		body: CreateWebhookSubscriptionRequest,
		signal?: AbortSignal,
	): Promise<Resource<WebhookSubscription>> {
		return this.#http.request("POST", "webhook_subscriptions", {
			body,
			signal,
		});
	}

	/**
	 * Deletes the specified Webhook Subscription.
	 * @param uuid    - Webhook subscription UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async delete(uuid: string, signal?: AbortSignal): Promise<void> {
		return this.#http.request(
			"DELETE",
			`webhook_subscriptions/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}
}
