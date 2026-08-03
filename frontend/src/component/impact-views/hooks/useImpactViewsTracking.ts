import { useImpactMetricsCounter } from 'hooks/useImpactMetrics';

const help = 'Tracks creation, editing, and deletion of impact views';

export const useImpactViewsTracking = () => {
    const { increment: created } = useImpactMetricsCounter(
        'impact_views_view_created',
        help,
    );
    const { increment: updated } = useImpactMetricsCounter(
        'impact_views_view_updated',
        help,
    );
    const { increment: deleted } = useImpactMetricsCounter(
        'impact_views_view_deleted',
        help,
    );

    return {
        trackViewCreated: () => created(),
        trackViewUpdated: () => updated(),
        trackViewDeleted: () => deleted(),
    };
};
