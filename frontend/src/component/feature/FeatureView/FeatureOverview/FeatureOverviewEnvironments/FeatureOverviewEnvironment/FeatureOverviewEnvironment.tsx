import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    styled,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { IFeatureEnvironment } from 'interfaces/featureToggle';
import { getFeatureMetrics } from 'utils/getFeatureMetrics';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import EnvironmentAccordionBody from './EnvironmentAccordionBody/EnvironmentAccordionBody';
import { EnvironmentFooter } from './EnvironmentFooter/EnvironmentFooter';
import FeatureOverviewEnvironmentMetrics from './FeatureOverviewEnvironmentMetrics/FeatureOverviewEnvironmentMetrics';
import { FeatureStrategyMenu } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/FeatureStrategyMenu';
import { LegacyFeatureStrategyMenu } from 'component/feature/FeatureStrategy/FeatureStrategyMenu/LegacyFeatureStrategyMenu';
import { FEATURE_ENVIRONMENT_ACCORDION } from 'utils/testIds';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { FeatureStrategyIcons } from 'component/feature/FeatureStrategy/FeatureStrategyIcons/FeatureStrategyIcons';
import { useGlobalLocalStorage } from 'hooks/useGlobalLocalStorage';
import { Badge } from 'component/common/Badge/Badge';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IFeatureOverviewEnvironmentProps {
    env: IFeatureEnvironment;
}

const StyledFeatureOverviewEnvironment = styled('div', {
    shouldForwardProp: prop => prop !== 'enabled',
})<{ enabled: boolean }>(({ theme, enabled }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(2),
    backgroundColor: enabled
        ? theme.palette.background.paper
        : theme.palette.envAccordion.disabled,
}));

const StyledAccordion = styled(Accordion)({
    boxShadow: 'none',
    background: 'none',
});

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    boxShadow: 'none',
    padding: theme.spacing(2, 4),
    [theme.breakpoints.down(400)]: {
        padding: theme.spacing(1, 2),
    },
}));

const StyledAccordionDetails = styled(AccordionDetails, {
    shouldForwardProp: prop => prop !== 'enabled',
})<{ enabled: boolean }>(({ theme }) => ({
    padding: theme.spacing(3),
    background: theme.palette.envAccordion.expanded,
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'inset 0px 2px 4px rgba(32, 32, 33, 0.05)', // replace this with variable

    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2, 1),
    },
}));

const StyledEnvironmentAccordionBody = styled(EnvironmentAccordionBody)(
    ({ theme }) => ({
        width: '100%',
        position: 'relative',
        paddingBottom: theme.spacing(2),
    })
);

const StyledHeader = styled('div', {
    shouldForwardProp: prop => prop !== 'enabled',
})<{ enabled: boolean }>(({ theme, enabled }) => ({
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    color: enabled ? theme.palette.text.primary : theme.palette.text.secondary,
}));

const StyledHeaderTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down(560)]: {
        flexDirection: 'column',
        textAlign: 'center',
    },
}));

const StyledEnvironmentIcon = styled(EnvironmentIcon)(({ theme }) => ({
    [theme.breakpoints.down(560)]: {
        marginBottom: '0.5rem',
    },
}));

const StyledStringTruncator = styled(StringTruncator)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightMedium,
    [theme.breakpoints.down(560)]: {
        textAlign: 'center',
    },
}));

/**
 * @deprecated
 */
const LegacyStyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginLeft: '1.8rem',
    [theme.breakpoints.down(560)]: {
        flexDirection: 'column',
        marginLeft: '0',
    },
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    gap: theme.spacing(2),
    flexWrap: 'wrap',
    [theme.breakpoints.down(560)]: {
        flexDirection: 'column',
    },
}));

