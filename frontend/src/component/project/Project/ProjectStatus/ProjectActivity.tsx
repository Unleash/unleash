import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import ActivityCalendar, { type ThemeInput } from 'react-activity-calendar';
import type { ProjectActivitySchema } from '../../../../openapi';
import { styled, Tooltip } from '@mui/material';

const StyledContainer = styled('div')(({ theme }) => ({
    gap: theme.spacing(1),
}));

type Output = { date: string; count: number; level: number };

export function transformData(inputData: ProjectActivitySchema): Output[] {
    const resultMap: Record<string, number> = {};

    // Step 1: Count the occurrences of each date
    inputData.forEach((item) => {
        const formattedDate = new Date(item.date).toISOString().split('T')[0];
        resultMap[formattedDate] = (resultMap[formattedDate] || 0) + 1;
    });

    // Step 2: Get all counts, sort them, and find the cut-off values for percentiles
    const counts = Object.values(resultMap).sort((a, b) => a - b);

    const percentile = (percent: number) => {
        const index = Math.floor((percent / 100) * counts.length);
        return counts[index] || counts[counts.length - 1];
    };

    const thresholds = [
        percentile(25), // 25th percentile
        percentile(50), // 50th percentile
        percentile(75), // 75th percentile
        percentile(100), // 100th percentile
    ];

    // Step 3: Assign a level based on the percentile thresholds
    const calculateLevel = (count: number): number => {
        if (count <= thresholds[0]) return 1; // 1-25%
        if (count <= thresholds[1]) return 2; // 26-50%
        if (count <= thresholds[2]) return 3; // 51-75%
        return 4; // 76-100%
    };

    // Step 4: Convert the map back to an array and assign levels
    return Object.entries(resultMap)
        .map(([date, count]) => ({
            date,
            count,
            level: calculateLevel(count),
        }))
        .reverse(); // Optional: reverse the order if needed
}

export const ProjectActivity = () => {
    const projectId = useRequiredPathParam('projectId');
    const { data } = useProjectStatus(projectId);

    const explicitTheme: ThemeInput = {
        light: ['#f1f0fc', '#ceccfd', '#8982ff', '#6c65e5', '#615bc2'],
        dark: ['#f1f0fc', '#ceccfd', '#8982ff', '#6c65e5', '#615bc2'],
    };

    const levelledData = transformData(data.activityCountByDate);

    return (
        <StyledContainer>
            {data.activityCountByDate.length > 0 ? (
                <>
                    <span>Activity in project</span>
                    <ActivityCalendar
                        theme={explicitTheme}
                        data={levelledData}
                        maxLevel={4}
                        showWeekdayLabels={true}
                        renderBlock={(block, activity) => (
                            <Tooltip
                                title={`${activity.count} activities on ${activity.date}`}
                            >
                                {block}
                            </Tooltip>
                        )}
                    />
                </>
            ) : (
                <span>No activity</span>
            )}
        </StyledContainer>
    );
};
