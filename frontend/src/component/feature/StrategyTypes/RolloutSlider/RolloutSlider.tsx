import { withStyles } from 'tss-react/mui';
import { Slider, Box, styled, TextField, InputAdornment } from '@mui/material';
import { ROLLOUT_SLIDER_ID } from 'utils/testIds';
import { useNumericStringInput } from 'hooks/useNumericStringInput';

const StyledSlider = withStyles(Slider, (theme) => ({
    root: {
        height: 8,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid currentColor',
    },
    active: {},
    valueLabel: {},
    track: {
        height: 8,
        borderRadius: theme.shape.borderRadius,
    },
    rail: {
        height: 8,
        borderRadius: theme.shape.borderRadius,
    },
}));

const StyledSliderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: theme.spacing(4),
    marginBottom: theme.spacing(1),
}));

const StyledInputBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100px',
    flexShrink: 0,
}));

const SliderContent = styled('div')(({ theme }) => ({
    flexGrow: 1,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '90px',
}));

const marks = [
    {
        value: 0,
        label: '0%',
    },
    {
        value: 25,
        label: '25%',
    },
    {
        value: 50,
        label: '50%',
    },
    {
        value: 75,
        label: '75%',
    },
    {
        value: 100,
        label: '100%',
    },
];

export interface IRolloutSliderProps {
    name: string;
    minLabel?: string;
    maxLabel?: string;
    value: number;
    onChange: (e: Event, newValue: number | number[]) => void;
    disabled?: boolean;
    step?: number;
}

export const RolloutSlider = ({
    name,
    value,
    onChange,
    disabled = false,
    step = 1,
}: IRolloutSliderProps) => {
    // Bounds validation stays in component - hook only handles parsing
    const handleValueChange = (numValue: number) => {
        if (numValue >= 0 && numValue <= 100) {
            const event = new Event('input', { bubbles: true });
            onChange(event, numValue);
        }
    };

    const { inputValue, handleInputChange, handleInputBlur, handleKeyDown } =
        useNumericStringInput(value, handleValueChange, {
            parseMode: 'integer',
        });

    const valuetext = (value: number) => `${value}%`;

    return (
        <StyledSliderContainer>
            <SliderContent>
                <StyledSlider
                    min={0}
                    max={100}
                    value={value}
                    getAriaValueText={valuetext}
                    aria-label={name}
                    step={step}
                    data-testid={ROLLOUT_SLIDER_ID}
                    marks={marks}
                    onChange={onChange}
                    valueLabelDisplay='on'
                    disabled={disabled}
                />
            </SliderContent>
            <StyledInputBox>
                <StyledTextField
                    size='large'
                    aria-label={name}
                    type='number'
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    slotProps={{
                        htmlInput: {
                            min: 0,
                            max: 100,
                            step: 1,
                        },
                        input: {
                            endAdornment: (
                                <InputAdornment position='end'>
                                    %
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </StyledInputBox>
        </StyledSliderContainer>
    );
};
