import { useImpactMetricsCounter } from 'hooks/useImpactMetrics';

const help = 'Tracks user journey of creating an impact metric from the UI.';

export const useTrackRegisterImpactMetrics = () => {
    const { increment: formOpened } = useImpactMetricsCounter(
        'registerImpactMetric_form_opened',
        help,
    );
    const { increment: metricCreated } = useImpactMetricsCounter(
        'registerImpactMetric_metric_created',
        help,
    );
    const { increment: docsClickedAfterCreation } = useImpactMetricsCounter(
        'registerImpactMetric_docs_clicked_after_creation',
        help,
    );

    return {
        trackFormOpened: () => formOpened(),
        trackMetricCreated: () => metricCreated(),
        trackDocsClickedAfterCreation: () => docsClickedAfterCreation(),
    };
};
