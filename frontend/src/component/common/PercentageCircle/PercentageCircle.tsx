import { useTheme } from '@mui/material';
import type { CSSProperties } from 'react';

interface IPercentageCircleProps {
    percentage: number;
    size?: `${number}rem`;
    disabled?: boolean | null;
}

const PercentageCircle = ({
    percentage,
    size = '4rem',
    disabled = false,
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
    const r = 100 / (2 * Math.PI);
    const d = 2 * r;

    const color = disabled
        ? theme.palette.neutral.border
        : theme.palette.primary.light;

    return (
        <svg viewBox={`0 0 ${d} ${d}`} style={style} aria-hidden>
            <title>A circle progress bar with {percentage}% completion.</title>
            <circle
                r={r}
                cx={r}
                cy={r}
                fill='none'
                stroke={color}
                strokeWidth={d}
                strokeDasharray={`${percentage} 100`}
            />
        </svg>
    );
};

export default PercentageCircle;
