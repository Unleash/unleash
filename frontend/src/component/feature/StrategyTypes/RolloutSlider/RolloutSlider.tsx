import { type ChangeEvent, type KeyboardEvent, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import { Slider, Box, styled, TextField, InputAdornment } from '@mui/material';
import { ROLLOUT_SLIDER_ID } from 'utils/testIds';

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

const isValidPercentage = (text: string): boolean => {
    if (text === '') return false;

    const value = Number(text);
    return Number.isInteger(value) && value >= 0 && value <= 100;
};

const nearestWholePercentage = (number: number): number => {
    const wholeNumber = Math.round(number);
    return Math.min(100, Math.max(0, wholeNumber));
};

const percentageError = (text: string): string => {
    const typedNumber = Number(text);
    if (typedNumber > 100) return 'Cannot exceed 100';
    if (typedNumber < 0) return 'Cannot be below 0';
    return 'Must be a whole number';
};

export const RolloutSlider = ({
    name,
    value,
    onChange,
    disabled = false,
    step = 1,
}: IRolloutSliderProps) => {
    const [dragValue, setDragValue] = useState<number | null>(null);
    const displayedValue = dragValue ?? value;
    const [invalidText, setInvalidText] = useState<string | null>(null);
    const inputText = invalidText ?? displayedValue.toString();
    const inputError = invalidText ? percentageError(invalidText) : '';

    const commitValue = (numValue: number) => {
        const event = new Event('input', { bubbles: true });
        onChange(event, numValue);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const typedText = event.target.value;
        const typedNumber = Number(typedText);
        const typedTextIsNumber =
            typedText !== '' && Number.isFinite(typedNumber);
        if (typedTextIsNumber) {
            commitValue(nearestWholePercentage(typedNumber));
        }
        setInvalidText(isValidPercentage(typedText) ? null : typedText);
    };

    const discardInvalidText = () => setInvalidText(null);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && invalidText !== null) {
            event.preventDefault();
            discardInvalidText();
        }
    };

    const handleSliderDrag = (_: Event, newValue: number | number[]) => {
        setDragValue(newValue as number);
    };

    const handleSliderRelease = (
        _: Event | React.SyntheticEvent,
        newValue: number | number[],
    ) => {
        setDragValue(null);
        commitValue(newValue as number);
    };

    const valuetext = (value: number) => `${value}%`;

    return (
        <StyledSliderContainer>
            <SliderContent>
                <StyledSlider
                    min={0}
                    max={100}
                    value={displayedValue}
                    getAriaValueText={valuetext}
                    aria-label={name}
                    step={step}
                    data-testid={ROLLOUT_SLIDER_ID}
                    marks={marks}
                    onChange={handleSliderDrag}
                    onChangeCommitted={handleSliderRelease}
                    disabled={disabled}
                />
            </SliderContent>
            <StyledInputBox>
                <StyledTextField
                    size='large'
                    aria-label={name}
                    type='number'
                    value={inputText}
                    onChange={handleInputChange}
                    onBlur={discardInvalidText}
                    onKeyDown={handleKeyDown}
                    error={Boolean(inputError)}
                    helperText={inputError}
                    disabled={disabled}
                    slotProps={{
                        formHelperText: {
                            sx: {
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                whiteSpace: 'nowrap',
                            },
                        },
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
