import { Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getActiveIncidents } from '../mockData.ts';

const Banner = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.75),
    padding: theme.spacing(1.5, 2),
    background: theme.palette.error.light,
    border: `1px solid ${theme.palette.error.border}`,
    borderLeft: `4px solid ${theme.palette.error.main}`,
    borderRadius: theme.shape.borderRadiusMedium,
    marginBottom: theme.spacing(1.75),
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
        borderColor: theme.palette.error.main,
        transform: 'translateX(2px)',
    },
}));

const PulseDot = styled('span')(({ theme }) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: theme.palette.error.main,
    boxShadow: `0 0 0 4px ${theme.palette.error.border}`,
    animation: 'banner-pulse 2s infinite',
    flexShrink: 0,
    '@keyframes banner-pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
    },
}));

const Body = styled('div')(() => ({ flex: 1, lineHeight: 1.4 }));

const Title = styled('div')(({ theme }) => ({
    fontWeight: 700,
    color: theme.palette.error.dark,
    fontSize: theme.fontSizes.bodySize,
}));

const Sub = styled('div')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: 2,
}));

const FlagInline = styled('code')(({ theme }) => ({
    fontFamily: 'ui-monospace, monospace',
    background: theme.palette.error.light,
    color: theme.palette.error.dark,
    padding: '0 5px',
    borderRadius: 3,
    fontSize: theme.fontSizes.smallBody,
}));

const CTA = styled(Button)(({ theme }) => ({
    background: theme.palette.error.main,
    color: theme.palette.common.white,
    fontWeight: 600,
    padding: theme.spacing(0.75, 1.75),
    '&:hover': {
        background: theme.palette.error.dark,
        color: theme.palette.common.white,
    },
}));

export const IncidentDashboardBanner = () => {
    const navigate = useNavigate();
    const active = getActiveIncidents();

    if (active.length === 0) return null;

    if (active.length === 1) {
        const i = active[0];
        const go = () => navigate(`/incidents/${i.id}`);
        return (
            <Banner onClick={go}>
                <PulseDot />
                <Body>
                    <Title>Active incident in {i.service}</Title>
                    <Sub>
                        {i.verdict.kind === 'none' ? (
                            <>No cause identified · started {i.startedAt}</>
                        ) : (
                            <>
                                {i.verdict.kind === 'likely'
                                    ? 'Likely cause'
                                    : 'Possibly caused by'}
                                : <FlagInline>{i.verdict.flag}</FlagInline>
                                {i.verdict.confidence
                                    ? ` · ${i.verdict.confidence}% confidence`
                                    : ''}{' '}
                                · started {i.startedAt}
                            </>
                        )}
                    </Sub>
                </Body>
                <CTA variant='contained' size='small' onClick={go}>
                    View incident →
                </CTA>
            </Banner>
        );
    }

    const services = active.map((i) => i.service).join(' · ');
    const go = () => navigate('/incidents?status=active');
    return (
        <Banner onClick={go}>
            <PulseDot />
            <Body>
                <Title>{active.length} active incidents</Title>
                <Sub>{services}</Sub>
            </Body>
            <CTA variant='contained' size='small' onClick={go}>
                View all →
            </CTA>
        </Banner>
    );
};
