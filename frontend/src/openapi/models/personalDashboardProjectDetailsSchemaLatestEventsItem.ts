/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * An event summary
 */
export type PersonalDashboardProjectDetailsSchemaLatestEventsItem = {
    /** When the event was recorded */
    createdAt: string;
    /** Which user created this event */
    createdBy: string;
    /** URL used for the user profile image of the event author */
    createdByImageUrl: string;
    /**
     * The ID of the event.
     * @minimum 1
     */
    id: number;
    /**
     * **[Experimental]** A markdown-formatted summary of the event.
     * @nullable
     */
    summary: string | null;
};
