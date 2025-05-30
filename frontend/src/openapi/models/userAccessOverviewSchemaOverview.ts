/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { UserAccessOverviewSchemaOverviewEnvironmentItem } from './userAccessOverviewSchemaOverviewEnvironmentItem.js';
import type { UserAccessOverviewSchemaOverviewProjectItem } from './userAccessOverviewSchemaOverviewProjectItem.js';
import type { UserAccessOverviewSchemaOverviewRootItem } from './userAccessOverviewSchemaOverviewRootItem.js';

/**
 * The access overview (list of permissions) for the user
 */
export type UserAccessOverviewSchemaOverview = {
    /** The list of environment permissions */
    environment: UserAccessOverviewSchemaOverviewEnvironmentItem[];
    /** The list of project permissions */
    project: UserAccessOverviewSchemaOverviewProjectItem[];
    /** The list of root permissions */
    root: UserAccessOverviewSchemaOverviewRootItem[];
};
