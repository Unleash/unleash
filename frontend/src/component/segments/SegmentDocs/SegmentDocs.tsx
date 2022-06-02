import { Alert } from '@mui/material';
import { useStyles } from 'component/segments/SegmentDocs/SegmentDocs.styles';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';

export const SegmentDocsWarning = () => {
    const { classes: styles } = useStyles();

    return (
        <Alert severity="warning">
            <p className={styles.paragraph}>
                Segments is an experimental feature available to select users.
            </p>
            <p className={styles.paragraph}>
                This feature is currently in development. Future versions may
                require to update your SDKs.
            </p>
            <p className={styles.paragraph}>
                <SegmentDocsLink />
            </p>
        </Alert>
    );
};

export const SegmentDocsValuesWarning = () => {
    const { segmentValuesLimit } = useSegmentLimits();

    if (typeof segmentValuesLimit === 'undefined') {
        return null;
    }

    return (
        <Alert severity="warning">
            Segments is an experimental feature available to select users.
            Currently, segments are limited to at most {segmentValuesLimit}{' '}
            values. <SegmentLimitsLink />
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

const SegmentDocsLink = () => {
    return (
        <>
            <a
                href={segmentsDocsLink}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'inherit' }}
            >
                Read more about segments in the documentation
            </a>
            .
        </>
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
