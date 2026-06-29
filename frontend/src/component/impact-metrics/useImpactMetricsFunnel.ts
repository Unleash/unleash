import { useImpactMetricsCounter } from '../../hooks/useImpactMetrics';

const funnelHelp =
    'Tracks user journey from flag page accordion through impact chart creation';

export const useTrackFlagpageImpactMetrics = () => {
    const { increment: accordionOpened } = useImpactMetricsCounter(
        'flagpage_funnel_accordion_opened',
        funnelHelp,
    );
    const { increment: modalOpened } = useImpactMetricsCounter(
        'flagpage_funnel_modal_opened',
        funnelHelp,
    );
    const { increment: docsClicked } = useImpactMetricsCounter(
        'flagpage_funnel_docs_clicked',
        funnelHelp,
    );
    const { increment: metricSaved } = useImpactMetricsCounter(
        'flagpage_funnel_metric_saved',
        funnelHelp,
    );

    const trackAccordionOpened = () => accordionOpened();
    const trackAddMetricClicked = () => modalOpened();
    const trackDocsClicked = () => docsClicked();
    const trackMetricSaved = () => metricSaved();

    return {
        trackAccordionOpened,
        trackAddMetricClicked,
        trackDocsClicked,
        trackMetricSaved,
    };
};
