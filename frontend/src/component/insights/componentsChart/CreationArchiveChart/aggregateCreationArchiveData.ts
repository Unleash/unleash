import 'chartjs-adapter-date-fns';
import type {
    RawWeekData,
    PopulatedWeekData,
    EmptyWeekData,
    WithRatioWeekData,
    FinalizedWeekData,
    WeekDataInProgress,
} from './types.ts';

const aggregateWeekData = (
    acc: EmptyWeekData | PopulatedWeekData,
    item?: RawWeekData,
): WeekDataInProgress => {
    if (!item) return acc;

    const createdFlags = Object.values(item.createdFlags).reduce(
        (sum, flagTypeCount) => sum + flagTypeCount,
    );
    switch (acc.state) {
        case 'empty':
            return {
                ...acc,
                state: 'populated',
                archivedFlags: item.archivedFlags,
                totalCreatedFlags: createdFlags,
            };

        case 'populated': {
            return {
                ...acc,
                archivedFlags: acc.archivedFlags + item.archivedFlags,
                totalCreatedFlags: acc.totalCreatedFlags + createdFlags,
            };
        }
    }
};

const addArchivePercentage = (data: PopulatedWeekData): WithRatioWeekData => ({
    ...data,
    state: 'withRatio',
    archivePercentage:
        data.totalCreatedFlags > 0
            ? (data.archivedFlags / data.totalCreatedFlags) * 100
            : 0,
});

export const aggregateCreationArchiveData = (
    weeks: { week: string; date: string }[],
    dataSets: { data: RawWeekData[] }[],
): FinalizedWeekData[] =>
    weeks
        .map(({ week, date }) => {
            const mapped = dataSets.map((d) =>
                d.data.find((item: RawWeekData) => item.week === week),
            );
            const reduced = mapped.reduce(aggregateWeekData, {
                week,
                date,
                state: 'empty',
            });
            return reduced ?? { week, date, state: 'empty' };
        })
        .map((week: WeekDataInProgress) => {
            if (week.state === 'empty') {
                return week;
            }
            return addArchivePercentage(week);
        });
