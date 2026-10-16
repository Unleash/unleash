import type React from 'react';
import { Fragment } from 'react';
import type { ISegment } from 'interfaces/segment';
import { FeatureStrategySegmentChip } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentChip';
import { Alert, styled } from '@mui/material';

interface IFeatureStrategySegmentListProps {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

const StyledList = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}));

export const FeatureStrategySegmentList = ({
    segments,
    setSegments,
}: IFeatureStrategySegmentListProps) => {
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
                        />
                    </Fragment>
                ))}
            </StyledList>
        </>
    );
};
