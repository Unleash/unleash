import type React from 'react';
import { Fragment, useId, useState } from 'react';
import type { ISegment } from 'interfaces/segment';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStrategySegmentChip } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentChip';
import { Alert, styled } from '@mui/material';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';

interface IFeatureStrategySegmentListProps {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

const StyledList = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}));

const StyledPreviewContainer = styled('div')({
    display: 'contents',
});

export const FeatureStrategySegmentList = ({
    segments,
    setSegments,
}: IFeatureStrategySegmentListProps) => {
    const [preview, setPreview] = useState<ISegment>();
    const segmentDetailsId = useId();

    if (segments.length === 0) {
        return null;
    }

    const emptySegments = segments.filter(
        (segment) => !segment.constraints || segment.constraints.length === 0,
    );

    return (
        <>
            {emptySegments.length ? (
                <Alert severity='warning'>
                    <strong>Heads up:</strong>{' '}
                    {emptySegments.map((s) => s.name).join(', ')}{' '}
                    {emptySegments.length > 1 ? 'have' : 'has'} no constraints,
                    so {emptySegments.length > 1 ? 'they' : 'it'} won't have any
                    effect. Without other constraints, everyone will get this
                    flag.
                </Alert>
            ) : null}
            <StyledList>
                {segments.map((segment) => (
                    <Fragment key={segment.id}>
                        <FeatureStrategySegmentChip
                            segment={segment}
                            setSegments={setSegments}
                            preview={preview}
                            setPreview={setPreview}
                            aria-controls={segmentDetailsId}
                        />
                    </Fragment>
                ))}
            </StyledList>
            <StyledPreviewContainer id={segmentDetailsId}>
                <ConditionallyRender
                    condition={Boolean(preview)}
                    show={<SegmentItem segment={preview!} isExpanded />}
                />
            </StyledPreviewContainer>
        </>
    );
};
