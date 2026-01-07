import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import ActivityCalendar, { type ThemeInput } from 'react-activity-calendar';
import type { ProjectActivitySchema } from 'openapi';
import { styled, Tooltip } from '@mui/material';
import theme from 'themes/theme';
import { useThemeMode } from 'hooks/useThemeMode';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    'svg rect': {
        stroke: '#0000 !important',
    },
}));

type Output = { date: string; count: number; level: number };

const ensureFullYearData = (data: Output[]): Output[] => {
    const today = new Date();
    const oneYearBack = new Date();
    oneYearBack.setFullYear(today.getFullYear() - 1);

    const formattedToday = today.toISOString().split('T')[0];
    const formattedOneYearBack = oneYearBack.toISOString().split('T')[0];

    const hasToday = data.some((item) => item.date === formattedToday);
    const hasOneYearBack = data.some(
        (item) => item.date === formattedOneYearBack,
    );

    if (!hasOneYearBack) {
        data.unshift({ count: 0, date: formattedOneYearBack, level: 0 });
    }

    if (!hasToday) {
        data.push({ count: 0, date: formattedToday, level: 0 });
    }

    return data;
};

const transformData = (inputData: ProjectActivitySchema): Output[] => {
    const countArray = inputData.map((item) => item.count);

    // Step 2: Get all counts, sort them, and find the cut-off values for percentiles
    const counts = Object.values(countArray).sort((a, b) => a - b);

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
    return inputData.map(({ date, count }) => ({
        date,
        count,
        level: calculateLevel(count),
    }));
};

export const ProjectActivity = () => {
    const projectId = useRequiredPathParam('projectId');
    const { data } = useProjectStatus(projectId);
    const { themeMode } = useThemeMode();

    const explicitTheme: ThemeInput = {
        light: ['#f1f0fc', '#ceccfd', '#8982ff', '#6c65e5', '#615bc2'],
        dark: ['#302E42', theme.palette.background.alternative],
    };

    const levelledData = transformData(data.activityCountByDate);
    const fullData = ensureFullYearData(levelledData);

    return (
        <>
            {data.activityCountByDate.length > 0 ? (
                <StyledContainer>
                    <ActivityCalendar
                        colorScheme={themeMode}
                        theme={explicitTheme}
                        data={fullData}
                        maxLevel={4}
                        showWeekdayLabels={true}
                        labels={{
                            totalCount: '{{count}} activities in the last year',
                        }}
                        renderBlock={(block, activity) => (
                            <Tooltip
                                title={`${activity.count} activities on ${activity.date}`}
                            >
                                {block}
                            </Tooltip>
                        )}
                    />
                </StyledContainer>
            ) : (
                <span>No activity</span>
            )}
        </>
    );
};
