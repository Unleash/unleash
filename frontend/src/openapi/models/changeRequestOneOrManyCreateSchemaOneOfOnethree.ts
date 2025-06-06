/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { ChangeRequestOneOrManyCreateSchemaOneOfOnethreeAction } from './changeRequestOneOrManyCreateSchemaOneOfOnethreeAction.js';
import type { ChangeRequestOneOrManyCreateSchemaOneOfOnethreePayload } from './changeRequestOneOrManyCreateSchemaOneOfOnethreePayload.js';

/**
 * Delete a strategy from this feature.
 */
export type ChangeRequestOneOrManyCreateSchemaOneOfOnethree = {
    /** The name of this action. */
    action: ChangeRequestOneOrManyCreateSchemaOneOfOnethreeAction;
    /** The name of the feature that this change applies to. */
    feature: string;
    payload: ChangeRequestOneOrManyCreateSchemaOneOfOnethreePayload;
};
