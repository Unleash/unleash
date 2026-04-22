import { Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getActiveIncidents } from '../mockData.ts';

const Banner = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.75),
    padding: theme.spacing(1.5, 2),
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    borderLeft: '4px solid #b91c1c',
    borderRadius: 10,
    marginBottom: theme.spacing(1.75),
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
        background: '#fef6f6',
        borderColor: '#b91c1c',
        transform: 'translateX(2px)',
    },
}));

const PulseDot = styled('span')(() => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#b91c1c',
    boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.2)',
    animation: 'banner-pulse 2s infinite',
    flexShrink: 0,
    '@keyframes banner-pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
    },
}));

const Body = styled('div')(() => ({ flex: 1, lineHeight: 1.4 }));

const Title = styled('div')(() => ({ fontWeight: 700, color: '#991b1b', fontSize: 13 }));

const Sub = styled('div')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: 11.5,
    marginTop: 2,
}));

const FlagInline = styled('code')(() => ({
    fontFamily: 'ui-monospace, monospace',
    background: '#fee2e2',
    color: '#991b1b',
    padding: '0 5px',
    borderRadius: 3,
    fontSize: 11,
}));

const CTA = styled(Button)(() => ({
    background: '#b91c1c',
    color: '#fff',
    fontWeight: 600,
    fontSize: 11,
    padding: '6px 12px',
    '&:hover': { background: '#991b1b' },
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
                        {i.verdict.kind === 'none'
                            ? <>No cause identified · started {i.startedAt}</>
                            : <>{i.verdict.kind === 'likely' ? 'Likely cause' : 'Possibly caused by'}: <FlagInline>{i.verdict.flag}</FlagInline>{i.verdict.confidence ? ` · ${i.verdict.confidence}% confidence` : ''} · started {i.startedAt}</>}
                    </Sub>
                </Body>
                <CTA variant='contained' onClick={go}>View incident →</CTA>
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
            <CTA variant='contained' onClick={go}>View all →</CTA>
        </Banner>
    );
};
