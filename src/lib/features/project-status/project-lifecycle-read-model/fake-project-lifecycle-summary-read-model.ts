import type {
    IProjectLifecycleSummaryReadModel,
    ProjectLifecycleSummary,
} from './project-lifecycle-read-model-type';

export class FakeProjectLifecycleSummaryReadModel
    implements IProjectLifecycleSummaryReadModel
{
    async getProjectLifecycleSummary(): Promise<ProjectLifecycleSummary> {
        return {
            initial: {
                averageDays: 0,
                currentFlags: 0,
            },
            preLive: {
                averageDays: 0,
                currentFlags: 0,
            },
            live: {
                averageDays: 0,
                currentFlags: 0,
            },
            completed: {
                averageDays: 0,
                currentFlags: 0,
            },
            archived: {
                currentFlags: 0,
                last30Days: 0,
            },
        };
    }
}
