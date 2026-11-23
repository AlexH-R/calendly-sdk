export type OutgoingCommunication =
	| {
			type: "sms";
			to: string;
			from: string;
			subject: string | null;
			body: string;
			sender_uri: string | null;
			sender_email: string | null;
			event_type_uri: string;
			event_uri: string;
			sent_at: string;
			created_at: string;
			scheduling_url: string;
	  }
	| {
			type: "email";
			to: string;
			from: string;
			subject: string;
			body: string;
			sender_uri: string | null;
			sender_email: string | null;
			event_type_uri: string;
			event_uri: string;
			sent_at: string;
			created_at: string;
			scheduling_url: string;
	  };

export type OutgoingCommunicationsQuery = {
	organization: string;
	count?: number;
	min_created_at?: string;
	max_created_at?: string;
	page_token?: string;
};
