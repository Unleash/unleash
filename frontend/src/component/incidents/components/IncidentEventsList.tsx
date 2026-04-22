import { Paper, styled } from '@mui/material';
import { EventRow } from './EventRow.tsx';
import type { Incident } from '../types.ts';

const EventsPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 2.5),
    marginTop: theme.spacing(1.75),
}));

const SectionHead = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.25),
    '& h3': { fontSize: 14, fontWeight: 600, margin: 0 },
    '& .aux': { fontSize: 11, color: theme.palette.text.secondary },
}));

export interface IncidentEventsListProps {
    incident: Incident;
}

export const IncidentEventsList = ({ incident }: IncidentEventsListProps) => (
    <EventsPaper>
        <SectionHead>
            <h3>Events</h3>
            <span className='aux'>13:50 — 14:30 · {incident.events.length} events</span>
        </SectionHead>
        {incident.events.map((e) => {
            const accent =
                e.verdict === 'likely' ? 'likely'
                : e.verdict === 'possible' ? 'possible'
                : e.verdict === 'ruled-out' ? 'ruled'
                : 'none';
            return (
                <EventRow
                    key={e.id}
                    time={e.time}
                    type={e.type}
                    label={e.label}
                    verdict={e.verdict}
                    accent={accent}
                />
            );
        })}
    </EventsPaper>
);
