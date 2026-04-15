import type { FC } from 'react';
import { Box, styled } from '@mui/material';
import type { MultimetricStepSeries } from './types';

const StyledLegend = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5, 1.5),
    paddingTop: theme.spacing(1),
    marginTop: theme.spacing(0.5),
}));

// Rendered as a `<span role="button">` rather than `<button>` because this
// legend is rendered inside an anchor (the card link), and a `<button>` nested
// in an `<a>` is invalid HTML.
const StyledLegendItem = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.25, 0.5),
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'inherit',
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.primary,
    transition: 'opacity 120ms ease, color 120ms ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
    },
}));

const StyledLegendSwatch = styled(Box)({
    width: 10,
    height: 10,
    borderRadius: 2,
    flexShrink: 0,
});

type StepLegendProps = {
    stepSeries: MultimetricStepSeries[];
    colors: readonly string[];
    hiddenSteps: Set<number>;
    onToggle: (index: number) => void;
};

// Clickable legend below the chart. Clicking a step toggles its visibility in
// the time series above.
export const StepLegend: FC<StepLegendProps> = ({
    stepSeries,
    colors,
    hiddenSteps,
    onToggle,
}) => (
    <StyledLegend>
        {stepSeries.map((step, index) => {
            const color = colors[index % colors.length];
            const isHidden = hiddenSteps.has(index);
            return (
                <StyledLegendItem
                    key={step.label}
                    role='button'
                    tabIndex={0}
                    aria-pressed={isHidden}
                    onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        clickEvent.preventDefault();
                        onToggle(index);
                    }}
                    onKeyDown={(keyEvent) => {
                        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                            keyEvent.stopPropagation();
                            keyEvent.preventDefault();
                            onToggle(index);
                        }
                    }}
                    sx={{
                        opacity: isHidden ? 0.4 : 1,
                        textDecoration: isHidden ? 'line-through' : 'none',
                    }}
                >
                    <StyledLegendSwatch
                        sx={{
                            backgroundColor: isHidden
                                ? 'action.disabled'
                                : color,
                        }}
                    />
                    {step.label}
                </StyledLegendItem>
            );
        })}
    </StyledLegend>
);
