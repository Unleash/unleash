// frontend/src/component/incidents/components/EventRow.tsx
import { styled } from '@mui/material';
import { EventIconCircle, VerdictPill, verdictLabel } from '../styles/eventTokens.ts';
import type { EventType, EventVerdict } from '../types.ts';
import { getEventIconProps } from '../styles/eventTokens.ts';

export type EventRowAccent = 'none' | 'likely' | 'possible' | 'ruled';

const Row = styled('div', {
    shouldForwardProp: (prop) => prop !== 'accent',
})<{ accent: EventRowAccent }>(({ theme, accent }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr auto',
    alignItems: 'center',
    columnGap: theme.spacing(1.25),
    padding: theme.spacing(1, 1.25),
    borderRadius: 6,
    background: '#fff',
    border: `1px solid ${theme.palette.divider}`,
    fontSize: 11,
    ...(accent === 'likely' && {
        borderLeft: '3px solid #b91c1c',
        background: '#fef2f2',
    }),
    ...(accent === 'possible' && {
        borderLeft: '3px solid #f59e0b',
        background: '#fffbeb',
    }),
    ...(accent === 'ruled' && {
        background: '#fafbfc',
    }),
    '& + &': { marginTop: 5 },
}));

const Time = styled('span')(({ theme }) => ({
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: 11,
    minWidth: 38,
}));

const Label = styled('div', {
    shouldForwardProp: (prop) => prop !== 'strikethrough',
})<{ strikethrough: boolean }>(({ theme, strikethrough }) => ({
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
    '& .main': {
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
        fontSize: 10,
        color: theme.palette.text.secondary,
        marginTop: 1,
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
            <VerdictPill verdict={verdict}>{verdictLabel(verdict)}</VerdictPill>
        </Row>
    );
};
