import { styled } from '@mui/material';
import { EventIconCircle, getEventIconProps } from '../styles/eventTokens.ts';
import type { EventType, EventVerdict } from '../types.ts';

const PinWrap = styled('div', {
    shouldForwardProp: (prop) => prop !== 'offset' && prop !== 'halo',
})<{ offset: number; halo: 'likely' | 'possible' | 'none' }>(({ offset, halo }) => ({
    position: 'absolute',
    top: 4,
    left: `${offset}%`,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 5,
    cursor: 'pointer',
    pointerEvents: 'auto',
    '& .event-icon': {
        border: '2px solid #fff',
        boxShadow: halo === 'likely'
            ? '0 0 0 3px rgba(185, 28, 28, 0.22), 0 1px 3px rgba(0,0,0,0.2)'
            : halo === 'possible'
            ? '0 0 0 3px rgba(245, 158, 11, 0.25), 0 1px 3px rgba(0,0,0,0.2)'
            : '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
    },
    '&:hover .event-icon': {
        transform: 'scale(1.2)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    },
    '&:hover .pin-tooltip': { opacity: 1 },
}));

const PinTime = styled('span')(({ theme }) => ({
    fontFamily: 'ui-monospace, monospace',
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    marginTop: 2,
    background: 'rgba(255,255,255,0.9)',
    padding: '0 4px',
    borderRadius: 3,
    lineHeight: 1.2,
}));

const Tooltip = styled('div')(({ theme }) => ({
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: theme.palette.text.primary,
    color: theme.palette.common.white,
    padding: theme.spacing(0.75, 1.25),
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.fontSizes.smallBody,
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease',
    zIndex: 20,
    lineHeight: 1.4,
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        border: '4px solid transparent',
        borderTopColor: theme.palette.text.primary,
    },
    '& .tip-head': { fontWeight: 700 },
    '& .tip-src': {
        color: theme.palette.text.disabled,
        fontSize: theme.fontSizes.smallBody,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        marginLeft: 5,
    },
}));

export interface EventPinProps {
    offset: number;
    type: EventType;
    verdict: EventVerdict;
    time: string;
    sourceLabel: string; // e.g. "deploy · ruled out"
    description: string;
}

export const EventPin = ({ offset, type, verdict, time, sourceLabel, description }: EventPinProps) => {
    const halo: 'likely' | 'possible' | 'none' =
        verdict === 'likely' ? 'likely' : verdict === 'possible' ? 'possible' : 'none';
    const iconProps = getEventIconProps(type);
    return (
        <PinWrap offset={offset} halo={halo}>
            <EventIconCircle type={type} className='event-icon'>{iconProps.letter}</EventIconCircle>
            <PinTime>{time}</PinTime>
            <Tooltip className='pin-tooltip'>
                <span className='tip-head'>{time}</span>
                <span className='tip-src'>{sourceLabel}</span>
                <br />
                {description}
            </Tooltip>
        </PinWrap>
    );
};
