export interface PaginatedCollection<T> {
	collection: T[];
	pagination: {
		count: number;
		next_page: string | null;
		previous_page: string | null;
		next_page_token: string | null;
		previous_page_token: string | null;
	};
}

export interface Collection<T> {
	collection: T[];
}

export interface Resource<T> {
	resource: T;
}
