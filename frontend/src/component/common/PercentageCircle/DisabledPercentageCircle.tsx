import { useTheme } from '@mui/material';
import type { CSSProperties } from 'react';

interface IPercentageCircleProps {
    percentage: number;
    size?: `${number}rem`;
}

const PercentageCircle = ({
    percentage,
    size = '4rem',
}: IPercentageCircleProps) => {
    const theme = useTheme();

    const style: CSSProperties = {
        display: 'block',
        borderRadius: '100%',
        transform: 'rotate(-90deg)',
        height: size,
        width: size,
        background: theme.palette.background.elevation2,
    };

    // The percentage circle used to be drawn by CSS with a conic-gradient,
    // but the result was either jagged or blurry. SVG seems to look better.
    // See https://stackoverflow.com/a/70659532.
    const radius = 100 / (2 * Math.PI);
    const diameter = 2 * radius;

    return (
        <svg viewBox={`0 0 ${diameter} ${diameter}`} style={style} aria-hidden>
            <title>A circle progress bar with {percentage}% completion.</title>
            <circle
                r={radius}
                cx={radius}
                cy={radius}
                fill='none'
                stroke={theme.palette.neutral.border}
                strokeWidth={diameter}
                strokeDasharray={`${percentage} 100`}
            />
        </svg>
    );
};

export default PercentageCircle;
