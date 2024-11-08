export interface IProjectLifecycleSummaryReadModel {
    getProjectLifecycleSummary(
        projectId: string,
    ): Promise<ProjectLifecycleSummary>;
}

export type ProjectLifecycleSummary = {
    initial: {
        averageDays: number | null;
        currentFlags: number;
    };
    preLive: {
        averageDays: number | null;
        currentFlags: number;
    };
    live: {
        averageDays: number | null;
        currentFlags: number;
    };
    completed: {
        averageDays: number | null;
        currentFlags: number;
    };
    archived: {
        currentFlags: number;
        archivedFlagsLast30Days: number;
    };
};
