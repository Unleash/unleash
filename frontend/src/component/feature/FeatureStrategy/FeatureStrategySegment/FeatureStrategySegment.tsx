import type React from 'react';
import { useId, useMemo, useRef, useState } from 'react';
import type { ISegment } from 'interfaces/segment';
import { MultiSelectPopover } from 'component/common/MultiSelectPopover/MultiSelectPopover.tsx';
import { FeatureStrategySegmentList } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentList';
import { SegmentDocsStrategyWarning } from 'component/segments/SegmentDocs';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';
import { Box, Button, styled, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

const pluralize = (count: number, noun: string) =>
    `${count} ${noun}${count === 1 ? '' : 's'}`;

interface IFeatureStrategySegmentProps {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    availableSegments: ISegment[];
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledRow = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
});

const StyledTitle = styled('h3')(({ theme }) => ({
    margin: 0,
    fontSize: 'inherit',
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
}));

const StyledHelpIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

export const FeatureStrategySegment = ({
    segments: selectedSegments,
    setSegments: setSelectedSegments,
    availableSegments,
}: IFeatureStrategySegmentProps) => {
    const titleId = useId();
    const addSegmentButtonRef = useRef<HTMLButtonElement>(null);
    const [addSegmentAnchor, setAddSegmentAnchor] =
        useState<HTMLButtonElement | null>(null);
    const { strategySegmentsLimit } = useSegmentLimits();

    const atStrategySegmentsLimit: boolean = Boolean(
        strategySegmentsLimit &&
            selectedSegments.length >= strategySegmentsLimit,
    );

    const availableSegmentsById = useMemo(
        () =>
            new Map(
                availableSegments.map((segment) => [
                    String(segment.id),
                    segment,
                ]),
            ),
        [availableSegments],
    );

    const segmentOptions = availableSegments.map((segment) => ({
        value: String(segment.id),
        label: segment.name,
        detail: pluralize(segment.constraints?.length ?? 0, 'rule'),
    }));

    const onSegmentsChange = (keys: string[]) => {
        const newSegments = keys
            .map((key) => availableSegmentsById.get(key))
            .filter((segment): segment is ISegment => Boolean(segment));
        setSelectedSegments(newSegments);
    };

    return (
        <StyledBox role='group' aria-labelledby={titleId}>
            <StyledRow>
                <StyledHelpIconBox>
                    <StyledTitle id={titleId}>Segments</StyledTitle>
                    <HelpIcon
                        htmlTooltip
                        tooltip={
                            <Box>
                                <Typography variant='body2'>
                                    Segments are reusable sets of constraints
                                    that can be defined once and reused across
                                    feature toggle configurations. You can
                                    create a segment on the global or the
                                    project level. Read more about segments{' '}
                                    <a
                                        href='https://docs.getunleash.io/concepts/segments'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        here
                                    </a>
                                </Typography>
                            </Box>
                        }
                    />
                </StyledHelpIconBox>
                <Button
                    ref={addSegmentButtonRef}
                    variant='outlined'
                    size='medium'
                    startIcon={<AddIcon />}
                    disabled={atStrategySegmentsLimit}
                    onClick={() =>
                        setAddSegmentAnchor(addSegmentButtonRef.current)
                    }
                >
                    Add segment
                </Button>
                <MultiSelectPopover
                    open={Boolean(addSegmentAnchor)}
                    anchorEl={addSegmentAnchor}
                    onClose={() => setAddSegmentAnchor(null)}
                    options={segmentOptions}
                    selected={selectedSegments.map((segment) =>
                        String(segment.id),
                    )}
                    onChange={onSegmentsChange}
                    searchPlaceholderText='Search segments'
                    horizontalAlign='right'
                />
            </StyledRow>
            {atStrategySegmentsLimit && <SegmentDocsStrategyWarning />}
            <FeatureStrategySegmentList
                segments={selectedSegments}
                setSegments={setSelectedSegments}
            />
        </StyledBox>
    );
};
