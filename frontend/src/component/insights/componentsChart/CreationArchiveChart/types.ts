export type WeekData = {
    archivedFlags: number;
    totalCreatedFlags: number;
    createdFlagsByType: Record<string, number>;
    archivePercentage: number;
    week: string;
    date?: string;
};

export type RawWeekData = {
    archivedFlags: number;
    createdFlags: Record<string, number>;
    week: string;
    date: string;
};
