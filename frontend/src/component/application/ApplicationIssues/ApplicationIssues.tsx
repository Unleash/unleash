import { Box, styled } from '@mui/material';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';
import { WarningAmberRounded } from '@mui/icons-material';
import { ApplicationOverviewIssuesSchema } from 'openapi';

const WarningContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: theme.spacing(8),
}));

const WarningHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2, 3, 2, 3),
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    alignSelf: 'stretch',
    borderRadius: `${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px 0 0`,
    border: `1px solid ${theme.palette.warning.border}`,
    background: theme.palette.warning.light,
}));

const SmallText = styled(Box)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const WarningHeaderText = styled(SmallText)(({ theme }) => ({
    color: theme.palette.warning.dark,
    fontWeight: theme.fontWeight.bold,
}));

const StyledList = styled('ul')(({ theme }) => ({
    padding: theme.spacing(0, 0, 0, 2),
}));

const StyledListElement = styled('li')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.smallBody,
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
                                <SmallText>{resolveIssueText(issue)}</SmallText>
                                <StyledList>
                                    {issue.items.map((item) => (
                                        <StyledListElement key={item}>
                                            {item}
                                        </StyledListElement>
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
