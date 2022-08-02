import { useTheme } from '@mui/material';
import { CSSProperties } from 'react';

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
        background: theme.palette.grey[200],
    };

    // The percentage circle used to be drawn by CSS with a conic-gradient,
    // but the result was either jagged or blurry. SVG seems to look better.
    // See https://stackoverflow.com/a/70659532.
    const r = 100 / (2 * Math.PI);
    const d = 2 * r;

    return (
        <svg viewBox={`0 0 ${d} ${d}`} style={style} aria-hidden>
            <circle
                r={r}
                cx={r}
                cy={r}
                fill="none"
                stroke={theme.palette.primary.light}
                strokeWidth={d}
                strokeDasharray={`${percentage} 100`}
            />
        </svg>
    );
};

export default PercentageCircle;
