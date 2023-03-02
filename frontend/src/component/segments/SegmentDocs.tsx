import { Alert } from '@mui/material';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';

export const SegmentDocsValuesInfo = () => {
    const { segmentValuesLimit } = useSegmentLimits();

    if (typeof segmentValuesLimit === 'undefined') {
        return null;
    }

    return (
        <Alert severity="info">
            A segment can have{' '}
            <a
                href="https://docs.getunleash.io/reference/segments#segment-limits"
                target="_blank"
                rel="noreferrer"
            >
                at most {segmentValuesLimit} across all of its contraints
            </a>
            . <SegmentLimitsLink />
        </Alert>
    );
};

export const SegmentDocsValuesError = (props: { values: number }) => {
    const { segmentValuesLimit } = useSegmentLimits();

    if (typeof segmentValuesLimit === 'undefined') {
        return null;
    }

    return (
        <Alert severity="error">
            A segment can have{' '}
            <a
                href="https://docs.getunleash.io/reference/segments#segment-limits"
                target="_blank"
                rel="noreferrer"
            >
                at most {segmentValuesLimit} across all of its contraints
            </a>
            . This segment has {props.values}{' '}
            {props.values === 1 ? 'value' : 'values'}.
        </Alert>
    );
};

export const SegmentDocsStrategyWarning = () => {
    const { strategySegmentsLimit } = useSegmentLimits();

    if (typeof strategySegmentsLimit === 'undefined') {
        return null;
    }

    return (
        <Alert severity="warning">
            You can't apply more than {strategySegmentsLimit} segments to a
            strategy. <SegmentLimitsLink />
        </Alert>
    );
};

const SegmentLimitsLink = () => {
    return (
        <>
            <a
                href="https://slack.unleash.run"
                target="_blank"
                rel="noreferrer"
            >
                Get in touch
            </a>{' '}
            if you'd like to increase this limit.
        </>
    );
};

export const segmentsDocsLink = 'https://docs.getunleash.io/reference/segments';
