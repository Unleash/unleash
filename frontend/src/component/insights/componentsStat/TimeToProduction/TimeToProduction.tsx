import type { VFC } from 'react';
import { Typography, styled } from '@mui/material';
import { Gauge } from 'component/insights/components/Gauge/Gauge';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    textAlign: 'center',
}));

const StyledText = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(-7),
    display: 'flex',
    flexDirection: 'column',
}));

type TimeToProductionProps = {
    daysToProduction: number | undefined;
};

const interpolate = (
    value: number,
    [fromStart, fromEnd]: [number, number],
    [toStart, toEnd]: [number, number],
): number => {
    if (value < fromStart) {
        return toStart;
    }

    if (value > fromEnd) {
        return toEnd;
    }

    return (
        ((value - fromStart) / (fromEnd - fromStart)) * (toEnd - toStart) +
        toStart
    );
};

const resolveValue = (
    daysToProduction: number | undefined,
): {
    value: string | undefined;
    gauge: number | undefined;
    score: 'Fast' | 'Medium' | 'Slow' | undefined;
} => {
    if (daysToProduction === undefined || daysToProduction === 0) {
        return {
            value: undefined,
            gauge: undefined,
            score: undefined,
        };
    }

    if (daysToProduction <= 7) {
        return {
            value: `${daysToProduction.toFixed(1)} days`,
            gauge: interpolate(daysToProduction, [1, 7], [100, 75]),
            score: 'Fast',
        };
    }

    if (daysToProduction <= 31) {
        return {
            value: `${(daysToProduction / 7).toFixed(1)} weeks`,
            gauge: interpolate(daysToProduction, [7, 31], [67.5, 30]),
            score: 'Medium',
        };
    }

    return {
        value: `${(daysToProduction / 30).toFixed(1)} months`,
        gauge: interpolate(daysToProduction, [31, 365 / 4], [23, 0]),
        score: 'Slow',
    };
};

export const TimeToProduction: VFC<TimeToProductionProps> = ({
    daysToProduction,
}) => {
    const { value, gauge, score } = resolveValue(daysToProduction);

    return (
        <StyledContainer>
            <Gauge value={gauge} />
            <StyledText>
                <Typography variant='h2' component='div'>
                    {daysToProduction !== undefined ? value : 'N/A'}
                </Typography>
                <Typography
                    variant='body2'
                    sx={(theme) => ({
                        color: score
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                    })}
                >
                    {score || 'No data'}
                </Typography>
            </StyledText>
        </StyledContainer>
    );
};
