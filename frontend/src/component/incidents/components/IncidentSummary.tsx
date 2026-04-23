import { Paper, styled, Button } from '@mui/material';
import type { ChangeMyMindCard, Incident } from '../types.ts';

const SummaryPaper = styled(Paper)(({ theme }) => ({
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
    marginBottom: theme.spacing(1),
    '& h3': {
        ...theme.typography.h3,
        margin: 0,
        color: theme.palette.text.primary,
    },
}));

const SummaryText = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    lineHeight: 1.55,
    '& strong': { color: theme.palette.text.primary },
}));

const IfWrong = styled('div', {
    shouldForwardProp: (prop) => prop !== 'prominent',
})<{ prominent: boolean }>(({ theme, prominent }) => ({
    padding: theme.spacing(2, 2.5),
    borderRadius: theme.shape.borderRadiusLarge,
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.primary,
    lineHeight: 1.55,
    marginTop: theme.spacing(1.75),
    background: prominent ? theme.palette.background.paper : theme.palette.secondary.light,
    border: prominent ? `1px solid ${theme.palette.secondary.border}` : 'none',
    borderLeft: `${prominent ? 4 : 3}px solid ${theme.palette.primary.main}`,
    '& strong': { color: theme.palette.primary.main },
    '& .title': {
        fontWeight: 700,
        color: theme.palette.primary.main,
        fontSize: theme.fontSizes.smallBody,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        marginBottom: theme.spacing(0.75),
    },
    '& ul': { margin: theme.spacing(0.75, 0, 0), paddingLeft: theme.spacing(2.5) },
    '& li': { margin: theme.spacing(0.5, 0) },
    '& .actions': {
        marginTop: theme.spacing(1.25),
        display: 'flex',
        gap: theme.spacing(0.75),
    },
}));

const ChangeMyMind = ({ card }: { card: ChangeMyMindCard }) => {
    if (card.style === 'simple') {
        return (
            <IfWrong prominent={false}>
                <strong>If this is wrong:</strong> {card.body}
            </IfWrong>
        );
    }
    return (
        <IfWrong prominent>
            <div className='title'>What would change my mind</div>
            Without a live control, this hypothesis rests more on correlation than causation. It
            weakens if:
            <ul>
                {card.bullets?.map((b, i) => (
                    <li key={i}>{b}</li>
                ))}
            </ul>
            {card.actions ? (
                <div className='actions'>
                    {card.actions.map((a) => (
                        <Button key={a.id} size='small' variant='outlined'>
                            {a.label}
                        </Button>
                    ))}
                </div>
            ) : null}
        </IfWrong>
    );
};

export interface IncidentSummaryProps {
    incident: Incident;
}

export const IncidentSummary = ({ incident }: IncidentSummaryProps) => (
    <>
        <SummaryPaper>
            <SectionHead>
                <h3>Summary</h3>
            </SectionHead>
            <SummaryText>{incident.summary}</SummaryText>
        </SummaryPaper>
        <ChangeMyMind card={incident.changeMyMind} />
    </>
);
