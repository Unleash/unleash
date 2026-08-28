import { useImpactMetricsCounter } from 'hooks/useImpactMetrics';

const help = 'Tracks user journey of creating an impact metric from the UI.';

export const useTrackRegisterImpactMetrics = (
    entryPoint?:
        | 'impact-metrics-page'
        | 'flag-impact-metrics-accordion'
        | 'flag-safeguards',
) => {
    const determineFormCounter = () => {
        switch (entryPoint) {
            case 'impact-metrics-page':
                return 'registerImpactMetric_form_opened_from_impact_metrics_page';
            case 'flag-impact-metrics-accordion':
                return 'registerImpactMetric_form_opened_from_flagpage_accordion';
            case 'flag-safeguards':
                return 'registerImpactMetric_form_opened_from_safeguards';
            default:
                return 'registerImpactMetric_form_opened';
        }
    };

    const { increment: formOpened } = useImpactMetricsCounter(
        determineFormCounter(),
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
