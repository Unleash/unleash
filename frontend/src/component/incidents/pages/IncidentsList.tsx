// frontend/src/component/incidents/pages/IncidentsList.tsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { styled } from '@mui/material';
import { usePageTitle } from 'hooks/usePageTitle';
import { mockIncidents } from '../mockData.ts';
import type { Incident, IncidentStatus } from '../types.ts';

type Filter = 'all' | IncidentStatus;

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
    padding: '5px 11px',
    borderRadius: 14,
    background: active ? theme.palette.primary.main : '#fff',
    color: active ? '#fff' : theme.palette.text.primary,
    border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    '& .count': {
        fontSize: 10,
        padding: '1px 5px',
        borderRadius: 8,
        background: active ? 'rgba(255,255,255,0.25)' : theme.palette.background.elevation1,
        color: active ? '#fff' : theme.palette.text.secondary,
        fontWeight: 600,
    },
}));

const SectionHead = styled('div')(({ theme }) => ({
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.palette.text.secondary,
    margin: theme.spacing(1.75, 0, 1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const SectionDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'active' | 'historical' }>(({ status }) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: status === 'active' ? '#b91c1c' : '#9ca3af',
    display: 'inline-block',
}));

const Table = styled('div')(({ theme }) => ({
    background: '#fff',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    overflow: 'hidden',
}));

const Row = styled(Link, {
    shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isHead',
})<{ isActive: boolean; isHead: boolean }>(({ theme, isActive, isHead }) => ({
    display: 'grid',
    gridTemplateColumns: '110px 60px 170px 1fr 60px 120px 90px',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.75),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: 11,
    textDecoration: 'none',
    color: theme.palette.text.primary,
    cursor: isHead ? 'default' : 'pointer',
    background: isHead ? theme.palette.background.elevation1 : isActive ? '#fef2f2' : '#fff',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': isHead ? {} : { background: isActive ? '#fef6f6' : theme.palette.background.elevation1 },
    ...(isHead && {
        fontSize: 10,
        fontWeight: 700,
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
    }),
}));

const StatusChip = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: IncidentStatus }>(({ status }) => {
    const colors: Record<IncidentStatus, { bg: string; fg: string; border?: string }> = {
        active:         { bg: '#b91c1c', fg: '#fff' },
        resolved:       { bg: '#f7f8fa', fg: '#374151', border: '#e1e4e9' },
        dismissed:      { bg: '#f7f8fa', fg: '#6b7280', border: '#e1e4e9' },
        'false-positive': { bg: '#fffbeb', fg: '#92400e', border: '#fde68a' },
    };
    const c = colors[status];
    return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
        background: c.bg,
        color: c.fg,
        border: c.border ? `1px solid ${c.border}` : 'none',
    };
});

const countByStatus = (status: IncidentStatus) => mockIncidents.filter((i) => i.status === status).length;

const renderVerdict = (i: Incident) => {
    if (i.verdict.kind === 'none') return <em style={{ color: '#6b7280' }}>No cause identified</em>;
    if (i.verdict.kind === 'possible') return <span><span style={{ color: '#92400e' }}>Possible:</span> <code style={{ background: '#fef2f2', color: '#991b1b', padding: '1px 5px', borderRadius: 3 }}>{i.verdict.flag}</code></span>;
    return <span>Likely cause: <code style={{ background: '#fef2f2', color: '#991b1b', padding: '1px 5px', borderRadius: 3 }}>{i.verdict.flag}</code></span>;
};

const formatConf = (c: number | undefined) => typeof c === 'number' ? `${c}%` : '—';

export const IncidentsList = () => {
    usePageTitle('Incidents');
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = useMemo(
        () => (filter === 'all' ? mockIncidents : mockIncidents.filter((i) => i.status === filter)),
        [filter],
    );
    const active = filtered.filter((i) => i.status === 'active');
    const historical = filtered.filter((i) => i.status !== 'active');

    const renderRow = (i: Incident, isActive: boolean) => (
        <Row key={i.id} to={`/incidents/${i.id}`} isActive={isActive} isHead={false}>
            <StatusChip status={i.status}>
                {i.status === 'active' ? 'Active' : i.status === 'resolved' ? 'Resolved' : i.status === 'dismissed' ? 'Dismissed' : 'False +'}
            </StatusChip>
            <span style={{ fontFamily: 'ui-monospace, monospace', color: '#6b7280' }}>#{i.id}</span>
            <span style={{ fontWeight: 600 }}>{i.service}</span>
            <span>{renderVerdict(i)}</span>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: i.verdict.tier === 'high' ? '#991b1b' : i.verdict.tier === 'moderate' ? '#92400e' : '#9ca3af' }}>{formatConf(i.verdict.confidence)}</span>
            <span style={{ fontSize: 10, color: '#6b7280' }}>{i.startedAt}{i.durationSeconds ? ` · ${Math.round(i.durationSeconds / 60)}m` : ''}</span>
            <span style={{ fontSize: 10, color: i.assignee ? '#374151' : '#9ca3af', fontStyle: i.assignee ? 'normal' : 'italic' }}>
                {i.assignee ? i.assignee.name : 'unassigned'}
            </span>
        </Row>
    );

    const headerRow = (
        <Row to='#' isActive={false} isHead>
            <span>Status</span><span>ID</span><span>Service</span><span>Verdict</span><span>Conf</span><span>Started</span><span>Assigned</span>
        </Row>
    );

    return (
        <PageContent header={<PageHeader title='Incidents' subtitle='All incidents detected by the SRE First Responder agent.' />}>
            <FilterBar>
                {(['all', 'active', 'resolved', 'dismissed', 'false-positive'] as const).map((f) => (
                    <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                        {f === 'all' ? 'All' : f === 'false-positive' ? 'False positive' : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className='count'>{f === 'all' ? mockIncidents.length : countByStatus(f)}</span>
                    </Chip>
                ))}
            </FilterBar>

            {active.length > 0 && (
                <>
                    <SectionHead><SectionDot status='active' /> Active <span style={{ color: '#9ca3af', fontWeight: 500 }}>{active.length}</span></SectionHead>
                    <Table>
                        {headerRow}
                        {active.map((i) => renderRow(i, true))}
                    </Table>
                </>
            )}
            {historical.length > 0 && (
                <>
                    <SectionHead><SectionDot status='historical' /> Historical <span style={{ color: '#9ca3af', fontWeight: 500 }}>{historical.length}</span></SectionHead>
                    <Table>
                        {headerRow}
                        {historical.map((i) => renderRow(i, false))}
                    </Table>
                </>
            )}
        </PageContent>
    );
};
