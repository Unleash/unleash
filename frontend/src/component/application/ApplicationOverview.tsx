import { usePageTitle } from 'hooks/usePageTitle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, Box, Button, Divider, styled } from '@mui/material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useApplicationOverview } from 'hooks/api/getters/useApplicationOverview/useApplicationOverview';
import { ApplicationIssues } from './ApplicationIssues/ApplicationIssues';
import { ApplicationChart } from './ApplicationChart';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import { Badge } from '../common/Badge/Badge';
import { useNavigate } from 'react-router-dom';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useEffect } from 'react';
import { useFeedback } from '../feedbackNew/useFeedback';
import { ReviewsOutlined } from '@mui/icons-material';

const StyledDivider = styled(Divider)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const ApplicationContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1),
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    alignSelf: 'stretch',
}));

const ProjectContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    alignSelf: 'stretch',
}));

const ApplicationHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
}));

const useTracking = () => {
    const { trackEvent } = usePlausibleTracker();
    useEffect(() => {
        trackEvent('sdk-reporting', {
            props: {
                eventType: 'application overview opened',
            },
        });
    }, []);
};

const ApplicationOverview = () => {
    usePageTitle('Applications - Overview');
    useTracking();
    const applicationName = useRequiredPathParam('name');
    const navigate = useNavigate();
    const { data, loading } = useApplicationOverview(applicationName);

    const { openFeedback } = useFeedback('applicationOverview', 'automatic');

    const createFeedbackContext = () => {
        openFeedback({
            title: 'How easy was it to use the application overview page?',
            positiveLabel:
                'What do you like most about the new application overview page?',
            areasForImprovementsLabel:
                'What should be improved on the application overview page?',
        });
    };

    return (
        <ConditionallyRender
            condition={!loading && data.environments.length === 0}
            show={<Alert severity='warning'>No data available.</Alert>}
            elseShow={
                <ApplicationContainer>
                    <ApplicationHeader>
                        <ProjectContainer>
                            Projects using this application
                            {data.projects.map((project) => (
                                <Badge
                                    sx={{ cursor: 'pointer' }}
                                    key={project}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/projects/${project}`);
                                    }}
                                    color='secondary'
                                    icon={<TopicOutlinedIcon />}
                                >
                                    {project}
                                </Badge>
                            ))}
                        </ProjectContainer>
                        <Button
                            startIcon={<ReviewsOutlined />}
                            variant='outlined'
                            onClick={createFeedbackContext}
                            size='small'
                        >
                            Provide feedback
                        </Button>
                    </ApplicationHeader>

                    <StyledDivider />
                    <ApplicationIssues application={data} />
                    <ApplicationChart data={data} />
                </ApplicationContainer>
            }
        />
    );
};

export default ApplicationOverview;
