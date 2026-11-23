export interface AvailabilitySchedule {
	uri: string;
	default: boolean;
	name: string;
	user: string;
	timezone: string;
	rules: {
		type: "wday" | "date";
		intervals: { from: string; to: string }[];
		wday?:
			| "sunday"
			| "monday"
			| "tuesday"
			| "wednesday"
			| "thursday"
			| "friday"
			| "saturday";
		date?: string;
	}[];
}

export type AvailabilitySchedulesQuery = { user: string };

export interface CreateAvailabilityScheduleRequest {
	name: string;
	timezone: string;
	rules: AvailabilitySchedule["rules"];
}

export interface UpdateAvailabilityScheduleRequest {
	name?: string;
	timezone?: string;
	rules?: AvailabilitySchedule["rules"];
	default?: true;
}

export interface EventTypeAvailabilitySchedule {
	event_type?: string;
	availability_setting?: "host";
	availability_rule?: {
		timezone?: string;
		uri?: string;
		name?: string | null;
		user?: string;
		rules?: AvailabilitySchedule["rules"];
	};
}

export type EventTypeAvailabilitySchedulesQuery = { event_type: string };

export interface UpdateEventTypeAvailabilityScheduleRequest {
	availability_rule: {
		user_availability_schedule?: string;
		timezone?: string;
		rules?: AvailabilitySchedule["rules"];
		user?: string;
	};
	availability_setting?: "host";
}

export interface UserBusyTime {
	type: "calendly" | "reserved" | "external";
	start_time: string;
	end_time: string;
	buffered_start_time?: string;
	buffered_end_time?: string;
	event?: { uri: string };
}

export type UserBusyTimesQuery = {
	user: string;
	start_time: string;
	end_time: string;
};

export interface UserMeetingLimits {
	user: string;
	daily_limit: number | null;
	weekly_limit: number | null;
	monthly_limit: number | null;
}

export type UserMeetingLimitsQuery = { user: string };

export interface UpdateUserMeetingLimitsRequest {
	daily_limit?: number | null;
	weekly_limit?: number | null;
	monthly_limit?: number | null;
}
