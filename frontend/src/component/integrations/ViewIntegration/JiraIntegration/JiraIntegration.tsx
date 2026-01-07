import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { Divider, styled } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import cr from './assets/cr.png';
import connect from './assets/connect.png';
import manage from './assets/manage.png';
import { JiraImageContainer } from './JiraImageContainer.tsx';
import { IntegrationHowToSection } from 'component/integrations/IntegrationHowToSection/IntegrationHowToSection';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledGrayContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

const StyledLink = styled('a')({
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
});

export const JIRA_INFO = {
    name: 'jira',
    displayName: 'Jira',
    description:
        'Create, connect, manage, and approve Unleash feature flags directly from Jira.',
    documentationUrl:
        'https://docs.getunleash.io/integrate/jira-cloud-plugin-installation',
    howTo: `  - Create a new feature flag directly within Jira, or connect existing flags to any Jira issue.
  - Keep track of your flag status for each environment.
  - Activate/deactivate feature flags directly within Jira.
  - Initiate change requests when guarded flags are activated/deactivated within Jira.`,
};

export const JiraIntegration = () => {
    const { displayName, description, documentationUrl } = JIRA_INFO;

    return (
        <FormTemplate
            title={`${displayName}`}
            description={description || ''}
            documentationLink={documentationUrl}
            documentationLinkLabel='Jira documentation'
        >
            <StyledContainer>
                <IntegrationHowToSection provider={JIRA_INFO} />
                <StyledGrayContainer>
                    <StyledLink
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://marketplace.atlassian.com/apps/1231447/unleash-enterprise-for-jira'
                    >
                        View plugin on Atlassian marketplace{' '}
                        <LaunchIcon
                            fontSize='inherit'
                            sx={{
                                verticalAlign: 'middle',
                                marginBottom: '2px',
                            }}
                        />
                    </StyledLink>
                </StyledGrayContainer>
                <Divider />
                <JiraImageContainer
                    title={'Manage your feature flags for each environment'}
                    description={
                        'View your feature flag status for each of your environments. Quickly turn features on and off directly within Jira.'
                    }
                    src={manage}
                />
                <Divider />
                <JiraImageContainer
                    title={'Connect your feature flags to any Jira issue'}
                    description={
                        'Link as many feature flags as you want to any issue. Create new feature flags directly within Jira.'
                    }
                    src={connect}
                />
                <Divider />
                <JiraImageContainer
                    title={'Automatically initiate change requests'}
                    description={
                        'Automatically initiate change requests when you activate a guarded flag. You’ll receive a link inside Jira to review, approve, and apply the change.'
                    }
                    src={cr}
                />
            </StyledContainer>
        </FormTemplate>
    );
};
