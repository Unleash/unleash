import { Paper, styled } from '@mui/material';
import type { Incident } from '../types.ts';

const SourcesPaper = styled(Paper)(({ theme }) => ({
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

const Grid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(1.25),
}));

const LinkCard = styled('a')(({ theme }) => ({
    padding: theme.spacing(1.25, 1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: theme.palette.background.paper,
    textDecoration: 'none',
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    '&:hover': {
        borderColor: theme.palette.primary.main,
        background: theme.palette.secondary.light,
    },
    '& .lbl': {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        fontWeight: 600,
    },
    '& .nm': { fontWeight: 500, color: theme.palette.primary.main },
}));

const KIND_LABEL: Record<Incident['sources'][number]['kind'], string> = {
    metrics: 'Metrics',
    errors: 'Errors',
    flag: 'Flag',
    deploy: 'Deploy',
};

export interface IncidentSourcesProps {
    incident: Incident;
}

export const IncidentSources = ({ incident }: IncidentSourcesProps) => (
    <SourcesPaper>
        <SectionHead>
            <h3>Sources</h3>
            <span className='aux'>verify in the originals</span>
        </SectionHead>
        <Grid>
            {incident.sources.map((s) => (
                <LinkCard key={s.kind} href={s.href}>
                    <span className='lbl'>{KIND_LABEL[s.kind]}</span>
                    <span className='nm'>{s.label} ↗</span>
                </LinkCard>
            ))}
        </Grid>
    </SourcesPaper>
);
