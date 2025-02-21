import { useTheme } from '@mui/material';
import type { CSSProperties } from 'react';

type PercentageDonutProps = {
    percentage: number;
    size?: `${number}rem`;
    disabled?: boolean | null;
    donut?: boolean;
};

export const PercentageDonut = ({
    percentage,
    size = '4rem',
    disabled = false,
}: PercentageDonutProps) => {
    const theme = useTheme();

    const style: CSSProperties = {
        display: 'block',
        borderRadius: '100%',
        transform: 'rotate(-90deg)',
        height: size,
        width: size,
    };

    // The percentage circle used to be drawn by CSS with a conic-gradient,
    // but the result was either jagged or blurry. SVG seems to look better.
    // See https://stackoverflow.com/a/70659532.
    const r = 100 / (2 * Math.PI);
    const d = 2 * r;
    const strokeWidth = d * 0.2;

    const color = disabled
        ? theme.palette.neutral.border
        : theme.palette.primary.light;

    return (
        <div style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${d} ${d}`} style={style} aria-hidden>
                <title>Rollout</title>
                <circle
                    r={r}
                    cx={r}
                    cy={r}
                    fill='none'
                    stroke={theme.palette.background.elevation2}
                    strokeWidth={strokeWidth}
                />
                <circle
                    r={r}
                    cx={r}
                    cy={r}
                    fill='none'
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${percentage} 100`}
                />
            </svg>
            <span
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: color,
                    fontSize: theme.fontSizes.smallerBody,
                }}
            >
                {percentage}%
            </span>
        </div>
    );
};
