import FormTemplate from '../../common/FormTemplate/FormTemplate';
import { Divider, styled } from '@mui/material';

import { IntegrationIcon } from '../IntegrationList/IntegrationIcon/IntegrationIcon';
import cr from 'assets/img/jira/cr.png';
import connect from 'assets/img/jira/connect.png';
import manage from 'assets/img/jira/manage.png';
import React from 'react';
import { JiraImageContainer } from './JiraImageContainer';

export const StyledContainer = styled('p')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const StyledGrayContainer = styled('p')(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const StyledIconLine = styled('p')(({ theme }) => ({
    display: 'flex',
    marginLeft: theme.spacing(1),
    alignItems: 'center',
}));

export const StyledLink = styled('a')({
    textDecoration: 'none',
});

export const JIRA_INFO = {
    name: 'jira',
    displayName: 'Jira',
    description:
        'Create, connect, manage, and approve Unleash feature flags directly from Jira',
    documentationUrl:
        'https://docs.getunleash.io/reference/integrations/jira-cloud-plugin-installation',
};

export const JiraIntegration = () => {
    const { name, displayName, description, documentationUrl } = JIRA_INFO;

    return (
        <FormTemplate
            title={`${displayName}`}
            description={description || ''}
            documentationLink={documentationUrl}
            documentationLinkLabel="Jira documentation"
        >
            <StyledContainer>
                <StyledGrayContainer>
                    <StyledIconLine>
                        <IntegrationIcon name={name} /> How does it work?
                    </StyledIconLine>
                    <ul>
                        <li>
                            Create a new feature flag directly within Jira, or
                            connect existing flags to any Jira issue.
                        </li>
                        <li>
                            Keep track of your flag status for each environment.
                        </li>
                        <li>
                            Activate/deactivate feature flags directly within
                            Jira.
                        </li>
                        <li>
                            Initiate change requests when guarded flags are
                            activated/deactivated within Jira.
                        </li>
                    </ul>
                </StyledGrayContainer>
                <StyledGrayContainer>
                    <StyledLink
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://marketplace.atlassian.com/apps/1231447/unleash-enterprise-for-jira"
                    >
                        View plugin on Atlassian marketplace
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
