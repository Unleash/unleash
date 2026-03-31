import { useImpactMetricsHistogram } from '../../hooks/useImpactMetrics';

const funnelName = 'flagpage_impact_metrics_funnel';
const funnelHelp =
    'Tracks user journey from flag page accordion through impact chart creation';
const funnelSteps = {
    accordionOpened: 1,
    modalOpened: 2,
    docsClicked: 3,
    metricSaved: 4,
};
const funnelBuckets = Object.values(funnelSteps);

export const useTrackFlagpageImpactMetrics = () => {
    const { observe: trackStep } = useImpactMetricsHistogram(
        funnelName,
        funnelHelp,
        funnelBuckets,
    );

    const trackAccordionOpened = () => trackStep(funnelSteps.accordionOpened);
    const trackAddMetricClicked = () => trackStep(funnelSteps.modalOpened);
    const trackDocsClicked = () => trackStep(funnelSteps.docsClicked);
    const trackMetricSaved = () => trackStep(funnelSteps.metricSaved);

    return {
        trackAccordionOpened,
        trackAddMetricClicked,
        trackDocsClicked,
        trackMetricSaved,
    };
};
