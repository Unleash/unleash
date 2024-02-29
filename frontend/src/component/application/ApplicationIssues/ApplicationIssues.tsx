import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { WarningAmberRounded } from '@mui/icons-material';
import { ApplicationOverviewIssuesSchema } from 'openapi';
import { Link } from 'react-router-dom';
import {
    CREATE_FEATURE,
    CREATE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';

const WarningContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    fontSize: theme.fontSizes.smallBody,
}));

const WarningHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3, 2, 3),
    alignItems: 'center',
    gap: theme.spacing(1.5),
    alignSelf: 'stretch',
    borderRadius: `${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px 0 0`,
    border: `1px solid ${theme.palette.warning.border}`,
    background: theme.palette.warning.light,
    color: theme.palette.warning.main,
}));

const WarningHeaderText = styled(Box)(({ theme }) => ({
    color: theme.palette.warning.dark,
    fontWeight: theme.fontWeight.bold,
}));

const StyledList = styled('ul')(({ theme }) => ({
    padding: theme.spacing(0, 0, 0, 2),
}));

const StyledListElement = styled('li')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const IssueContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(3),
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: theme.spacing(3),
    borderRadius: ` 0 0 ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`,
    border: `1px solid ${theme.palette.warning.border}`,
}));

const IssueTextContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: theme.spacing(0.5),
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
}));

const IssueRowContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1.5),
    alignItems: 'center',
}));

const StyledLink = styled(Link)(() => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textDecoration: 'underline',
}));

export interface IApplicationIssuesProps {
    issues: ApplicationOverviewIssuesSchema[];
}

const resolveIssueText = (issue: ApplicationOverviewIssuesSchema) => {
    const issueCount = issue.items.length;
    let issueText = '';

    switch (issue.type) {
        case 'missingFeatures':
            issueText = `feature flag${issueCount !== 1 ? 's' : ''}`;
            break;
        case 'missingStrategies':
            issueText = `strategy type${issueCount !== 1 ? 's' : ''}`;
            break;
    }

    return `We detected ${issueCount} ${issueText} defined in the SDK that ${
        issueCount !== 1 ? 'do' : 'does'
    } not exist in Unleash`;
};

export const ApplicationIssues = ({ issues }: IApplicationIssuesProps) => {
    const { hasAccess } = useContext(AccessContext);
    return (
        <ConditionallyRender
            condition={issues.length > 0}
            show={
                <WarningContainer>
                    <WarningHeader>
                        <WarningAmberRounded />
                        <WarningHeaderText>
                            We detected {issues.length} issues in this
                            application
                        </WarningHeaderText>
                    </WarningHeader>
                    <IssueContainer>
                        {issues.map((issue) => (
                            <IssueTextContainer key={issue.type}>
                                {resolveIssueText(issue)}
                                <StyledList>
                                    {issue.items.map((item) => (
                                        <IssueRowContainer>
                                            <StyledListElement key={item}>
                                                {item}
                                            </StyledListElement>
                                            <ConditionallyRender
                                                condition={
                                                    issue.type ===
                                                        'missingFeatures' &&
                                                    hasAccess(CREATE_FEATURE)
                                                }
                                                show={
                                                    <StyledLink
                                                        key={item}
                                                        to={`/projects/default/create-toggle?name=${item}`}
                                                    >
                                                        Create feature flag
                                                    </StyledLink>
                                                }
                                            />
                                            <ConditionallyRender
                                                condition={
                                                    issue.type ===
                                                        'missingStrategies' &&
                                                    hasAccess(CREATE_STRATEGY)
                                                }
                                                show={
                                                    <StyledLink
                                                        key={item}
                                                        to={`/strategies/create`}
                                                    >
                                                        Create strategy type
                                                    </StyledLink>
                                                }
                                            />
                                        </IssueRowContainer>
                                    ))}
                                </StyledList>
                            </IssueTextContainer>
                        ))}
                    </IssueContainer>
                </WarningContainer>
            }
        />
    );
};
