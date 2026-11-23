export interface DeleteScheduledEventDataRequest {
	start_time: string;
	end_time: string;
}

export interface DeleteInviteeDataRequest {
	emails: string[];
}
