/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { FeatureTypeCountSchema } from './featureTypeCountSchema.js';
import type { ProjectInsightsSchemaHealth } from './projectInsightsSchemaHealth.js';
import type { ProjectDoraMetricsSchema } from './projectDoraMetricsSchema.js';
import type { ProjectInsightsSchemaMembers } from './projectInsightsSchemaMembers.js';
import type { ProjectStatsSchema } from './projectStatsSchema.js';
import type { ProjectInsightsSchemaTechnicalDebt } from './projectInsightsSchemaTechnicalDebt.js';

/**
 * A high-level overview of a project insights. It contains information such as project statistics, overall health, types of flags, members overview, change requests overview.
 */
export interface ProjectInsightsSchema {
    /** The number of features of each type */
    featureTypeCounts: FeatureTypeCountSchema[];
    /**
     * Use `technicalDebt` instead. Summary of the project health
     * @deprecated
     */
    health: ProjectInsightsSchemaHealth;
    /** Lead time (DORA) metrics */
    leadTime: ProjectDoraMetricsSchema;
    /** Active/inactive users summary */
    members: ProjectInsightsSchemaMembers;
    /** Project statistics */
    stats: ProjectStatsSchema;
    /** Summary of the projects technical debt */
    technicalDebt: ProjectInsightsSchemaTechnicalDebt;
}
