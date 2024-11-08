export interface IProjectLifecycleSummaryReadModel {
    getProjectLifecycleSummary(
        projectId: string,
    ): Promise<ProjectLifecycleSummary>;
}

type StageDataWithAverageDays = {
    averageDays: number | null;
    currentFlags: number;
};

export type ProjectLifecycleSummary = {
    initial: StageDataWithAverageDays;
    preLive: StageDataWithAverageDays;
    live: StageDataWithAverageDays;
    completed: StageDataWithAverageDays;
    archived: {
        currentFlags: number;
        archivedFlagsLast30Days: number;
    };
};
