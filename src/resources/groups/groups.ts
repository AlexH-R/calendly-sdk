import type { HttpClient } from "../../http.js";
import type { PaginatedCollection, Resource } from "../../types.js";
import type {
	Group,
	GroupRelationship,
	GroupRelationshipsQuery,
	GroupsQuery,
} from "./groups.model.js";

/**
 * Methods for the groups and group relationships endpoints.
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const groups = await calendly.groups.getAll({ organization });
 * ```
 */
export class GroupsResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns a list of Groups of the specified Organization.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - `organization` (full URI) is required.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getAll(
		query: GroupsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<Group>> {
		return this.#http.request("GET", "groups", { query, signal });
	}

	/**
	 * Returns the specified Group.
	 * @param uuid    - Group UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async get(uuid: string, signal?: AbortSignal): Promise<Resource<Group>> {
		return this.#http.request("GET", `groups/${encodeURIComponent(uuid)}`, {
			signal,
		});
	}

	/**
	 * Returns a list of Group Relationships. An owner can have one `member` relationship
	 * but several `admin` relationships. Use `owner.type` to tell memberships from invitations.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - Optional `organization`, `group` and `owner` (organization membership or invitation URI) filters and pagination.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getRelationships(
		query?: GroupRelationshipsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<GroupRelationship>> {
		return this.#http.request("GET", "group_relationships", {
			query,
			signal,
		});
	}

	/**
	 * Returns the specified Group Relationship.
	 * @param uuid    - Group relationship UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getRelationship(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<GroupRelationship>> {
		return this.#http.request(
			"GET",
			`group_relationships/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}
}
