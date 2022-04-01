import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Slider, Typography } from '@material-ui/core';
import { ROLLOUT_SLIDER_ID } from 'utils/testIds';
import React from 'react';

const StyledSlider = withStyles({
    root: {
        height: 8,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -8,
        marginLeft: -12,
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 4px)',
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        borderRadius: 4,
    },
})(Slider);

const useStyles = makeStyles(theme => ({
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
    onChange: (e: React.ChangeEvent<{}>, newValue: number | number[]) => void;
    disabled?: boolean;
}

const RolloutSlider = ({
    name,
    value,
    onChange,
    disabled = false,
}: IRolloutSliderProps) => {
    const classes = useStyles();

    const valuetext = (value: number) => `${value}%`;

    return (
        <div className={classes.slider}>
            <Typography
                id="discrete-slider-always"
                variant="subtitle2"
                gutterBottom
            >
                {name}
            </Typography>
            <br />
            <StyledSlider
                min={0}
                max={100}
                value={value}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-always"
                step={1}
                data-test={ROLLOUT_SLIDER_ID}
                marks={marks}
                onChange={onChange}
                valueLabelDisplay="on"
                disabled={disabled}
            />
        </div>
    );
};

export default RolloutSlider;
