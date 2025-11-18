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

const StyledSelectedSegmentsLabel = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledAnd = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    padding: theme.spacing(0.75, 1),
    display: 'block',
    marginTop: 'auto',
    marginBottom: 'auto',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius,
    lineHeight: 1,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.elevation2,
}));

const StyledPreviewContainer = styled('div')({
    display: 'contents',
});

const StyledWarningAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
}));

export const FeatureStrategySegmentList = ({
    segments,
    setSegments,
}: IFeatureStrategySegmentListProps) => {
    const [preview, setPreview] = useState<ISegment>();
    const lastSegmentIndex = segments.length - 1;
    const segmentDetailsId = useId();

    if (segments.length === 0) {
        return null;
    }

    const emptySegments = segments.filter(
        (segment) => !segment.constraints || segment.constraints.length === 0,
    );
    const hasEmptySegments = emptySegments.length > 0;

    return (
        <>
            <ConditionallyRender
                condition={segments && segments.length > 0}
                show={
                    <StyledSelectedSegmentsLabel>
                        Selected Segments
                    </StyledSelectedSegmentsLabel>
                }
            />
            <ConditionallyRender
                condition={hasEmptySegments}
                show={
                    <StyledWarningAlert severity='warning'>
                        <strong>Warning!</strong> You are adding an empty
                        segment{emptySegments.length > 1 ? 's' : ''} (
                        {emptySegments.map((s) => s.name).join(', ')}). This
                        will activate this feature for ALL USERS.
                    </StyledWarningAlert>
                }
            />
            <StyledList>
                {segments.map((segment, i) => (
                    <Fragment key={segment.id}>
                        <FeatureStrategySegmentChip
                            segment={segment}
                            setSegments={setSegments}
                            preview={preview}
                            setPreview={setPreview}
                            aria-controls={segmentDetailsId}
                        />
                        <ConditionallyRender
                            condition={i < lastSegmentIndex}
                            show={<StyledAnd>AND</StyledAnd>}
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
