// frontend/src/component/incidents/components/CohortChart.tsx
import { useState } from 'react';
import { styled } from '@mui/material';
import type { CohortData, IncidentEvent } from '../types.ts';
import { EventPin } from './EventPin.tsx';
import { EventIconCircle, getEventIconProps } from '../styles/eventTokens.ts';

const Wrap = styled('div')(() => ({ position: 'relative' }));

const Toggle = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    background: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 6,
    padding: 2,
    marginBottom: theme.spacing(1),
    fontSize: 10,
}));

const ToggleBtn = styled('button', {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    padding: '3px 9px',
    border: 'none',
    background: active ? '#fff' : 'transparent',
    color: active ? theme.palette.text.primary : theme.palette.text.secondary,
    fontSize: 10,
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    borderRadius: 4,
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    '& .count': {
        fontSize: 9,
        color: active ? theme.palette.text.secondary : theme.palette.text.disabled,
        fontWeight: 500,
    },
}));

const ChartWrap = styled('div')(() => ({ position: 'relative' }));

const ChartBox = styled('div')(({ theme }) => ({
    position: 'relative',
    height: 180,
    background: theme.palette.background.elevation1,
    borderRadius: 10,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
}));

const Legend = styled('div')(() => ({
    position: 'absolute',
    top: 8,
    right: 10,
    display: 'flex',
    gap: 10,
    fontSize: 10,
    background: 'rgba(255,255,255,0.92)',
    padding: '4px 8px',
    borderRadius: 5,
}));

const LegendDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'exposed' | 'control' | 'baseline' }>(({ variant }) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
    background: variant === 'exposed' ? '#b91c1c' : variant === 'control' ? '#16a34a' : '#c4c9d1',
    marginRight: 5,
}));

const FlagMarker = styled('div', {
    shouldForwardProp: (prop) => prop !== 'offset' && prop !== 'hedged',
})<{ offset: number; hedged: boolean }>(({ offset, hedged }) => ({
    position: 'absolute',
    top: 0,
    bottom: 18,
    left: `${offset}%`,
    width: 2,
    background: hedged ? '#f59e0b' : '#b91c1c',
}));

const XAxis = styled('div')(({ theme }) => ({
    position: 'absolute',
    bottom: 4,
    left: 10,
    right: 10,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: theme.palette.text.secondary,
}));

const EventsOverlay = styled('div', {
    shouldForwardProp: (prop) => prop !== 'view',
})<{ view: 'suspects' | 'all' }>(({ view }) => ({
    position: 'absolute',
    top: 0,
    bottom: 18,
    left: 0,
    right: 0,
    pointerEvents: 'none',
    ...(view === 'suspects' && {
        '& [data-suspect="false"]': { display: 'none' },
    }),
}));

const LegendRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: theme.spacing(1),
    padding: '6px 10px',
    background: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 6,
    fontSize: 9,
    color: theme.palette.text.secondary,
    '& .lg-item': { display: 'flex', alignItems: 'center', gap: 4 },
}));

export interface CohortChartProps {
    cohort: CohortData;
    events: IncidentEvent[];
}

export const CohortChart = ({ cohort, events }: CohortChartProps) => {
    const [view, setView] = useState<'suspects' | 'all'>('suspects');
    const suspectCount = events.filter((e) => e.isSuspect).length;

    const eventSourceLabel = (e: IncidentEvent): string => {
        if (e.type === 'deploy') return 'deploy' + (e.verdict === 'ruled-out' ? ' · ruled out' : '');
        if (e.type === 'flag') return 'flag · likely cause';
        if (e.type === 'flag-warn') return 'flag · possible cause';
        if (e.type === 'metric') return 'metrics';
        if (e.type === 'alert') return 'alert';
        return 'agent';
    };

    return (
        <Wrap>
            <Toggle>
                <ToggleBtn active={view === 'suspects'} onClick={() => setView('suspects')}>
                    Suspected events <span className='count'>{suspectCount}</span>
                </ToggleBtn>
                <ToggleBtn active={view === 'all'} onClick={() => setView('all')}>
                    All events <span className='count'>{events.length}</span>
                </ToggleBtn>
            </Toggle>

            <ChartWrap>
                <ChartBox>
                    <Legend>
                        {cohort.mode === 'live-control' ? (
                            <>
                                <span><LegendDot variant='exposed' />exposed {cohort.errorRate}</span>
                                <span><LegendDot variant='control' />{cohort.comparisonLabel}</span>
                            </>
                        ) : (
                            <>
                                <span><LegendDot variant='exposed' />current</span>
                                <span><LegendDot variant='baseline' />{cohort.comparisonLabel}</span>
                            </>
                        )}
                    </Legend>
                    <FlagMarker offset={cohort.flagChangeOffset} hedged={cohort.mode === 'baseline'} />
                    <svg
                        viewBox='0 0 300 180'
                        preserveAspectRatio='none'
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                    >
                        {cohort.baselineBandPath ? (
                            <path d={cohort.baselineBandPath} fill='#c4c9d1' opacity='0.3' />
                        ) : null}
                        <path
                            d={cohort.comparisonPath}
                            stroke={cohort.mode === 'live-control' ? '#16a34a' : '#94a3b8'}
                            strokeWidth='1.6'
                            fill='none'
                            strokeDasharray={cohort.mode === 'baseline' ? '3,3' : undefined}
                        />
                        <path d={cohort.exposedPath} stroke='#b91c1c' strokeWidth='2.2' fill='none' />
                    </svg>
                    <XAxis><span>13:50</span><span>14:00</span><span>14:10</span><span>14:20</span><span>14:30</span></XAxis>
                </ChartBox>

                <EventsOverlay view={view}>
                    {events.map((e) => (
                        <div key={e.id} data-suspect={e.isSuspect}>
                            <EventPin
                                offset={e.chartOffset}
                                type={e.type}
                                verdict={e.verdict}
                                time={e.time}
                                sourceLabel={eventSourceLabel(e)}
                                description={e.label}
                            />
                        </div>
                    ))}
                </EventsOverlay>
            </ChartWrap>

            <LegendRow>
                {(['deploy', 'flag', 'metric', 'alert', 'agent'] as const).map((t) => (
                    <span className='lg-item' key={t}>
                        <EventIconCircle type={t} size='sm'>{getEventIconProps(t).letter}</EventIconCircle>
                        {t === 'flag' ? 'flag change' : t === 'metric' ? 'metric' : t === 'alert' ? 'alert' : t === 'agent' ? 'agent activity' : 'deploy'}
                    </span>
                ))}
            </LegendRow>
        </Wrap>
    );
};
