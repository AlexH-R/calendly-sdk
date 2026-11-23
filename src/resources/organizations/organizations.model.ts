export interface Organization {
	uri: string;
	kind: "single" | "multiple";
	plan:
		| "basic"
		| "essentials"
		| "standard"
		| "professional"
		| "teams"
		| "enterprise";
	stage: "trial" | "free" | "paid";
	created_at: string;
	updated_at: string;
	name?: string;
}

export interface OrganizationInvitation {
	uri: string;
	organization: string;
	email: string;
	status: "pending" | "accepted" | "declined";
	created_at: string;
	updated_at: string;
	last_sent_at: string | null;
	user?: string;
}

export type OrganizationInvitationsQuery = {
	count?: number;
	page_token?: string;
	sort?: "created_at:asc" | "created_at:desc";
	email?: string;
	status?: OrganizationInvitation["status"];
};

export interface CreateOrganizationInvitationRequest {
	email: string;
}

export interface OrganizationMembership {
	uri: string;
	role: "user" | "admin" | "owner";
	user: {
		uri: string;
		name: string;
		slug: string;
		email: string;
		scheduling_url: string;
		timezone: string;
		avatar_url: string | null;
		locale: "en" | "fr" | "es" | "de" | "pt" | "ps";
		created_at: string;
		updated_at: string;
		time_notation?: "12h" | "24h";
	};
	organization: string;
	updated_at: string;
	created_at: string;
}

export type OrganizationMembershipsQuery = {
	page_token?: string;
	count?: number;
	email?: string;
	organization?: string;
	user?: string;
	role?: OrganizationMembership["role"];
};

export interface Team {
	uri: string;
	name: string;
	organization: string;
	scheduling_url: string;
}

export type TeamsQuery = {
	user?: string;
	page_token?: string;
	count?: number;
};
