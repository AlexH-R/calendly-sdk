export interface User {
	uri: string;
	name: string;
	slug: string;
	email: string;
	scheduling_url: string;
	timezone: string;
	avatar_url: string | null;
	created_at: string;
	updated_at: string;
	current_organization: string;
	resource_type: string;
	locale: "en" | "fr" | "es" | "de" | "pt" | "ps";
	time_notation?: "12h" | "24h";
}
