import { calculateRatio } from 'component/insights/calculate-ratio/calculate-ratio';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import type { InstanceInsightsSchema } from 'openapi';

export const calculateArchiveRatio = (
    groupedCreationArchiveData: GroupedDataByProject<
        InstanceInsightsSchema['creationArchiveTrends']
    >,
): string => {
    const { totalCreated, totalArchived } = Object.values(
        groupedCreationArchiveData,
    ).reduce(
        (totalAcc, totalCurr) => {
            const { created, archived } = totalCurr.reduce(
                (acc, curr) => {
                    const createdSum = curr.createdFlags
                        ? Object.values(curr.createdFlags).reduce(
                              (sum, count) => sum + count,
                              0,
                          )
                        : 0;
                    return {
                        created: acc.created + createdSum,
                        archived: acc.archived + (curr.archivedFlags ?? 0),
                    };
                },
                { created: 0, archived: 0 },
            );
            return {
                totalCreated: totalAcc.totalCreated + created,
                totalArchived: totalAcc.totalArchived + archived,
            };
        },
        { totalCreated: 0, totalArchived: 0 },
    );
    return calculateRatio(totalArchived, totalCreated);
};
