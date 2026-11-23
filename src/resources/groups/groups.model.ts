import type {
	OrganizationInvitation,
	OrganizationMembership,
} from "../organizations/organizations.model.js";

export interface Group {
	uri: string;
	name: string;
	organization: string;
	created_at: string;
	updated_at: string;
	member_count?: number;
}

export type GroupsQuery = {
	organization: string;
	page_token?: string;
	count?: number;
};

export interface GroupRelationship {
	uri: string;
	role: "member" | "admin";
	owner:
		| (OrganizationMembership & { type: "OrganizationMembership" })
		| (OrganizationInvitation & { type: "OrganizationInvitation" });
	organization: string;
	group: string;
	created_at: string;
	updated_at: string;
}

export type GroupRelationshipsQuery = {
	count?: number;
	page_token?: string;
	organization?: string;
	owner?: string;
	group?: string;
};
