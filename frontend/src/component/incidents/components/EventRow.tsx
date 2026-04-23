import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import {
    EventIconCircle,
    getEventIconProps,
    verdictBadgeColor,
    verdictLabel,
} from '../styles/eventTokens.ts';
import type { EventType, EventVerdict } from '../types.ts';

export type EventRowAccent = 'none' | 'likely' | 'possible' | 'ruled';

const Row = styled('div', {
    shouldForwardProp: (prop) => prop !== 'accent',
})<{ accent: EventRowAccent }>(({ theme, accent }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr auto',
    alignItems: 'center',
    columnGap: theme.spacing(1.25),
    padding: theme.spacing(1, 1.25),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    fontSize: theme.fontSizes.smallBody,
    ...(accent === 'likely' && {
        borderLeft: `3px solid ${theme.palette.error.main}`,
        background: theme.palette.error.light,
    }),
    ...(accent === 'possible' && {
        borderLeft: `3px solid ${theme.palette.warning.main}`,
        background: theme.palette.warning.light,
    }),
    ...(accent === 'ruled' && {
        background: theme.palette.background.elevation1,
    }),
    '& + &': { marginTop: theme.spacing(0.75) },
}));

const Time = styled('span')(({ theme }) => ({
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    minWidth: 44,
}));

const Label = styled('div', {
    shouldForwardProp: (prop) => prop !== 'strikethrough',
})<{ strikethrough: boolean }>(({ theme, strikethrough }) => ({
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
    '& .main': {
        fontSize: theme.fontSizes.smallBody,
        fontWeight: 500,
        color: theme.palette.text.primary,
        ...(strikethrough && {
            textDecoration: 'line-through',
            textDecorationColor: theme.palette.text.disabled,
            color: theme.palette.text.disabled,
        }),
    },
    '& .note': {
        display: 'block',
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.text.secondary,
        marginTop: 2,
    },
}));

export interface EventRowProps {
    time: string;
    type: EventType;
    label: string;
    note?: string;
    verdict: EventVerdict;
    accent?: EventRowAccent;
}

export const EventRow = ({
    time,
    type,
    label,
    note,
    verdict,
    accent = 'none',
}: EventRowProps) => {
    const iconProps = getEventIconProps(type);
    return (
        <Row accent={accent}>
            <Time>{time}</Time>
            <EventIconCircle type={type}>{iconProps.letter}</EventIconCircle>
            <Label strikethrough={accent === 'ruled'}>
                <span className='main'>{label}</span>
                {note ? <span className='note'>{note}</span> : null}
            </Label>
            <Badge color={verdictBadgeColor(verdict)}>{verdictLabel(verdict)}</Badge>
        </Row>
    );
};
