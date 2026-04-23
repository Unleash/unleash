import { Button, Paper, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import type { Incident } from '../types.ts';

const HeroPaper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ theme, tier }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderLeft: `4px solid ${
        tier === 'high'
            ? theme.palette.error.main
            : tier === 'moderate'
            ? theme.palette.warning.main
            : theme.palette.text.disabled
    }`,
    padding: theme.spacing(2, 2.5),
}));

const Chips = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(1.25),
    flexWrap: 'wrap',
}));

const Verdict = styled('div', {
    shouldForwardProp: (prop) => prop !== 'kind',
})<{ kind: 'declarative' | 'hedged' }>(({ theme, kind }) => ({
    fontSize: kind === 'declarative' ? theme.typography.h2.fontSize : theme.typography.h3.fontSize,
    fontWeight: kind === 'declarative' ? 700 : 600,
    color: theme.palette.text.primary,
    letterSpacing: '-0.3px',
    lineHeight: 1.3,
    marginBottom: theme.spacing(0.5),
    '& em': { color: theme.palette.warning.dark, fontStyle: 'normal', fontWeight: 700 },
}));

const FlagChip = styled('span')(({ theme }) => ({
    display: 'inline-block',
    background: theme.palette.error.light,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.border}`,
    padding: '1px 10px',
    borderRadius: theme.shape.borderRadiusMedium,
    fontFamily: 'ui-monospace, monospace',
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 600,
}));

const SubLine = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.5,
}));

const ConfidenceBox = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ theme, tier }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.75),
    borderRadius: theme.shape.borderRadiusMedium,
    background: tier === 'moderate'
        ? theme.palette.warning.light
        : theme.palette.background.elevation1,
    border: tier === 'moderate' ? `1px dashed ${theme.palette.warning.border}` : 'none',
}));

const ConfPct = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier',
})<{ tier: 'high' | 'moderate' | 'low' }>(({ theme, tier }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 700,
    color:
        tier === 'high'
            ? theme.palette.error.dark
            : tier === 'moderate'
            ? theme.palette.warning.dark
            : theme.palette.text.secondary,
    lineHeight: 1,
}));

const ConfLabelStack = styled('div')(() => ({ flex: 1 }));
const ConfLabelTitle = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));
const ConfLabelSub = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));
const ConfMeter = styled('div')(({ theme }) => ({
    height: 6,
    background: theme.palette.background.elevation2,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: theme.spacing(0.5),
}));
const ConfMeterFill = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tier' && prop !== 'pct',
})<{ tier: 'high' | 'moderate' | 'low'; pct: number }>(({ theme, tier, pct }) => ({
    height: '100%',
    width: `${pct}%`,
    background:
        tier === 'high'
            ? `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`
            : `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
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
                <Badge color='error'>Active</Badge>
                <Badge>{incident.service}</Badge>
                {warningChip ? <Badge color='warning'>{warningChip}</Badge> : null}
                <Badge>alert fired · started {incident.startedAt}</Badge>
            </Chips>

            <Verdict kind={verdict.kind === 'likely' ? 'declarative' : 'hedged'}>
                {renderVerdict()}
            </Verdict>
            <SubLine>{verdict.subheadline}</SubLine>

            {typeof verdict.confidence === 'number' ? (
                <ConfidenceBox tier={tier}>
                    <ConfPct tier={tier}>{verdict.confidence}%</ConfPct>
                    <ConfLabelStack>
                        <ConfLabelTitle>{confidenceLabel}</ConfLabelTitle>
                        <ConfLabelSub>{confidenceReason}</ConfLabelSub>
                        <ConfMeter>
                            <ConfMeterFill tier={tier} pct={verdict.confidence} />
                        </ConfMeter>
                    </ConfLabelStack>
                </ConfidenceBox>
            ) : null}

            <Actions>
                <ActionsLeft>
                    {actions.map((action) => {
                        const isDestructive = action.variant === 'primary-destructive';
                        const isSoft = action.variant === 'primary-soft';
                        return (
                            <Button
                                key={action.id}
                                variant={action.variant === 'secondary' ? 'outlined' : 'contained'}
                                color={isDestructive ? 'error' : isSoft ? 'primary' : 'inherit'}
                                size='small'
                                onClick={() => onAction(action.id)}
                                sx={
                                    isDestructive || isSoft
                                        ? { color: 'common.white', '&:hover': { color: 'common.white' } }
                                        : undefined
                                }
                            >
                                {action.label}
                            </Button>
                        );
                    })}
                </ActionsLeft>
                <Button size='small' variant='outlined' onClick={onFeedback}>
                    <span role='img' aria-label='thumbs down' style={{ fontSize: 14, marginRight: 5 }}>👎</span> I disagree
                </Button>
            </Actions>
        </HeroPaper>
    );
};
