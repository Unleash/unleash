type BaseWeekData<T extends string> = {
    state: T;
    week: string;
    date: string;
};

export type EmptyWeekData = BaseWeekData<'empty'>;

export type PopulatedWeekData = BaseWeekData<'populated'> & {
    archivedFlags: number;
    totalCreatedFlags: number;
};

export type WithRatioWeekData = BaseWeekData<'withRatio'> & {
    archivedFlags: number;
    totalCreatedFlags: number;
    archivePercentage: number;
};

export type WeekDataInProgress = EmptyWeekData | PopulatedWeekData;

export type FinalizedWeekData = EmptyWeekData | WithRatioWeekData;

export type RawWeekData = {
    archivedFlags: number;
    createdFlags: Record<string, number>;
    week: string;
    date: string;
};

export type BatchedWeekDataWithRatio = Omit<WithRatioWeekData, 'week'> & {
    endDate: string;
};
export type BatchedEmptyWeekData = Omit<EmptyWeekData, 'week'> & {
    endDate: string;
};

export type BatchedWeekData = BatchedEmptyWeekData | BatchedWeekDataWithRatio;
