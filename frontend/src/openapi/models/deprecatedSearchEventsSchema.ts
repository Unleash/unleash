/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { DeprecatedSearchEventsSchemaType } from './deprecatedSearchEventsSchemaType';

/**
 * 
        Search for events by type, project, feature, free-text query,
        or a combination thereof. Pass an empty object to fetch all events.
    
 */
export interface DeprecatedSearchEventsSchema {
    /** Find events by feature flag name (case-sensitive). */
    feature?: string;
    /**
     * The maximum amount of events to return in the search result
     * @minimum 1
     * @maximum 100
     */
    limit?: number;
    /**
     * Which event id to start listing from
     * @minimum 0
     */
    offset?: number;
    /** Find events by project ID (case-sensitive). */
    project?: string;
    /** Find events by a free-text search query. The query will be matched against the event type, the username or email that created the event (if any), and the event data payload (if any). */
    query?: string;
    /** Find events by event type (case-sensitive). */
    type?: DeprecatedSearchEventsSchemaType;
}