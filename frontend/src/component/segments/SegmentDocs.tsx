import { Alert } from '@mui/material';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';

export const SegmentDocsValuesWarning = () => {
    const { segmentValuesLimit } = useSegmentLimits();

    if (typeof segmentValuesLimit === 'undefined') {
        return null;
    }

    return (
        <Alert severity="warning">
            Segments is an experimental feature, currently limited to at most{' '}
            {segmentValuesLimit} values. <SegmentLimitsLink />
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
            Please{' '}
            <a
                href="https://slack.unleash.run"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'inherit' }}
            >
                get in touch
            </a>{' '}
            if you would like this limit increased.
        </>
    );
};

export const segmentsDocsLink = 'https://docs.getunleash.io/reference/segments';
