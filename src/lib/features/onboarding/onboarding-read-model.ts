import type { Db } from '../../db/db.js';
import type {
    IOnboardingReadModel,
    InstanceOnboarding,
    ProjectOnboarding,
    OnboardingStatus,
} from './onboarding-read-model-type.js';

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

    constructor(db: Db) {
        this.db = db;
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

    async getOnboardingStatusForProject(
        projectId: string,
    ): Promise<OnboardingStatus | null> {
        const projectExists = await this.db('projects')
            .select(1)
            .where('id', projectId)
            .first();

        if (!projectExists) {
            return null;
        }

        const db = this.db;
        const lastSeen = await db
            .select(db.raw('1'))
            .from('last_seen_at_metrics as lsm')
            .innerJoin('features as f', 'f.name', 'lsm.feature_name')
            .innerJoin('projects as p', 'p.id', 'f.project')
            .where('p.id', projectId)
            .union((qb) => {
                qb.select(db.raw('1'))
                    .from('client_applications_usage as cau')
                    .where('cau.project', projectId);
            })
            .first();

        if (lastSeen) {
            return { status: 'onboarded' };
        }

        const feature = await this.db('features')
            .select('name')
            .where('project', projectId)
            .where('archived_at', null)
            .first();

        if (!feature) {
            return { status: 'onboarding-started' };
        }
        return { status: 'first-flag-created', feature: feature.name };
    }
}
