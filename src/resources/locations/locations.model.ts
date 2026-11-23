import type { CreateInviteeRequest } from "../scheduledEvents/scheduledEvents.model.js";

export interface MeetingLocation {
	kind: NonNullable<CreateInviteeRequest["location"]>["kind"];
	connected?: boolean;
}

export type MeetingLocationsQuery = {
	user: string;
};
