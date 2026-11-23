import type { HttpClient } from "../../http.js";
import type { PaginatedCollection, Resource } from "../../types.js";
import type {
	CreateOrganizationInvitationRequest,
	Organization,
	OrganizationInvitation,
	OrganizationInvitationsQuery,
	OrganizationMembership,
	OrganizationMembershipsQuery,
	Team,
	TeamsQuery,
} from "./organizations.model.js";

/**
 * Methods for the organizations endpoints (organizations, invitations, memberships and teams).
 *
 * @example
 * ```ts
 * const calendly = new CalendlyClient({ accessToken });
 * const members = await calendly.organizations.getMemberships({ organization });
 * ```
 */
export class OrganizationsResource {
	#http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	/**
	 * Returns the details of the specified Organization.
	 * @param uuid    - Organization UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async get(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<Organization>> {
		return this.#http.request(
			"GET",
			`organizations/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Returns a list of Organization Invitations sent to the organization's members.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param organizationUuid  - Organization UUID (not the full URI).
	 * @param query             - Optional filters (`email`, `status`, `sort`) and pagination.
	 * @param signal            - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getInvitations(
		organizationUuid: string,
		query?: OrganizationInvitationsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<OrganizationInvitation>> {
		return this.#http.request(
			"GET",
			`organizations/${encodeURIComponent(organizationUuid)}/invitations`,
			{ query, signal },
		);
	}

	/**
	 * Returns the specified Organization Invitation.
	 * @param organizationUuid  - Organization UUID (not the full URI).
	 * @param invitationUuid    - Invitation UUID (not the full URI).
	 * @param signal            - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getInvitation(
		organizationUuid: string,
		invitationUuid: string,
		signal?: AbortSignal,
	): Promise<Resource<OrganizationInvitation>> {
		return this.#http.request(
			"GET",
			`organizations/${encodeURIComponent(organizationUuid)}/invitations/${encodeURIComponent(invitationUuid)}`,
			{ signal },
		);
	}

	/**
	 * Invites a user to the specified Organization.
	 * @param organizationUuid  - Organization UUID (not the full URI).
	 * @param body              - `email` of the user being invited.
	 * @param signal            - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 400 if the email is invalid, blank, already a member or already invited;
	 * 403 if there are no seats/invitations left (also on trial), you lack permission, or the organization has SCIM enabled.
	 */
	async createInvitation(
		organizationUuid: string,
		body: CreateOrganizationInvitationRequest,
		signal?: AbortSignal,
	): Promise<Resource<OrganizationInvitation>> {
		return this.#http.request(
			"POST",
			`organizations/${encodeURIComponent(organizationUuid)}/invitations`,
			{ body, signal },
		);
	}

	/**
	 * Revokes the specified Organization Invitation. The invitation link sent to the invitee is no longer valid.
	 * @param organizationUuid  - Organization UUID (not the full URI).
	 * @param invitationUuid    - Invitation UUID (not the full URI).
	 * @param signal            - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if you lack permission or the organization has SCIM enabled.
	 */
	async revokeInvitation(
		organizationUuid: string,
		invitationUuid: string,
		signal?: AbortSignal,
	): Promise<void> {
		return this.#http.request(
			"DELETE",
			`organizations/${encodeURIComponent(organizationUuid)}/invitations/${encodeURIComponent(invitationUuid)}`,
			{ signal },
		);
	}

	/**
	 * Returns a list of Organization Memberships.
	 * - `user` returns that user's membership (also useful to get your organization URI).
	 * - `organization` returns all the users that belong to the organization.
	 *
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - Pass `user` or `organization` (full URIs); optional `email` and `role` filters.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getMemberships(
		query: OrganizationMembershipsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<OrganizationMembership>> {
		return this.#http.request("GET", "organization_memberships", {
			query,
			signal,
		});
	}

	/**
	 * Returns the specified Organization Membership.
	 * @param uuid    - Membership UUID (not the user UUID nor the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getMembership(
		uuid: string,
		signal?: AbortSignal,
	): Promise<Resource<OrganizationMembership>> {
		return this.#http.request(
			"GET",
			`organization_memberships/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Removes a user from the organization. Requires admin rights; the owner can't be removed.
	 * @param uuid    - Membership UUID (not the user UUID). Get it with `getMemberships({ user })`.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError } With status 403 if you lack admin rights or the membership belongs to the owner.
	 */
	async deleteMembership(uuid: string, signal?: AbortSignal): Promise<void> {
		return this.#http.request(
			"DELETE",
			`organization_memberships/${encodeURIComponent(uuid)}`,
			{ signal },
		);
	}

	/**
	 * Returns a list of Teams, optionally filtered by user.
	 * The list is paginated (20 per page by default; use `count` and `page_token`).
	 * @param query   - Optional `user` (full URI) filter and pagination.
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getTeams(
		query?: TeamsQuery,
		signal?: AbortSignal,
	): Promise<PaginatedCollection<Team>> {
		return this.#http.request("GET", "teams", { query, signal });
	}

	/**
	 * Returns the specified Team.
	 * @param uuid    - Team UUID (not the full URI).
	 * @param signal  - AbortSignal to stop the request at any time.
	 * @throws { CalendlyError }
	 */
	async getTeam(uuid: string, signal?: AbortSignal): Promise<Resource<Team>> {
		return this.#http.request("GET", `teams/${encodeURIComponent(uuid)}`, {
			signal,
		});
	}
}
