// frontend/src/component/incidents/pages/IncidentDetail.tsx
import { styled, Paper } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { usePageTitle } from 'hooks/usePageTitle';
import useToast from 'hooks/useToast';
import { getIncidentById } from '../mockData.ts';
import { IncidentHero } from '../components/IncidentHero.tsx';
import { IncidentSummary } from '../components/IncidentSummary.tsx';
import { CohortChart } from '../components/CohortChart.tsx';
import { SuspectsSection } from '../components/SuspectsSection.tsx';
import { IncidentEventsList } from '../components/IncidentEventsList.tsx';
import { IncidentSources } from '../components/IncidentSources.tsx';
import { DismissReportButton } from '../components/DismissReportButton.tsx';

const PageWrap = styled('div')(({ theme }) => ({ padding: theme.spacing(2, 0) }));

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
}));

const HeaderLeft = styled('div')(() => ({ flex: 1, minWidth: 0 }));

const Breadcrumb = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
    '& a': { color: theme.palette.primary.main, textDecoration: 'none' },
}));

const Title = styled('h1')(({ theme }) => ({
    ...theme.typography.h1,
    margin: theme.spacing(0.5, 0, 1),
    color: theme.palette.text.primary,
}));

const ChartPaper = styled(Paper)(({ theme }) => ({
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

const Methodology = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.25, 1.75),
    background: theme.palette.warning.light,
    border: `1px solid ${theme.palette.warning.border}`,
    borderRadius: theme.shape.borderRadiusMedium,
    marginBottom: theme.spacing(1.5),
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.warning.dark,
    lineHeight: 1.5,
    '&::before': { content: '"ⓘ"', fontWeight: 700, fontSize: 14 },
}));

const NotFound = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export const IncidentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const incident = getIncidentById(id);
    const { setToastData } = useToast();
    usePageTitle(incident ? `Incident #${incident.id}` : 'Incident not found');

    if (!incident) {
        return <NotFound>Incident not found.</NotFound>;
    }

    const toast = (text: string) => setToastData({ type: 'success', text, show: true });

    return (
        <PageWrap>
            <Header>
                <HeaderLeft>
                    <Breadcrumb><Link to='/incidents'>Incidents</Link>  /  #{incident.id}</Breadcrumb>
                    <Title>{incident.service} incident</Title>
                </HeaderLeft>
                <DismissReportButton onClick={() => toast('Incident dismissed (mock)')} />
            </Header>

            <IncidentHero
                incident={incident}
                onAction={(actionId) => toast(`Action: ${actionId} (mock)`)}
                onFeedback={() => toast('Feedback sent — thank you (mock)')}
            />
            <IncidentSummary incident={incident} />

            <ChartPaper>
                <SectionHead>
                    <h3>{incident.hasLiveControl ? 'Cohort comparison' : 'Error rate vs baseline'}</h3>
                    <span className='aux'>{incident.hasLiveControl ? 'exposed vs control' : 'no live control — baseline comparison'}</span>
                </SectionHead>
                {incident.methodologyBanner ? <Methodology><div>{incident.methodologyBanner}</div></Methodology> : null}
                <CohortChart cohort={incident.cohort} events={incident.events} />
            </ChartPaper>

            <SuspectsSection incident={incident} />
            <IncidentEventsList incident={incident} />
            <IncidentSources incident={incident} />
        </PageWrap>
    );
};
