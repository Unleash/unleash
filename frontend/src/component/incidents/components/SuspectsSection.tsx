// frontend/src/component/incidents/components/SuspectsSection.tsx
import { Paper, styled } from '@mui/material';
import { EventRow, type EventRowAccent } from './EventRow.tsx';
import { GroupDot, suspectGroupLabel } from '../styles/eventTokens.ts';
import type { Incident, Suspect, SuspectGroup, EventVerdict } from '../types.ts';

const SuspectsPaper = styled(Paper)(({ theme }) => ({
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
    '& h3': { ...theme.typography.h3, margin: 0 },
    '& .aux': { fontSize: theme.fontSizes.smallerBody, color: theme.palette.text.secondary },
}));

const GroupHead = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.75),
    '& .count': { fontWeight: 500, color: theme.palette.text.disabled },
}));

const GroupWrap = styled('div')(({ theme }) => ({
    '& + &': { marginTop: theme.spacing(1.75) },
}));

const GROUP_ORDER: SuspectGroup[] = ['likely', 'possible', 'couldnt-exclude', 'ruled-out'];

const groupToVerdict = (group: SuspectGroup): EventVerdict =>
    group === 'likely' ? 'likely'
        : group === 'possible' ? 'possible'
        : group === 'couldnt-exclude' ? 'possible'
        : 'ruled-out';

const groupToAccent = (group: SuspectGroup): EventRowAccent =>
    group === 'likely' ? 'likely'
        : group === 'possible' ? 'possible'
        : group === 'couldnt-exclude' ? 'possible'
        : 'ruled';

export interface SuspectsSectionProps {
    incident: Incident;
}

export const SuspectsSection = ({ incident }: SuspectsSectionProps) => {
    if (incident.suspects.length === 0) return null;

    const byGroup = GROUP_ORDER
        .map((group) => ({ group, items: incident.suspects.filter((s: Suspect) => s.group === group) }))
        .filter((g) => g.items.length > 0);

    const auxSummary = byGroup.map((g) => `${g.items.length} ${suspectGroupLabel(g.group).toLowerCase()}`).join(' · ');

    return (
        <SuspectsPaper>
            <SectionHead>
                <h3>Suspects</h3>
                <span className='aux'>{auxSummary}</span>
            </SectionHead>
            {byGroup.map(({ group, items }) => (
                <GroupWrap key={group}>
                    <GroupHead>
                        <GroupDot group={group} />{suspectGroupLabel(group)} <span className='count'>{items.length}</span>
                    </GroupHead>
                    {items.map((s: Suspect) => (
                        <EventRow
                            key={s.id}
                            time={s.time}
                            type={s.type}
                            label={s.title}
                            note={s.reason}
                            verdict={groupToVerdict(group)}
                            accent={groupToAccent(group)}
                        />
                    ))}
                </GroupWrap>
            ))}
        </SuspectsPaper>
    );
};
