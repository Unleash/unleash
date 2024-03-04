import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { type ExecutiveSummarySchema } from 'openapi';
import { parseISO, getISOWeek, format } from 'date-fns';
import { getProjectColor } from '../executive-dashboard-utils';

type MetricsSummaryTrends = ExecutiveSummarySchema['metricsSummaryTrends'];

interface GroupedData {
    [key: string]: {
        [week: string]: {
            total: number;
            totalYes: number;
            totalNo: number;
            totalApps: number;
            totalEnvironments: number;
            totalFlags: number;
        };
    };
}

function groupAndSumData(data: MetricsSummaryTrends): any {
    const groupedData: GroupedData = {};

    data.forEach((item) => {
        const weekNumber = getISOWeek(parseISO(item.date));
        const year = format(parseISO(item.date), 'yyyy');
        const weekId = `${year}-${weekNumber.toString().padStart(2, '0')}`;
        const project = item.project;

        if (!groupedData[project]) {
            groupedData[project] = {};
        }

        if (!groupedData[project][weekId]) {
            groupedData[project][weekId] = {
                total: 0,
                totalYes: 0,
                totalNo: 0,
                totalApps: 0,
                totalEnvironments: 0,
                totalFlags: 0,
            };
        }

        groupedData[project][weekId].total += item.totalYes + item.totalNo;
        groupedData[project][weekId].totalYes += item.totalYes;
        groupedData[project][weekId].totalNo += item.totalNo;
        groupedData[project][weekId].totalApps += item.totalApps;
        groupedData[project][weekId].totalEnvironments +=
            item.totalEnvironments;
        groupedData[project][weekId].totalFlags += item.totalFlags;
    });

    return Object.entries(groupedData).map(([project, weeks]) => {
        const color = getProjectColor(project);
        return {
            label: project,
            borderColor: color,
            backgroundColor: color,
            fill: false,
            data: Object.entries(weeks)
                .sort(([weekA], [weekB]) => weekA.localeCompare(weekB))
                .map(([weekId, values]) => ({
                    weekId,
                    ...values,
                })),
        };
    });
}

export const useMetricsSummary = (
    metricsSummaryTrends: MetricsSummaryTrends,
) => {
    const theme = useTheme();

    const data = useMemo(() => {
        return { datasets: groupAndSumData(metricsSummaryTrends) };
    }, [theme, metricsSummaryTrends]);

    return data;
};
