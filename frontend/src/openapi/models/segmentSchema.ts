/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { ConstraintSchema } from './constraintSchema.js';

/**
 * Represents a segment of users defined by a set of constraints.
 */
export interface SegmentSchema {
    /** List of constraints that determine which users are part of the segment */
    constraints: ConstraintSchema[];
    /** The time the segment was created as a RFC 3339-conformant timestamp. */
    createdAt?: string;
    /** Which user created this segment */
    createdBy?: string;
    /**
     * The description of the segment.
     * @nullable
     */
    description?: string | null;
    /** The segment's id. */
    id: number;
    /** The name of the segment. */
    name?: string;
    /**
     * The project the segment relates to, if applicable.
     * @nullable
     */
    project?: string | null;
}
