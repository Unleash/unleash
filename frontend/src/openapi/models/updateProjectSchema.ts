/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { UpdateProjectSchemaMode } from './updateProjectSchemaMode.js';

/**
 * Data used to update a [project](https://docs.getunleash.io/reference/projects)
 */
export interface UpdateProjectSchema {
    /** A default stickiness for the project affecting the default stickiness value for variants and Gradual Rollout strategy */
    defaultStickiness?: string;
    /** A new description for the project */
    description?: string;
    /** A mode of the project affecting what actions are possible in this project */
    mode?: UpdateProjectSchemaMode;
    /**
     * The new name of the project. The name must contain at least one non-whitespace character.
     * @pattern ^(?!\s*$).+
     */
    name: string;
}
