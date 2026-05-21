import type { FC } from 'react';
import { GoalTrackingViewChart } from './GoalTrackingViewChart';
import { SystemHealthViewChart } from './SystemHealthViewChart';
import type { MetricView } from './types';

const ALL_PROJECTS_FILTER = '*';

export type ViewChartProps = {
    view: MetricView;
    project?: string;
};

export const ViewChart: FC<ViewChartProps> = ({ view, project }) => {
    const projectFilter = project ?? ALL_PROJECTS_FILTER;

    if (view.template === 'system-health') {
        return <SystemHealthViewChart view={view} project={projectFilter} />;
    }

    return <GoalTrackingViewChart view={view} project={projectFilter} />;
};
