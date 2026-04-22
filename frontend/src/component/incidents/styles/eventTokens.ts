// frontend/src/component/incidents/styles/eventTokens.ts
import { styled } from '@mui/material';
import type { EventType, EventVerdict, SuspectGroup } from '../types.ts';

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; letter: string }> = {
    deploy:    { bg: '#1e40af', letter: 'D' },
    flag:      { bg: '#b91c1c', letter: 'F' },
    'flag-warn': { bg: '#f59e0b', letter: 'F' },
    metric:    { bg: '#6b7280', letter: 'M' },
    alert:     { bg: '#f59e0b', letter: '!' },
    agent:     { bg: '#5b21b6', letter: 'A' },
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
    fontSize: size === 'sm' ? 9 : 10,
    fontWeight: 700,
    fontFamily: 'ui-monospace, SF Mono, Consolas, monospace',
    flexShrink: 0,
    lineHeight: 1,
}));

/** Verdict pill used on every event row. */
export const VerdictPill = styled('span', {
    shouldForwardProp: (prop) => prop !== 'verdict',
})<{ verdict: EventVerdict }>(({ verdict }) => {
    const styles: Record<EventVerdict, { background: string; color: string; border?: string }> = {
        likely:    { background: '#b91c1c', color: '#fff' },
        possible:  { background: '#f59e0b', color: '#fff' },
        'ruled-out': { background: '#e5e7eb', color: '#6b7280' },
        effect:    { background: '#f3f4f6', color: '#6b7280' },
        alert:     { background: '#f3f4f6', color: '#6b7280' },
        agent:     { background: '#f3f4f6', color: '#6b7280' },
    };
    const s = styles[verdict];
    return {
        padding: '2px 7px',
        borderRadius: 10,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
        background: s.background,
        color: s.color,
    };
});

export const verdictLabel = (verdict: EventVerdict): string => ({
    likely: 'Likely cause',
    possible: 'Possible',
    'ruled-out': 'Ruled out',
    effect: 'Effect',
    alert: 'Alert',
    agent: 'Agent',
} as const)[verdict];

/** Color swatch used in suspects group headers. */
export const GroupDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'group',
})<{ group: SuspectGroup }>(({ group }) => {
    const colors: Record<SuspectGroup, string> = {
        likely: '#b91c1c',
        possible: '#f59e0b',
        'couldnt-exclude': '#f59e0b',
        'ruled-out': '#9ca3af',
    };
    return {
        width: 7,
        height: 7,
        borderRadius: '50%',
        display: 'inline-block',
        background: colors[group],
    };
});

export const suspectGroupLabel = (group: SuspectGroup): string => ({
    likely: 'Likely cause',
    possible: 'Possible cause',
    'couldnt-exclude': "Couldn't exclude",
    'ruled-out': 'Ruled out',
} as const)[group];
