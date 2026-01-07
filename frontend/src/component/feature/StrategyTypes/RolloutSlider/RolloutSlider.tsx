import { withStyles } from 'tss-react/mui';
import {
    Slider,
    Typography,
    Box,
    styled,
    TextField,
    InputAdornment,
} from '@mui/material';
import { ROLLOUT_SLIDER_ID } from 'utils/testIds';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
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

const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledSubheader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
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

const SliderWrapper = styled('div')(({ theme }) => ({
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
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

interface IRolloutSliderProps {
    name: string;
    minLabel?: string;
    maxLabel?: string;
    value: number;
    onChange: (e: Event, newValue: number | number[]) => void;
    disabled?: boolean;
}

const RolloutSlider = ({
    name,
    value,
    onChange,
    disabled = false,
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
        <SliderWrapper>
            <StyledBox>
                <Typography id='discrete-slider-always'>{name}</Typography>
                <HelpIcon
                    htmlTooltip
                    tooltip={
                        <Box>
                            <StyledHeader variant='h3'>
                                Rollout percentage
                            </StyledHeader>
                            <Typography variant='body2'>
                                The rollout percentage determines the proportion
                                of users exposed to a feature. It's based on the
                                MurmurHash of a user's unique identifier,
                                normalized to a number between 1 and 100. If the
                                normalized hash is less than or equal to the
                                rollout percentage, the user sees the feature.
                                This ensures a consistent, random distribution
                                of the feature among users.
                            </Typography>

                            <StyledSubheader variant='h3'>
                                Stickiness
                            </StyledSubheader>
                            <Typography variant='body2'>
                                Stickiness refers to the value used for hashing
                                to ensure a consistent user experience. It
                                determines the input for the MurmurHash,
                                ensuring that a user's feature exposure remains
                                consistent across sessions.
                                <br />
                                By default Unleash will use the first value
                                present in the context in the order of{' '}
                                <b>userId, sessionId and random</b>.
                            </Typography>

                            <StyledSubheader variant='h3'>
                                GroupId
                            </StyledSubheader>
                            <Typography variant='body2'>
                                The groupId is used as a seed for the hash
                                function, ensuring consistent feature exposure
                                across different feature flags for a uniform
                                user experience.
                            </Typography>
                        </Box>
                    }
                />
            </StyledBox>
            <StyledSliderContainer>
                <SliderContent>
                    <StyledSlider
                        min={0}
                        max={100}
                        value={value}
                        getAriaValueText={valuetext}
                        aria-labelledby='discrete-slider-always'
                        step={1}
                        data-testid={ROLLOUT_SLIDER_ID}
                        marks={marks}
                        onChange={onChange}
                        valueLabelDisplay='on'
                        disabled={disabled}
                    />
                </SliderContent>
                <StyledInputBox>
                    <StyledTextField
                        size='small'
                        aria-labelledby='discrete-slider-always'
                        type='number'
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        inputProps={{
                            min: 0,
                            max: 100,
                            step: 1,
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    %
                                </InputAdornment>
                            ),
                        }}
                    />
                </StyledInputBox>
            </StyledSliderContainer>
        </SliderWrapper>
    );
};

export default RolloutSlider;
