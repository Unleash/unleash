import type { FC } from 'react';
import { alpha, styled } from '@mui/material';
import type { ISegment } from 'interfaces/segment';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatConstraintText } from 'utils/formatConstraintText';
import { objectId } from 'utils/objectId';

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    color: theme.palette.common.white,
    fontSize: '13px',
    lineHeight: 1.5,
}));

const StyledConstraintsList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    margin: 0,
    padding: 0,
    listStyle: 'none',
    overflowY: 'auto',
    '& > li + li::before': {
        content: '"AND "',
        color: alpha(theme.palette.common.white, 0.7),
    },
}));

export const FeatureStrategySegmentTooltipContent: FC<{
    segment: ISegment;
}> = ({ segment }) => {
    const { locationSettings } = useLocationSettings();

    return (
        <StyledContent>
            {segment.constraints?.length ? (
                <StyledConstraintsList>
                    {segment.constraints.map((constraint) => (
                        <li key={objectId(constraint)}>
                            {formatConstraintText(constraint, locationSettings)}
                        </li>
                    ))}
                </StyledConstraintsList>
            ) : (
                <p>This segment has no constraints.</p>
            )}
        </StyledContent>
    );
};
