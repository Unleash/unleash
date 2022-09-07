import { makeStyles, withStyles } from 'tss-react/mui';
import { Slider, Typography } from '@mui/material';
import { ROLLOUT_SLIDER_ID } from 'utils/testIds';
import React from 'react';

const StyledSlider = withStyles(Slider, theme => ({
    root: {
        height: 8,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
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

const useStyles = makeStyles()(theme => ({
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
            <Typography
                id="discrete-slider-always"
                variant="h3"
                gutterBottom
                component="h3"
            >
                {name}
            </Typography>
            <StyledSlider
                min={0}
                max={100}
                value={value}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-always"
                step={1}
                data-testid={ROLLOUT_SLIDER_ID}
                marks={marks}
                onChange={onChange}
                valueLabelDisplay="on"
                disabled={disabled}
            />
        </div>
    );
};

export default RolloutSlider;
