import type {
    IProjectLifecycleSummaryReadModel,
    ProjectLifecycleSummary,
} from './project-lifecycle-read-model-type.js';

export class FakeProjectLifecycleSummaryReadModel
    implements IProjectLifecycleSummaryReadModel
{
    async getProjectLifecycleSummary(): Promise<ProjectLifecycleSummary> {
        const placeholderData = {
            averageDays: 0,
            currentFlags: 0,
        };
        return {
            initial: placeholderData,
            preLive: placeholderData,
            live: placeholderData,
            completed: placeholderData,
            archived: {
                currentFlags: 0,
                last30Days: 0,
            },
        };
    }
}
