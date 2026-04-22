// frontend/src/component/incidents/components/IncidentHero.tsx
import { Button, Paper, styled } from '@mui/material';
import type { Incident } from '../types.ts';

const HeroPaper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ theme, tier }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderLeft: `4px solid ${
        tier === 'high' ? '#b91c1c' : tier === 'moderate' ? '#f59e0b' : theme.palette.text.disabled
    }`,
    padding: theme.spacing(2, 2.5),
}));

const Chips = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(1.25),
    flexWrap: 'wrap',
}));

const Chip = styled('span', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'active' | 'warn' | 'default' }>(({ theme, variant }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 500,
    background: variant === 'active' ? '#fef2f2' : variant === 'warn' ? '#fffbeb' : theme.palette.background.elevation1,
    color: variant === 'active' ? '#991b1b' : variant === 'warn' ? '#92400e' : theme.palette.text.secondary,
    border: `1px solid ${variant === 'active' ? '#fca5a5' : variant === 'warn' ? '#fde68a' : theme.palette.divider}`,
    ...(variant === 'active' && { fontWeight: 600 }),
    ...(variant === 'active' && {
        '&::before': {
            content: '""',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#b91c1c',
            boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.2)',
            animation: 'incident-pulse 2s infinite',
        },
    }),
    '@keyframes incident-pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
    },
}));

const Verdict = styled('div', {
    shouldForwardProp: (prop) => prop !== 'kind',
})<{ kind: 'declarative' | 'hedged' }>(({ theme, kind }) => ({
    fontSize: kind === 'declarative' ? 20 : 19,
    fontWeight: kind === 'declarative' ? 700 : 600,
    color: theme.palette.text.primary,
    letterSpacing: '-0.3px',
    lineHeight: 1.25,
    marginBottom: 4,
    '& em': { color: '#92400e', fontStyle: 'normal', fontWeight: 700 },
}));

const FlagChip = styled('span')(() => ({
    display: 'inline-block',
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    padding: '1px 10px',
    borderRadius: 6,
    fontFamily: 'ui-monospace, monospace',
    fontSize: 16,
    fontWeight: 600,
}));

const SubLine = styled('div')(({ theme }) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
}));

const ConfidenceBox = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ theme, tier }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.75),
    borderRadius: 10,
    background: tier === 'moderate' ? '#fffbeb' : theme.palette.background.elevation1,
    border: tier === 'moderate' ? '1px dashed #f59e0b' : 'none',
}));

const ConfPct = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ tier }) => ({
    fontSize: tier === 'high' ? 22 : 20,
    fontWeight: 700,
    color: tier === 'high' ? '#991b1b' : tier === 'moderate' ? '#92400e' : '#6b7280',
    lineHeight: 1,
}));

const ConfLabelStack = styled('div')(() => ({ flex: 1 }));
const ConfMeter = styled('div')(() => ({
    height: 6,
    background: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
}));
const ConfMeterFill = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier' && prop !== 'pct',
})<{ tier: 'high' | 'moderate' | 'low'; pct: number }>(({ tier, pct }) => ({
    height: '100%',
    width: `${pct}%`,
    background: tier === 'high'
        ? 'linear-gradient(90deg, #f59e0b 0%, #b91c1c 100%)'
        : 'linear-gradient(90deg, #f59e0b 0%, #b45309 100%)',
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1.25),
    marginTop: theme.spacing(1.5),
    paddingTop: theme.spacing(1.25),
    borderTop: `1px solid ${theme.palette.divider}`,
    flexWrap: 'wrap',
}));

const ActionsLeft = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.75),
    flexWrap: 'wrap',
}));

export interface IncidentHeroProps {
    incident: Incident;
    onAction: (id: string) => void;
    onFeedback: () => void;
}

export const IncidentHero = ({ incident, onAction, onFeedback }: IncidentHeroProps) => {
    const { verdict, warningChip, confidenceLabel, confidenceReason, actions } = incident;
    const { tier } = verdict;

    const renderVerdict = () => {
        if (verdict.kind === 'likely' && verdict.flag) {
            return <>Likely cause: <FlagChip>{verdict.flag}</FlagChip></>;
        }
        if (verdict.kind === 'possible' && verdict.flag) {
            return <><em>Possibly</em> caused by <FlagChip>{verdict.flag}</FlagChip> — worth investigating, not yet conclusive</>;
        }
        return verdict.headline;
    };

    return (
        <HeroPaper tier={tier}>
            <Chips>
                <Chip variant='active'>Active</Chip>
                <Chip>{incident.service}</Chip>
                {warningChip ? <Chip variant='warn'>{warningChip}</Chip> : null}
                <Chip>alert fired · started {incident.startedAt}</Chip>
            </Chips>

            <Verdict kind={verdict.kind === 'likely' ? 'declarative' : 'hedged'}>
                {renderVerdict()}
            </Verdict>
            <SubLine>{verdict.subheadline}</SubLine>

            {typeof verdict.confidence === 'number' ? (
                <ConfidenceBox tier={tier}>
                    <ConfPct tier={tier}>{verdict.confidence}%</ConfPct>
                    <ConfLabelStack>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{confidenceLabel}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{confidenceReason}</div>
                        <ConfMeter>
                            <ConfMeterFill tier={tier} pct={verdict.confidence} />
                        </ConfMeter>
                    </ConfLabelStack>
                </ConfidenceBox>
            ) : null}

            <Actions>
                <ActionsLeft>
                    {actions.map((action) => (
                        <Button
                            key={action.id}
                            variant={action.variant === 'secondary' ? 'outlined' : 'contained'}
                            color={
                                action.variant === 'primary-destructive'
                                    ? 'error'
                                    : action.variant === 'primary-soft'
                                    ? 'primary'
                                    : 'inherit'
                            }
                            size='small'
                            onClick={() => onAction(action.id)}
                        >
                            {action.label}
                        </Button>
                    ))}
                </ActionsLeft>
                <Button size='small' variant='outlined' onClick={onFeedback} sx={{ fontSize: 10 }}>
                    <span role='img' aria-label='thumbs down' style={{ fontSize: 12, marginRight: 5 }}>👎</span> I disagree
                </Button>
            </Actions>
        </HeroPaper>
    );
};
