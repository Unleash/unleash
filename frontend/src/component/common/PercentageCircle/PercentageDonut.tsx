import { styled, useTheme } from '@mui/material';
import type { CSSProperties, ReactNode } from 'react';

const StyledContainer = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: 0,
}));

const StyledContent = styled('div', {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color?: string }>(({ theme, color }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color,
    fontSize: theme.fontSizes.smallerBody,
    margin: 0,
}));

type PercentageDonutProps = {
    percentage: number;
    size?: `${number}rem`;
    disabled?: boolean | null;
    donut?: boolean;
    children?: ReactNode;
    strokeRatio?: number;
};

export const PercentageDonut = ({
    percentage,
    size = '4rem',
    disabled = false,
    children,
    strokeRatio = 0.2,
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
    const strokeWidth = d * strokeRatio;

    const color = disabled
        ? theme.palette.neutral.border
        : theme.palette.primary.light;

    return (
        <StyledContainer>
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: should be in a figure with figcaption */}
            <svg viewBox={`0 0 ${d} ${d}`} style={style} aria-hidden>
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
            <StyledContent color={color}>{children}</StyledContent>
        </StyledContainer>
    );
};
