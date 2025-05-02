import { styled, Typography } from '@mui/material';
import { useRecentlyUsedSegments } from './useRecentlyUsedSegments';
import type { ISegment } from 'interfaces/segment';
import { FeatureStrategySegmentChip } from '../FeatureStrategySegmentChip';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useUiFlag } from 'hooks/useUiFlag';

type IRecentlyUsedSegmentsProps = {
    setSegments?: React.Dispatch<React.SetStateAction<ISegment[]>>;
};

const StyledContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledSegmentsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}));

export const RecentlyUsedSegments = ({
    setSegments,
}: IRecentlyUsedSegmentsProps) => {
    const { items: recentlyUsedSegmentIds } = useRecentlyUsedSegments();
    const { segments: allSegments } = useSegments();
    const addEditStrategyEnabled = useUiFlag('addEditStrategy');

    if (
        !addEditStrategyEnabled ||
        recentlyUsedSegmentIds.length === 0 ||
        !setSegments ||
        !allSegments
    ) {
        return null;
    }

    const segmentObjects = recentlyUsedSegmentIds
        .map((id) => allSegments.find((segment) => segment.id === id))
        .filter((segment) => segment !== undefined) as ISegment[];

    if (segmentObjects.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <StyledHeader>Recently used segments</StyledHeader>
            <StyledSegmentsContainer>
                {segmentObjects.map((segment) => (
                    <FeatureStrategySegmentChip
                        key={segment.id}
                        segment={segment}
                        setSegments={setSegments}
                        preview={undefined}
                        setPreview={() => {}}
                    />
                ))}
            </StyledSegmentsContainer>
        </StyledContainer>
    );
};
