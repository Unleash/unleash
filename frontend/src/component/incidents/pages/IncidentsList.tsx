import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { usePageTitle } from 'hooks/usePageTitle';
import { mockIncidents } from '../mockData.ts';
import type { Incident, IncidentStatus } from '../types.ts';

type Filter = 'all' | IncidentStatus;

const STATUS_LABEL: Record<IncidentStatus, string> = {
    active: 'Active',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
    'false-positive': 'False +',
};

const statusBadgeColor = (
    status: IncidentStatus,
): 'error' | 'neutral' | 'disabled' | 'warning' => {
    switch (status) {
        case 'active':
            return 'error';
        case 'false-positive':
            return 'warning';
        case 'dismissed':
            return 'disabled';
        default:
            return 'neutral';
    }
};

const FilterBar = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap',
    alignItems: 'center',
}));

const Chip = styled('button', {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: theme.spacing(0.75, 1.5),
    borderRadius: 14,
    background: active ? theme.palette.primary.main : theme.palette.background.paper,
    color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
    border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
    fontSize: theme.fontSizes.smallBody,
    cursor: 'pointer',
    fontFamily: 'inherit',
    '& .count': {
        fontSize: theme.fontSizes.smallBody,
        padding: '1px 6px',
        borderRadius: 8,
        background: active ? 'rgba(255,255,255,0.25)' : theme.palette.background.elevation1,
        color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
        fontWeight: 600,
    },
}));

const SectionHead = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.palette.text.secondary,
    margin: theme.spacing(2, 0, 1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const SectionDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'active' | 'historical' }>(({ theme, status }) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: status === 'active' ? theme.palette.error.main : theme.palette.text.disabled,
    display: 'inline-block',
}));

const SectionCount = styled('span')(({ theme }) => ({
    color: theme.palette.text.disabled,
    fontWeight: 500,
}));

const Table = styled('div')(({ theme }) => ({
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    overflow: 'hidden',
}));

const Row = styled(Link, {
    shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isHead',
})<{ isActive: boolean; isHead: boolean }>(({ theme, isActive, isHead }) => ({
    display: 'grid',
    gridTemplateColumns: '110px 70px 180px 1fr 70px 130px 100px',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.75),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: theme.fontSizes.smallBody,
    textDecoration: 'none',
    color: theme.palette.text.primary,
    cursor: isHead ? 'default' : 'pointer',
    background: isHead
        ? theme.palette.background.elevation1
        : isActive
        ? theme.palette.error.light
        : theme.palette.background.paper,
    '&:last-child': { borderBottom: 'none' },
    '&:hover': isHead
        ? {}
        : { background: isActive ? theme.palette.error.light : theme.palette.background.elevation1 },
    ...(isHead && {
        fontSize: theme.fontSizes.smallBody,
        fontWeight: 700,
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
    }),
}));

const IdCell = styled('span')(({ theme }) => ({
    fontFamily: 'ui-monospace, monospace',
    color: theme.palette.text.secondary,
}));

const ServiceCell = styled('span')(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

const NoneCause = styled('em')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const PossiblePrefix = styled('span')(({ theme }) => ({
    color: theme.palette.warning.dark,
}));

const FlagCode = styled('code')(({ theme }) => ({
    background: theme.palette.error.light,
    color: theme.palette.error.dark,
    padding: '1px 5px',
    borderRadius: 3,
    fontSize: theme.fontSizes.smallBody,
}));

const ConfCell = styled('span', {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ theme, tier }) => ({
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 700,
    fontSize: theme.fontSizes.smallBody,
    color:
        tier === 'high'
            ? theme.palette.error.dark
            : tier === 'moderate'
            ? theme.palette.warning.dark
            : theme.palette.text.disabled,
}));

const MetaCell = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

const AssigneeCell = styled('span', {
    shouldForwardProp: (prop) => prop !== 'assigned',
})<{ assigned: boolean }>(({ theme, assigned }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: assigned ? theme.palette.text.primary : theme.palette.text.disabled,
    fontStyle: assigned ? 'normal' : 'italic',
}));

const countByStatus = (status: IncidentStatus) =>
    mockIncidents.filter((i) => i.status === status).length;

const renderVerdict = (i: Incident) => {
    if (i.verdict.kind === 'none') return <NoneCause>No cause identified</NoneCause>;
    if (i.verdict.kind === 'possible')
        return (
            <span>
                <PossiblePrefix>Possible:</PossiblePrefix> <FlagCode>{i.verdict.flag}</FlagCode>
            </span>
        );
    return (
        <span>
            Likely cause: <FlagCode>{i.verdict.flag}</FlagCode>
        </span>
    );
};

const formatConf = (c: number | undefined) => (typeof c === 'number' ? `${c}%` : '—');

export const IncidentsList = () => {
    usePageTitle('Incidents');
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = useMemo(
        () =>
            filter === 'all'
                ? mockIncidents
                : mockIncidents.filter((i) => i.status === filter),
        [filter],
    );
    const active = filtered.filter((i) => i.status === 'active');
    const historical = filtered.filter((i) => i.status !== 'active');

    const renderRow = (i: Incident, isActive: boolean) => (
        <Row key={i.id} to={`/incidents/${i.id}`} isActive={isActive} isHead={false}>
            <span>
                <Badge color={statusBadgeColor(i.status)}>{STATUS_LABEL[i.status]}</Badge>
            </span>
            <IdCell>#{i.id}</IdCell>
            <ServiceCell>{i.service}</ServiceCell>
            <span>{renderVerdict(i)}</span>
            <ConfCell tier={i.verdict.tier}>{formatConf(i.verdict.confidence)}</ConfCell>
            <MetaCell>
                {i.startedAt}
                {i.durationSeconds ? ` · ${Math.round(i.durationSeconds / 60)}m` : ''}
            </MetaCell>
            <AssigneeCell assigned={Boolean(i.assignee)}>
                {i.assignee ? i.assignee.name : 'unassigned'}
            </AssigneeCell>
        </Row>
    );

    const headerRow = (
        <Row to='#' isActive={false} isHead>
            <span>Status</span>
            <span>ID</span>
            <span>Service</span>
            <span>Verdict</span>
            <span>Conf</span>
            <span>Started</span>
            <span>Assigned</span>
        </Row>
    );

    return (
        <PageContent
            header={
                <PageHeader
                    title='Incidents'
                    subtitle='All incidents detected by the SRE First Responder agent.'
                />
            }
        >
            <FilterBar>
                {(['all', 'active', 'resolved', 'dismissed', 'false-positive'] as const).map(
                    (f) => (
                        <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                            {f === 'all'
                                ? 'All'
                                : f === 'false-positive'
                                ? 'False positive'
                                : f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className='count'>
                                {f === 'all' ? mockIncidents.length : countByStatus(f)}
                            </span>
                        </Chip>
                    ),
                )}
            </FilterBar>

            {active.length > 0 && (
                <>
                    <SectionHead>
                        <SectionDot status='active' /> Active{' '}
                        <SectionCount>{active.length}</SectionCount>
                    </SectionHead>
                    <Table>
                        {headerRow}
                        {active.map((i) => renderRow(i, true))}
                    </Table>
                </>
            )}
            {historical.length > 0 && (
                <>
                    <SectionHead>
                        <SectionDot status='historical' /> Historical{' '}
                        <SectionCount>{historical.length}</SectionCount>
                    </SectionHead>
                    <Table>
                        {headerRow}
                        {historical.map((i) => renderRow(i, false))}
                    </Table>
                </>
            )}
        </PageContent>
    );
};
