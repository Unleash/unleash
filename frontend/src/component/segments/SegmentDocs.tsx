import { Alert } from '@mui/material';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';

export const SegmentDocsValuesWarning = () => {
    const { segmentValuesLimit } = useSegmentLimits();

    if (typeof segmentValuesLimit === 'undefined') {
        return null;
    }

    return (
        <Alert severity="info">
            A segment can have{' '}
            <a
                href="https://docs.getunleash.io/reference/segments#large-segments"
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
            Segments are limited to at most {segmentValuesLimit} values. This
            segment currently has {props.values}{' '}
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
            Strategies are limited to {strategySegmentsLimit} segments.{' '}
            <SegmentLimitsLink />
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
                style={{ color: 'inherit' }}
            >
                Get in touch
            </a>{' '}
            if you'd like to increase this limit.
        </>
    );
};

export const segmentsDocsLink = 'https://docs.getunleash.io/reference/segments';
