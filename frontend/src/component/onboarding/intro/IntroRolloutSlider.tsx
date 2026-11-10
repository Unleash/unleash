import { Box, Slider, styled } from '@mui/material';

const marks = [
    { value: 0, label: '0%' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' },
];

const StyledSlider = styled(Slider)(({ theme }) => ({
    height: 5,
    padding: '8px 0 16px',
    '& .MuiSlider-thumb': {
        height: 18,
        width: 18,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid currentColor',
    },
    '& .MuiSlider-track': {
        height: 5,
        borderRadius: theme.shape.borderRadius,
    },
    '& .MuiSlider-rail': {
        height: 5,
        borderRadius: theme.shape.borderRadius,
    },
}));

const StyledSliderBox = styled(Box)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(0, 1.25),
}));

interface IIntroRolloutSliderProps {
    /** A11y label - not rendered as a visible title. */
    name: string;
    value: number;
    onChange: (value: number) => void;
}

/**
 * Intro-only slim rollout slider. Mirrors the visual shape of the real
 * {@link RolloutSlider} but skips the help tooltip, the numeric input box, and
 * the visible title so the intro panel stays compact. Deliberately isolated
 * from the shared component so demo tweaks don't creep into its API.
 */
export const IntroRolloutSlider = ({
    name,
    value,
    onChange,
}: IIntroRolloutSliderProps) => (
    <StyledSliderBox>
        <StyledSlider
            min={0}
            max={100}
            step={1}
            value={value}
            marks={marks}
            valueLabelDisplay='auto'
            aria-label={name}
            getAriaValueText={(v) => `${v}%`}
            onChange={(_, next) => onChange(next as number)}
        />
    </StyledSliderBox>
);
