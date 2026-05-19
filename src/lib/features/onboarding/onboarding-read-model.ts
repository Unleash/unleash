import type { Db } from '../../db/db.js';
import type { IFlagResolver } from '../../types/index.js';
import type {
    IOnboardingReadModel,
    InstanceOnboarding,
    ProjectOnboarding,
    OnboardingStatus,
} from './onboarding-read-model-type.js';
import { FEATURE_ENVIRONMENT_ENABLED } from '../../events/index.js';

const instanceEventLookup = {
    'first-user-login': 'firstLogin',
    'second-user-login': 'secondLogin',
    'first-flag': 'firstFeatureFlag',
    'first-pre-live': 'firstPreLive',
    'first-live': 'firstLive',
};

const projectEventLookup = {
    'first-flag': 'firstFeatureFlag',
    'first-pre-live': 'firstPreLive',
    'first-live': 'firstLive',
};

export class OnboardingReadModel implements IOnboardingReadModel {
    private db: Db;

    private flagResolver: IFlagResolver;

    constructor(db: Db, flagResolver: IFlagResolver) {
        this.db = db;
        this.flagResolver = flagResolver;
    }

    async getInstanceOnboardingMetrics(): Promise<InstanceOnboarding> {
        const eventsResult = await this.db('onboarding_events_instance').select(
            'event',
            'time_to_event',
        );

        const events: InstanceOnboarding = {
            firstLogin: null,
            secondLogin: null,
            firstFeatureFlag: null,
            firstPreLive: null,
            firstLive: null,
        };

        for (const event of eventsResult) {
            const eventType = instanceEventLookup[event.event];
            if (eventType) {
                events[eventType] = event.time_to_event;
            }
        }

        return events as InstanceOnboarding;
    }

    async getProjectsOnboardingMetrics(): Promise<Array<ProjectOnboarding>> {
        const lifecycleResults = await this.db(
            'onboarding_events_project',
        ).select('project', 'event', 'time_to_event');

        const projects: Array<ProjectOnboarding> = [];

        lifecycleResults.forEach((result) => {
            let project = projects.find((p) => p.project === result.project);

            if (!project) {
                project = {
                    project: result.project,
                    firstFeatureFlag: null,
                    firstPreLive: null,
                    firstLive: null,
                };
                projects.push(project);
            }

            const eventType = projectEventLookup[result.event];
            if (eventType) {
                project[eventType] = result.time_to_event;
            }
        });

        return projects;
    }

    async getOnboardingStatusesForProjects(
        projectIds: string[],
    ): Promise<Map<string, OnboardingStatus>> {
        const useNewSteps = this.flagResolver.isEnabled(
            'onboardingProjectSetupNewSteps',
        );

        const result = new Map<string, OnboardingStatus>();

        if (projectIds.length === 0) {
            return result;
        }

        const existingProjectRows = await this.db('projects')
            .select('id')
            .whereIn('id', projectIds);

        if (existingProjectRows.length === 0) {
            return result;
        }
        const existingIds = existingProjectRows.map((r) => r.id);

        const db = this.db;
        const sdkUsageRows = await db('last_seen_at_metrics as lsm')
            .innerJoin('features as f', 'f.name', 'lsm.feature_name')
            .distinct('f.project as project')
            .whereIn('f.project', existingIds)
            .union((qb) => {
                qb.from('client_applications_usage')
                    .distinct('project')
                    .whereIn('project', existingIds);
            });
        const projectsWithSdkUsage = new Set<string>(
            sdkUsageRows.map((r) => r.project),
        );

        const enabledFeatureEventRows = await db('events')
            .distinct('project')
            .where('type', FEATURE_ENVIRONMENT_ENABLED)
            .whereIn('project', existingIds);
        const projectsWithEnabledFlagEvent = new Set<string>(
            enabledFeatureEventRows.map((r) => r.project),
        );

        const featureRows = await db('features')
            .distinctOn('project')
            .select('project', 'name')
            .whereNull('archived_at')
            .whereIn('project', existingIds);
        const firstFeatureByProject = new Map<string, string>(
            featureRows.map((r) => [r.project, r.name]),
        );

        const determineStatus = (projectId: string): OnboardingStatus => {
            if (projectsWithSdkUsage.has(projectId)) {
                if (!useNewSteps) {
                    return { status: 'onboarded' };
                }

                if (projectsWithEnabledFlagEvent.has(projectId)) {
                    return { status: 'onboarded' };
                }
                return { status: 'sdk-connected' };
            }

            const feature = firstFeatureByProject.get(projectId);
            if (!feature) {
                return { status: 'onboarding-started' };
            }
            return { status: 'first-flag-created', feature };
        };

        for (const projectId of existingIds) {
            result.set(projectId, determineStatus(projectId));
        }

        return result;
    }
}
