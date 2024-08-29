import type { Db } from '../../db/db';
import type {
    IOnboardingReadModel,
    InstanceOnboarding,
    ProjectOnboarding,
} from './onboarding-read-model-type';
import { millisecondsToMinutes } from 'date-fns';

const calculateTimeDifferenceInMinutes = (date1?: Date, date2?: Date) => {
    if (date1 && date2) {
        const diffInMilliseconds = date2.getTime() - date1.getTime();
        return millisecondsToMinutes(diffInMilliseconds);
    }
    return null;
};

export class OnboardingReadModel implements IOnboardingReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getInstanceOnboardingMetrics(): Promise<InstanceOnboarding> {
        const firstUserCreatedResult = await this.db('users')
            .select('created_at')
            .orderBy('created_at')
            .first();
        const firstLoginResult = await this.db('users')
            .select('first_seen_at')
            .orderBy('first_seen_at')
            .limit(2);

        const firstInitialResult = await this.db('feature_lifecycles')
            .select('created_at')
            .where('stage', 'initial')
            .orderBy('created_at')
            .first();
        const firstPreLiveResult = await this.db('feature_lifecycles')
            .select('created_at')
            .where('stage', 'pre-live')
            .orderBy('created_at')
            .first();
        const firstLiveResult = await this.db('feature_lifecycles')
            .select('created_at')
            .where('stage', 'live')
            .orderBy('created_at')
            .first();

        const createdAt = firstUserCreatedResult?.created_at;
        const firstLogin = firstLoginResult[0]?.first_seen_at;
        const secondLogin = firstLoginResult[1]?.first_seen_at;
        const firstInitial = firstInitialResult?.created_at;
        const firstPreLive = firstPreLiveResult?.created_at;
        const firstLive = firstLiveResult?.created_at;

        const firstLoginDiff = calculateTimeDifferenceInMinutes(
            createdAt,
            firstLogin,
        );
        const secondLoginDiff = calculateTimeDifferenceInMinutes(
            createdAt,
            secondLogin,
        );
        const firstFlagDiff = calculateTimeDifferenceInMinutes(
            createdAt,
            firstInitial,
        );
        const firstPreLiveDiff = calculateTimeDifferenceInMinutes(
            createdAt,
            firstPreLive,
        );
        const firstLiveDiff = calculateTimeDifferenceInMinutes(
            createdAt,
            firstLive,
        );

        return {
            firstLogin: firstLoginDiff,
            secondLogin: secondLoginDiff,
            firstFeatureFlag: firstFlagDiff,
            firstPreLive: firstPreLiveDiff,
            firstLive: firstLiveDiff,
        };
    }

    async getProjectsOnboardingMetrics(): Promise<Array<ProjectOnboarding>> {
        const lifecycleResults = await this.db('projects')
            .join('features', 'projects.id', 'features.project')
            .join(
                'feature_lifecycles',
                'features.name',
                'feature_lifecycles.feature',
            )
            .select('projects.id as project_id')
            .select('projects.created_at as project_created_at')
            .select(
                this.db.raw(
                    ` MIN(CASE WHEN feature_lifecycles.stage = 'initial' THEN feature_lifecycles.created_at ELSE NULL END) AS first_initial`,
                ),
            )
            .select(
                this.db.raw(
                    `MIN(CASE WHEN feature_lifecycles.stage = 'pre-live' THEN feature_lifecycles.created_at ELSE NULL END) AS first_pre_live`,
                ),
            )
            .select(
                this.db.raw(
                    `MIN(CASE WHEN feature_lifecycles.stage = 'live' THEN feature_lifecycles.created_at ELSE NULL END) AS first_live`,
                ),
            )
            .groupBy('projects.id');

        return lifecycleResults.map((result) => ({
            project: result.project_id,
            firstFeatureFlag: calculateTimeDifferenceInMinutes(
                result.project_created_at,
                result.first_initial,
            ),
            firstPreLive: calculateTimeDifferenceInMinutes(
                result.project_created_at,
                result.first_pre_live,
            ),
            firstLive: calculateTimeDifferenceInMinutes(
                result.project_created_at,
                result.first_live,
            ),
        }));
    }
}
