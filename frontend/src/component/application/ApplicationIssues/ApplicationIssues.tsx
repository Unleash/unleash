import { Box, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import type { ApplicationOverviewSchema } from 'openapi';
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
    application: ApplicationOverviewSchema;
}

export interface IFeaturesMissingProps {
    features: string[];
}

interface IStrategiesMissingProps {
    strategies: string[];
}

interface IOutdatedSDKsProps {
    sdks: string[];
}

type ApplicationIssues =
    | {
          applicationMode: 'success';
      }
    | {
          applicationMode: 'warning';
          issueCount: number;
          outdatedSdks: string[];
          missingFeatures: string[];
      };

const FeaturesMissing = ({ features }: IFeaturesMissingProps) => {
    const { hasAccess } = useContext(AccessContext);
    const length = features.length;

    if (length === 0) {
        return null;
    }

    return (
        <IssueTextContainer>
            <Box>{`We detected ${length} feature flag${
                length !== 1 ? 's' : ''
            } defined in the SDK that ${
                length !== 1 ? 'do' : 'does'
            } not exist in Unleash`}</Box>
            <StyledList>
                {features.map((feature) => (
                    <IssueRowContainer key={feature}>
                        <StyledListElement>{feature}</StyledListElement>
                        <ConditionallyRender
                            condition={hasAccess(CREATE_FEATURE)}
                            show={
                                <StyledLink
                                    key={feature}
                                    to={`/projects/default?create=true&name=${feature}`}
                                >
                                    Create feature flag
                                </StyledLink>
                            }
                        />
                    </IssueRowContainer>
                ))}
            </StyledList>
        </IssueTextContainer>
    );
};

const StrategiesMissing = ({ strategies }: IStrategiesMissingProps) => {
    const { hasAccess } = useContext(AccessContext);
    const length = strategies.length;

    if (length === 0) {
        return null;
    }
    return (
        <IssueTextContainer>
            <Box>{`We detected ${length} strategy type${
                length !== 1 ? 's' : ''
            } defined in the SDK that ${
                length !== 1 ? 'do' : 'does'
            } not exist in Unleash`}</Box>
            <StyledList>
                {strategies.map((strategy) => (
                    <IssueRowContainer key={strategy}>
                        <StyledListElement>{strategy}</StyledListElement>
                        <ConditionallyRender
                            condition={hasAccess(CREATE_STRATEGY)}
                            show={
                                <StyledLink
                                    key={strategy}
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
    );
};

const OutdatedSDKs = ({ sdks }: IOutdatedSDKsProps) => {
    if (sdks.length === 0) {
        return null;
    }
    return (
        <IssueTextContainer>
            <Box>We detected the following outdated SDKs</Box>
            <StyledList>
                {sdks.map((sdk) => (
                    <IssueRowContainer key={sdk}>
                        <StyledListElement>{sdk}</StyledListElement>
                    </IssueRowContainer>
                ))}
            </StyledList>
        </IssueTextContainer>
    );
};

export const getApplicationIssues = (
    application: ApplicationOverviewSchema,
): ApplicationIssues => {
    const outdatedSdks = [
        ...new Set(
            application.environments.flatMap((env) => env.issues.outdatedSdks),
        ),
    ];
    const missingFeatures = [
        ...new Set(
            application.environments.flatMap(
                (env) => env.issues.missingFeatures,
            ),
        ),
    ];
    const issueCount =
        outdatedSdks.length +
        missingFeatures.length +
        application.issues.missingStrategies.length;

    return {
        issueCount,
        outdatedSdks,
        missingFeatures,
        applicationMode: issueCount > 0 ? 'warning' : 'success',
    };
};

export const ApplicationIssues = ({ application }: IApplicationIssuesProps) => {
    const mode = getApplicationIssues(application);

    if (mode.applicationMode === 'success') {
        return null;
    }
    const { issueCount, outdatedSdks, missingFeatures } = mode;
    return (
        <WarningContainer>
            <WarningHeader>
                <WarningAmberRounded />
                <WarningHeaderText>
                    We detected {issueCount} issue
                    {issueCount !== 1 ? 's' : ''} in this application
                </WarningHeaderText>
            </WarningHeader>
            <IssueContainer>
                <OutdatedSDKs sdks={outdatedSdks} />
                <FeaturesMissing features={missingFeatures} />
                <StrategiesMissing
                    strategies={application.issues.missingStrategies}
                />
            </IssueContainer>
        </WarningContainer>
    );
};
