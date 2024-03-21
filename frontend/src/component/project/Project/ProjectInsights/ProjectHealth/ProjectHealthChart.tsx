import type React from 'react';
import { useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface ProgressComponentProps {
    active: number;
    stale: number;
    potentiallyStale: number;
    health: number;
}

export const ProjectHealthChart: React.FC<ProgressComponentProps> = ({
    active,
    stale,
    potentiallyStale,
    health,
}) => {
    const theme = useTheme();
    const gap =
        active === 0 ||
        stale === 0 ||
        active / stale > 30 ||
        stale / active > 30
            ? 0
            : 10;
    const strokeWidth = 6;
    const radius = 50 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const gapAngle = (gap / circumference) * 360;

    const totalCount = active + stale;
    const activePercentage =
        totalCount === 0 ? 100 : (active / totalCount) * 100;
    const stalePercentage = totalCount === 0 ? 0 : (stale / totalCount) * 100;
    const potentiallyStalePercentage =
        active === 0 ? 0 : (potentiallyStale / totalCount) * 100;

    const activeLength = Math.max(
        (activePercentage / 100) * circumference - gap,
        1,
    );
    const staleLength = Math.max(
        (stalePercentage / 100) * circumference - gap,
        1,
    );
    const potentiallyStaleLength = Math.max(
        (potentiallyStalePercentage / 100) * circumference - gap,
        1,
    );

    const activeRotation = -90 + gapAngle / 2;
    const potentiallyStaleRotation =
        activeRotation +
        ((activeLength - potentiallyStaleLength) / circumference) * 360;
    const staleRotation =
        activeRotation + (activeLength / circumference) * 360 + gapAngle;

    const innerRadius = radius / 1.2;

    return (
        <svg width='170' height='170' viewBox='0 0 100 100'>
            <title>Project Health Chart</title>
            <circle
                data-testid='active-circle'
                cx='50'
                cy='50'
                r={radius}
                fill='none'
                stroke={theme.palette.success.border}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeDasharray={`${activeLength} ${circumference}`}
                transform={`rotate(${activeRotation} 50 50)`}
            />

            <ConditionallyRender
                condition={potentiallyStale > 0}
                show={
                    <circle
                        data-testid='potentially-stale-circle'
                        cx='50'
                        cy='50'
                        r={radius}
                        fill='none'
                        stroke={theme.palette.warning.border}
                        strokeWidth={strokeWidth}
                        strokeLinecap='round'
                        strokeDasharray={`${potentiallyStaleLength} ${circumference}`}
                        transform={`rotate(${potentiallyStaleRotation} 50 50)`}
                    />
                }
            />

            <ConditionallyRender
                condition={stale > 0}
                show={
                    <circle
                        data-testid='stale-circle'
                        cx='50'
                        cy='50'
                        r={radius}
                        fill='none'
                        stroke={theme.palette.error.border}
                        strokeWidth={strokeWidth}
                        strokeLinecap='round'
                        strokeDasharray={`${staleLength} ${circumference}`}
                        transform={`rotate(${staleRotation} 50 50)`}
                    />
                }
            />

            <circle
                cx='50'
                cy='50'
                r={innerRadius}
                fill={theme.palette.warning.light}
            />

            <text
                x='50%'
                y='50%'
                fill={theme.palette.text.primary}
                fontSize={theme.spacing(2.25)}
                textAnchor='middle'
                fontWeight='bold'
            >
                {health}%
            </text>
            <text
                x='50%'
                y='50%'
                dy='1.5em'
                fill={theme.palette.text.secondary}
                fontSize={theme.spacing(1.25)}
                textAnchor='middle'
                fontWeight='normal'
            >
                {active + stale} flags
            </text>
        </svg>
    );
};
