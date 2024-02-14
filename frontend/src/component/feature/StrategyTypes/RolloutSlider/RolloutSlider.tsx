import { makeStyles, withStyles } from 'tss-react/mui';
import { Slider, Typography, Box, styled } from '@mui/material';
import { ROLLOUT_SLIDER_ID } from 'utils/testIds';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

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
    marginBottom: theme.spacing(1),
}));

const useStyles = makeStyles()((theme) => ({
    slider: {
        width: '100%',
        maxWidth: '100%',
    },
    margin: {
        height: theme.spacing(3),
    },
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
    const { classes } = useStyles();

    const valuetext = (value: number) => `${value}%`;

    return (
        <div className={classes.slider}>
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
                                across different feature toggles for a uniform
                                user experience.
                            </Typography>
                        </Box>
                    }
                />
            </StyledBox>
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
        </div>
    );
};

export default RolloutSlider;
