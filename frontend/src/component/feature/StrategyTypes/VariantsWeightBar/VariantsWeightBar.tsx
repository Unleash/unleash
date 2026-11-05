import type { HTMLAttributes } from 'react';
import { Slider, styled } from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { focusOutline } from 'themes/themeStyles';
import {
    TOTAL_WEIGHT,
    weightsFromDraggedPositions,
} from '../variantWeights.ts';

const cumulativeWeights = (weights: number[]) =>
    weights.map((_, index) =>
        weights.slice(0, index + 1).reduce((sum, weight) => sum + weight, 0),
    );

const Bar = styled('div', {
    shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError: boolean }>(({ theme, hasError }) => ({
    position: 'relative',
    height: theme.spacing(2),
    marginBottom: theme.spacing(2),
    userSelect: 'none',
    touchAction: 'none',
    borderRadius: theme.shape.borderRadius,
    outline: hasError ? `2px solid ${theme.palette.error.main}` : 'none',
    outlineOffset: 2,
}));

const Segments = styled('div')(({ theme }) => ({
    display: 'flex',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const Segment = styled('div', {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ theme, color }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    minWidth: theme.spacing(0.5),
    background: color,
    color: theme.palette.text.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const HandleSlider = styled(Slider)({
    position: 'absolute',
    inset: 0,
    height: '100%',
    padding: 0,
});

const Grip = styled('span')(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderRadius: '50%',
    width: theme.spacing(2),
    height: theme.spacing(2),
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    cursor: 'col-resize',
    '&.Mui-focusVisible': focusOutline(theme),
}));

const GripThumb = ({
    children,
    ...thumbProps
}: HTMLAttributes<HTMLSpanElement>) => (
    <Grip {...thumbProps}>
        {children}
        <DragIndicator fontSize='inherit' />
    </Grip>
);

type BarVariant = {
    id: string;
    name: string;
    weight: number;
    color: string;
};

type VariantsWeightBarProps = {
    variants: BarVariant[];
    weightsError?: boolean;
    onWeightsChange: (weights: number[]) => void;
};

export const VariantsWeightBar = ({
    variants,
    weightsError = false,
    onWeightsChange,
}: VariantsWeightBarProps) => {
    const weights = variants.map((variant) => variant.weight);
    const splitPositions = cumulativeWeights(weights).slice(0, -1);

    const changeSplitPositions = (value: number | number[]) => {
        const nextSplitPositions = Array.isArray(value) ? value : [value];
        onWeightsChange(
            weightsFromDraggedPositions(weights, nextSplitPositions),
        );
    };

    return (
        <Bar hasError={weightsError}>
            <Segments>
                {variants.map((variant, index) => (
                    <Segment
                        key={variant.id}
                        color={variant.color}
                        style={{
                            flex: `${weights[index]} 0 0`,
                        }}
                    >
                        {weights[index] / 10}%
                    </Segment>
                ))}
            </Segments>
            {variants.length > 1 ? (
                <HandleSlider
                    value={splitPositions}
                    min={0}
                    max={TOTAL_WEIGHT}
                    step={10}
                    track={false}
                    slots={{ thumb: GripThumb }}
                    slotProps={{ rail: { style: { display: 'none' } } }}
                    getAriaLabel={(index) =>
                        `Split between ${variants[index].name} and ${variants[index + 1].name}`
                    }
                    getAriaValueText={(splitPosition) =>
                        `${splitPosition / 10}%`
                    }
                    onChange={(_, value) => changeSplitPositions(value)}
                />
            ) : null}
        </Bar>
    );
};