const FeatureOverviewEnvironment = ({
    env,
}: IFeatureOverviewEnvironmentProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const { feature } = useFeature(projectId, featureId);
    const { value: globalStore } = useGlobalLocalStorage();
    const { uiConfig } = useUiConfig();
    const strategySplittedButton = uiConfig?.flags?.strategySplittedButton;

    const featureMetrics = getFeatureMetrics(feature?.environments, metrics);
    const environmentMetric = featureMetrics.find(
        featureMetric => featureMetric.environment === env.name
    );
    const featureEnvironment = feature?.environments.find(
        featureEnvironment => featureEnvironment.name === env.name
    );

    return (
        <ConditionallyRender
            condition={
                !Boolean(new Set(globalStore.hiddenEnvironments).has(env.name))
            }
            show={
                <StyledFeatureOverviewEnvironment enabled={env.enabled}>
                    <StyledAccordion
                        data-testid={`${FEATURE_ENVIRONMENT_ACCORDION}_${env.name}`}
                        className={`environment-accordion ${
                            env.enabled ? '' : 'accordion-disabled'
                        }`}
                    >
                        <StyledAccordionSummary
                            expandIcon={<ExpandMore titleAccess="Toggle" />}
                        >
                            <StyledHeader data-loading enabled={env.enabled}>
                                <StyledHeaderTitle>
                                    <StyledEnvironmentIcon
                                        enabled={env.enabled}
                                    />
                                    <div>
                                        <StyledStringTruncator
                                            text={env.name}
                                            maxWidth="100"
                                            maxLength={15}
                                        />
                                    </div>
                                    <ConditionallyRender
                                        condition={!env.enabled}
                                        show={
                                            <Badge
                                                color="neutral"
                                                sx={{ ml: 1 }}
                                            >
                                                Disabled
                                            </Badge>
                                        }
                                    />
                                </StyledHeaderTitle>
                                <ConditionallyRender
                                    condition={Boolean(strategySplittedButton)}
                                    show={
                                        <StyledButtonContainer>
                                            <FeatureStrategyMenu
                                                label="Add strategy"
                                                projectId={projectId}
                                                featureId={featureId}
                                                environmentId={env.name}
                                                variant="outlined"
                                                size="small"
                                            />
                                            <FeatureStrategyIcons
                                                strategies={
                                                    featureEnvironment?.strategies
                                                }
                                            />
                                        </StyledButtonContainer>
                                    }
                                    elseShow={
                                        <LegacyStyledButtonContainer>
                                            <LegacyFeatureStrategyMenu
                                                label="Add strategy"
                                                projectId={projectId}
                                                featureId={featureId}
                                                environmentId={env.name}
                                                variant="text"
                                            />
                                            <FeatureStrategyIcons
                                                strategies={
                                                    featureEnvironment?.strategies
                                                }
                                            />
                                        </LegacyStyledButtonContainer>
                                    }
                                />
                            </StyledHeader>

                            <FeatureOverviewEnvironmentMetrics
                                environmentMetric={environmentMetric}
                                disabled={!env.enabled}
                            />
                        </StyledAccordionSummary>

                        <StyledAccordionDetails enabled={env.enabled}>
                            <StyledEnvironmentAccordionBody
                                featureEnvironment={featureEnvironment}
                                isDisabled={!env.enabled}
                                otherEnvironments={feature?.environments
                                    .map(({ name }) => name)
                                    .filter(name => name !== env.name)}
                            />
                            <ConditionallyRender
                                condition={
                                    (featureEnvironment?.strategies?.length ||
                                        0) > 0
                                }
                                show={
                                    <>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                py: 1,
                                            }}
                                        >
                                            <ConditionallyRender
                                                condition={Boolean(
                                                    strategySplittedButton
                                                )}
                                                show={
                                                    <FeatureStrategyMenu
                                                        label="Add strategy"
                                                        projectId={projectId}
                                                        featureId={featureId}
                                                        environmentId={env.name}
                                                    />
                                                }
                                                elseShow={
                                                    <LegacyFeatureStrategyMenu
                                                        label="Add strategy"
                                                        projectId={projectId}
                                                        featureId={featureId}
                                                        environmentId={env.name}
                                                    />
                                                }
                                            />
                                        </Box>
                                        <EnvironmentFooter
                                            environmentMetric={
                                                environmentMetric
                                            }
                                        />
                                    </>
                                }
                            />
                        </StyledAccordionDetails>
                    </StyledAccordion>
                </StyledFeatureOverviewEnvironment>
            }
        />
    );
};

export default FeatureOverviewEnvironment;
