import { styled } from '@mui/material';
import type { ExposureProgressInfo } from 'interfaces/releasePlans';
import { prettifyLargeNumber } from 'component/common/PrettifyLargeNumber/formatLargeNumber.js';

const StyledPill = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    backgroundColor: theme.palette.background.elevation1,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    whiteSpace: 'nowrap',
}));

const StyledTrack = styled('span')(({ theme }) => ({
    display: 'inline-block',
    width: theme.spacing(5),
    height: theme.spacing(0.75),
    borderRadius: `${theme.shape.borderRadiusSmall}px`,
    backgroundColor: theme.palette.neutral.containerBorder,
    overflow: 'hidden',
}));

const StyledFill = styled('span', {
    shouldForwardProp: (prop) => prop !== 'value',
})<{ value: number }>(({ theme, value }) => ({
    display: 'block',
    width: `${value}%`,
    height: '100%',
    borderRadius: 'inherit',
    backgroundColor: theme.palette.primary.main,
}));

const formatExposures = prettifyLargeNumber(1000, 1);

const floorToTwoSignificantDigits = (value: number) => {
    const magnitude = 10 ** Math.max(Math.floor(Math.log10(value)) - 1, 0);
    return Math.floor(value / magnitude) * magnitude;
};

const formatCurrentExposures = (value: number) =>
    value === 0
        ? '0'
        : `~${formatExposures(floorToTwoSignificantDigits(value))}`;

export const ExposureProgress = ({
    exposures,
    target,
}: ExposureProgressInfo) => {
    const progress =
        target > 0 ? Math.min((exposures / target) * 100, 100) : 100;

    return (
        <StyledPill>
            <StyledTrack>
                <StyledFill value={progress} />
            </StyledTrack>
            {formatCurrentExposures(exposures)}/{formatExposures(target)}{' '}
            exposures
        </StyledPill>
    );
};
