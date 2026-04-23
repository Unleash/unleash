import { styled } from '@mui/material';
import type { EventType, EventVerdict, SuspectGroup } from '../types.ts';

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; letter: string }> = {
    deploy: { bg: '#1e40af', letter: 'D' },
    flag: { bg: '#b91c1c', letter: 'F' },
    'flag-warn': { bg: '#f59e0b', letter: 'F' },
    metric: { bg: '#6b7280', letter: 'M' },
    alert: { bg: '#f59e0b', letter: '!' },
    agent: { bg: '#5b21b6', letter: 'A' },
};

export const getEventIconProps = (type: EventType) => EVENT_TYPE_COLORS[type];

/** Circle with a letter — used in chart pins, suspects, events list. */
export const EventIconCircle = styled('span', {
    shouldForwardProp: (prop) => prop !== 'size' && prop !== 'type',
})<{ size?: 'sm' | 'md'; type: EventType }>(({ size = 'md', type }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size === 'sm' ? 16 : 20,
    height: size === 'sm' ? 16 : 20,
    borderRadius: '50%',
    background: EVENT_TYPE_COLORS[type].bg,
    color: '#fff',
    fontSize: size === 'sm' ? 10 : 11,
    fontWeight: 700,
    fontFamily: 'ui-monospace, SF Mono, Consolas, monospace',
    flexShrink: 0,
    lineHeight: 1,
}));

export const verdictLabel = (verdict: EventVerdict): string =>
    (
        {
            likely: 'Likely cause',
            possible: 'Possible',
            'ruled-out': 'Ruled out',
            effect: 'Effect',
            alert: 'Alert',
            agent: 'Agent',
        } as const
    )[verdict];

/** Maps verdict → Unleash Badge color palette. */
export const verdictBadgeColor = (
    verdict: EventVerdict,
): 'error' | 'warning' | 'disabled' | 'neutral' => {
    switch (verdict) {
        case 'likely':
            return 'error';
        case 'possible':
            return 'warning';
        case 'ruled-out':
            return 'disabled';
        default:
            return 'neutral';
    }
};

/** Color swatch used in suspects group headers. */
export const GroupDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'group',
})<{ group: SuspectGroup }>(({ theme, group }) => {
    const colors: Record<SuspectGroup, string> = {
        likely: theme.palette.error.main,
        possible: theme.palette.warning.main,
        'couldnt-exclude': theme.palette.warning.main,
        'ruled-out': theme.palette.text.disabled,
    };
    return {
        width: 8,
        height: 8,
        borderRadius: '50%',
        display: 'inline-block',
        background: colors[group],
    };
});

export const suspectGroupLabel = (group: SuspectGroup): string =>
    (
        {
            likely: 'Likely cause',
            possible: 'Possible cause',
            'couldnt-exclude': "Couldn't exclude",
            'ruled-out': 'Ruled out',
        } as const
    )[group];
